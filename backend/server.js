require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const complaintRoutes = require('./routes/complaints');
const checklistRoutes = require('./routes/checklist');
const policyRoutes = require('./routes/policies');
const salaryRoutes = require('./routes/salary');
const kpiRoutes = require('./routes/kpi');
const trainingRoutes = require('./routes/training');
const opsRoutes = require('./ops');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// serve uploaded files (voice notes, policy PDFs, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// serve the frontend (PWA) so the whole app runs from one server/port
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'RIZVI_DREAMS', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/ops', opsRoutes);

// fallback to index.html for any non-API route (so refresh works on the PWA)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'সার্ভারে একটি সমস্যা হয়েছে (Internal server error)' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🟢 RIZVI_DREAMS server চালু হয়েছে`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://<এই-কম্পিউটারের-IP>:${PORT}  (একই WiFi-তে থাকা ফোন/ল্যাপটপ থেকে ব্যবহার করতে)\n`);
});
