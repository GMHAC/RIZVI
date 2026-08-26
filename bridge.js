/**
 * RIZVI পাঞ্চ মেশিন ব্রিজ
 * ------------------------------------------------------------
 * এই স্ক্রিপ্ট ফ্যাক্টরির যে PC-তে চলবে, সেটা:
 *   ১. Port 7700-এ লোকাল নেটওয়ার্কে পাঞ্চ মেশিনের ডাটা শোনে (TCP)
 *   ২. HTTP POST দিয়েও ডাটা নিতে পারে (যদি মেশিন সফটওয়্যার সেটা সাপোর্ট করে)
 *   ৩. প্রতিটা রেকর্ড পার্স করে Firestore-এ rizvi_attendance কালেকশনে লেখে
 *
 * কলাম অর্ডার আপনার আসল মেশিন লগ এক্সপোর্ট থেকে কনফার্ম করা:
 *   Employee Id, Access Control Id, Employee Name, Machine Ip,
 *   Log Date, Log Hour, Log Min, Log Sec
 *
 * ⚠️ সততার সাথে: এই পার্সার আপনার CSV এক্সপোর্ট ফরম্যাট অনুযায়ী বানানো।
 * মেশিনটা লাইভ কানেকশনে ঠিক কী ফরম্যাটে ডাটা পাঠায় (raw TCP-তে) সেটা এই
 * sandbox থেকে টেস্ট করার উপায় নেই (network বন্ধ + আসল মেশিন হাতে নেই)।
 * তাই raw ডাটা না মিললে এটা /logs/unparsed.log-এ সেভ হবে — সেই ফাইলের
 * কয়েক লাইন আমাকে পাঠালেই parser নির্ভুলভাবে ঠিক করে দেব।
 */

const net = require('net');
const http = require('http');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// ---------- কনফিগারেশন ----------
const TCP_PORT = process.env.PUNCH_TCP_PORT || 7700;
const HTTP_PORT = process.env.PUNCH_HTTP_PORT || 7701;
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

// ---------- Firebase Admin SDK বুট ----------
// serviceAccountKey.json ফাইলটা Firebase Console → Project Settings →
// Service accounts → Generate new private key থেকে ডাউনলোড করে এই
// ফোল্ডারে বসাতে হবে (README দ্রষ্টব্য)।
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json পাওয়া যায়নি — README.md দেখুন।');
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(require(serviceAccountPath)) });
const db = admin.firestore();

// ---------- সাহায্যকারী: একটা রেকর্ড Firestore-এ লেখা ----------
async function writeAttendance(rec) {
  const docId = `${rec.emp_id}_${rec.date}_${rec.hour}${rec.min}${rec.sec}`.replace(/[^\w-]/g, '_');
  await db.collection('rizvi_attendance').doc(docId).set({
    emp_id: rec.emp_id,
    access_control_id: rec.access_control_id || '',
    name: rec.name || '',
    machine_ip: rec.machine_ip || '',
    date: rec.date,
    hour: rec.hour, min: rec.min, sec: rec.sec,
    received_at: admin.firestore.FieldValue.serverTimestamp(),
    source: rec.source || 'bridge',
  }, { merge: true });
  console.log(`✅ লেখা হলো: ${rec.emp_id} — ${rec.date} ${rec.hour}:${rec.min}:${rec.sec}`);
}

// ---------- CSV/লাইন পার্সার (কনফার্ম করা কলাম অর্ডার অনুযায়ী) ----------
function parseLine(line) {
  const parts = line.split(',').map(s => s.trim());
  if (parts.length < 8) return null;
  const [emp_id, access_control_id, name, machine_ip, date, hour, min, sec] = parts;
  if (!emp_id || !date) return null;
  return { emp_id, access_control_id, name, machine_ip, date, hour, min, sec, source: 'tcp7700' };
}

function logUnparsed(raw) {
  fs.appendFileSync(path.join(LOG_DIR, 'unparsed.log'), `[${new Date().toISOString()}] ${raw}\n`);
}

// ---------- TCP সার্ভার (Port 7700) ----------
const tcpServer = net.createServer(socket => {
  const addr = socket.remoteAddress;
  console.log(`🔌 মেশিন কানেক্ট করেছে: ${addr}`);
  let buffer = '';
  socket.on('data', chunk => {
    buffer += chunk.toString('utf8');
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      const rec = parseLine(line);
      if (rec) {
        writeAttendance(rec).catch(e => console.error('Firestore write ব্যর্থ:', e.message));
      } else {
        console.warn('⚠️ চেনা ফরম্যাট না, unparsed.log-এ সেভ হলো:', line.slice(0, 80));
        logUnparsed(line);
      }
    }
  });
  socket.on('error', e => console.error('Socket error:', e.message));
  socket.on('close', () => console.log(`🔌 কানেকশন বন্ধ: ${addr}`));
});
tcpServer.listen(TCP_PORT, () => console.log(`✅ TCP bridge শুনছে port ${TCP_PORT}-এ (মেশিনের কানেকশনের অপেক্ষায়)`));

// ---------- HTTP ফলব্যাক (POST JSON বা CSV body) ----------
const httpServer = http.createServer((req, res) => {
  if (req.method !== 'POST') { res.writeHead(404); res.end(); return; }
  let body = '';
  req.on('data', c => body += c);
  req.on('end', async () => {
    try {
      let records = [];
      if (req.headers['content-type']?.includes('application/json')) {
        const data = JSON.parse(body);
        records = Array.isArray(data) ? data.map(d => ({
          emp_id: d.employee_id || d.emp_id, access_control_id: d.access_control_id,
          name: d.name, machine_ip: d.machine_ip, date: d.date,
          hour: d.hour, min: d.min, sec: d.sec, source: 'http',
        })) : [];
      } else {
        records = body.split('\n').map(parseLine).filter(Boolean);
      }
      for (const rec of records) await writeAttendance(rec);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, received: records.length }));
    } catch (e) {
      logUnparsed(body);
      res.writeHead(400); res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  });
});
httpServer.listen(HTTP_PORT, () => console.log(`✅ HTTP fallback শুনছে port ${HTTP_PORT}-এ (POST /)`));

console.log('\n🌹 RIZVI পাঞ্চ ব্রিজ চালু হয়েছে। বন্ধ করতে Ctrl+C চাপুন।\n');
