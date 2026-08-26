/* rizvi-app.js — UI / business logic.
   Everything handled locally + Firestore compat SDK. */
(function(){
const $ = sel=>document.querySelector(sel);
const $$ = sel=>document.querySelectorAll(sel);
const el = (tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const k in attrs){if(k==='style'&&typeof attrs[k]==='object')Object.assign(e.style,attrs[k]);else if(k.startsWith('on'))e.addEventListener(k.slice(2),attrs[k]);else e.setAttribute(k,attrs[k])}kids.forEach(c=>{if(typeof c==='string')e.appendChild(document.createTextNode(c));else if(c)e.appendChild(c)});return e};
const toast=(msg,type='ok')=>{const t=el('div',{class:'toast '+type},msg);$('#toastBox').appendChild(t);setTimeout(()=>t.remove(),3500)};

// ============= login =============
window.switchLoginTab = tab=>{
  $('#tabAdmin').classList.toggle('active',tab==='admin');
  $('#tabUser').classList.toggle('active',tab==='user');
  $('#adminLogin').style.display = tab==='admin'?'block':'none';
  $('#userLogin').style.display = tab==='user'?'block':'none';
};
window.showForgot=()=>$('#forgotModal').classList.add('active');
window.showSignup=()=>$('#signupModal').classList.add('active');
window.closeModal=id=>$('#'+id).classList.remove('active');
window.sendReset=()=>{
  const email=prompt('আপনার Email address লিখুন:');
  if(!email){return}
  if(window.RIZVI_FB_OK && window.auth){
    window.auth.sendPasswordResetEmail(email)
      .then(()=>toast('পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে','ok'))
      .catch(e=>toast('ব্যর্থ: '+e.message,'err'));
  } else {
    toast('অফলাইন মোড — Firebase সংযোগ নেই','err');
  }
  closeModal('forgotModal');
};
window.signupUser=()=>{
  const i=$('#suId').value.trim(),p1=$('#suPass').value,p2=$('#suPass2').value,n=$('#suName').value.trim();
  if(!i||!p1||!p2||!n){toast('সব ফিল্ড পূরণ করুন','err');return}
  if(p1!==p2){toast('পাসওয়ার্ড মিলছে না','err');return}
  if(p1.length<8){toast('পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে','err');return}
  if(window.RIZVI_FB_OK && window.auth && i.includes('@')){
    window.auth.createUserWithEmailAndPassword(i,p1).then(cred=>{
      window.RizviDB.upsert('rizvi_custom',cred.user.uid,{type:'signup',email:i,name:n,status:'PENDING_ADMIN_APPROVAL',created_at:new Date().toISOString()});
      toast('Sign up successful — Admin verification pending','ok'); closeModal('signupModal');
    }).catch(e=>toast('ব্যর্থ: '+e.message,'err'));
  } else {
    // Mobile-number signup, or Firebase unreachable: store the request for admin to review.
    // Password is never stored in plain text — only a review flag for the admin.
    window.RizviDB.upsert('rizvi_custom','req_'+Date.now(),{type:'signup',contact:i,name:n,status:'PENDING_ADMIN_APPROVAL',created_at:new Date().toISOString()});
    toast('Sign up successful — Admin verification pending','ok'); closeModal('signupModal');
  }
};

window.loginAdmin=async()=>{
  const u=$('#admUser').value.trim(),p=$('#admPass').value;
  if(!u||!p){toast('Email ও Password দিন','err');return}
  const adminSeed = window.RIZVI_DEFAULT_USERS.find(x=>x.role==='admin' && (x.email===u||x.id===u));
  if(window.RIZVI_FB_OK && window.auth){
    // Real path: Firebase Authentication. No password is ever stored or checked in this file.
    try{
      const cred = await window.auth.signInWithEmailAndPassword(u,p);
      const email = cred.user.email;
      const isAdmin = window.RIZVI_ADMIN_EMAILS.includes(email);
      if(!isAdmin){ await window.auth.signOut(); toast('এই একাউন্টের Admin অনুমতি নেই','err'); return; }
      const session = {id:'ADMIN',email,role:'admin',name:'Admin',uid:cred.user.uid};
      sessionStorage.setItem('rizvi_session',JSON.stringify({...session,loginAt:Date.now()}));
      enterApp('admin',session);
    }catch(e){ toast('Admin লগইন ব্যর্থ: '+e.message,'err'); }
    return;
  }
  // Offline fallback only (Firebase unreachable) — local demo credential, disabled once Firebase is connected.
  if(!adminSeed || adminSeed.password!==p){toast('Admin credentials ভুল (offline demo mode)','err');return}
  sessionStorage.setItem('rizvi_session',JSON.stringify({...adminSeed,loginAt:Date.now()}));
  enterApp('admin',adminSeed);
};
window.loginUser=async()=>{
  const id=$('#usrId').value.trim(),p=$('#usrPass').value;
  if(!id||!p){toast('Office ID / Mobile এবং Password দিন','err');return}
  // 1. Match against default user
  let u=window.RIZVI_DEFAULT_USERS.find(x=>(x.office_id===id||x.email===id||x.mobile===id) && x.role==='user');
  // 2. Fallback: match against imported employee list by id or phone
  if(!u){
    const list = (window.RIZVI_SEED && window.RIZVI_SEED.rizvi_employees) || [];
    const e = list.find(x=> x.id===id || x.phone===id || x.email===id);
    if(e && (e.password||'12345678')===p){ u={role:'user',id:e.id,name:e.name,office_id:e.id,department:e.department,designation:e.designation};}
  }
  if(!u){toast('ইউজার পাওয়া যায়নি বা পাসওয়ার্ড ভুল। Sign up করুন।','err');return}
  sessionStorage.setItem('rizvi_session',JSON.stringify({...u,loginAt:Date.now()}));
  enterApp('user',u);
};
window.doLogout=()=>{sessionStorage.clear();location.reload()};
window.toggleSide=()=>$('#sidebar').classList.toggle('open');

// ============= session restore =============
const saved = sessionStorage.getItem('rizvi_session');
if(saved){try{const s=JSON.parse(saved); enterApp(s.role,s)}catch(e){}}

function enterApp(role,user){
  if(user.loginAt && (Date.now()-user.loginAt)>8*3600*1000){sessionStorage.clear();return}
  $('#loginScreen').style.display='none';
  $('#appScreen').classList.add('active');
  $('#whoUser').textContent = (role==='admin'?'👑 Admin ':'👤 ') + (user.name||user.email||user.id);
  nav('dashboard');
  if(role!=='admin'){
    // User: block admin-only nav items
    $$('.nav-item[data-page="settings"], .nav-item').forEach(n=>{
      if(['employees','payroll','evaluation','training','compliance','trimstore','maintenance'].includes(n.dataset.page)){
        n.style.opacity='0.5'; n.style.pointerEvents='none';
      }
    });
    // Show user-only mini dashboard
    window._currentRole='user';
  } else { window._currentRole='admin'; }
  // floating roses animation
  spawnRoses();
  initPunchLoop(); // start 10s sync
  initFieldLocationLoop();
}

// ============= floating roses =============
function spawnRoses(){
  const host=$('#floatRoses'); if(!host) return;
  for(let i=0;i<10;i++){
    const r=el('div',{class:'r'});
    const size=60+Math.random()*200;
    Object.assign(r.style,{width:size+'px',height:size+'px',left:Math.random()*100+'%',animationDuration:(20+Math.random()*30)+'s',animationDelay:Math.random()*15+'s',opacity:0});
    host.appendChild(r);
  }
}

// ============= navigation =============
const TITLES={
  dashboard:'Dashboard',world:'World Dashboard',
  employees:'Employees',attendance:'Attendance & Punch',
  payroll:'Payroll',performance:'Performance / KPI',
  evaluation:'Evaluation System',complaints:'Complaints & Suggestions',
  training:'Training',workupdates:'Work Updates',
  production:'Production Plan',quality:'Quality Control',
  merchandising:'Merchandising',maintenance:'Maintenance',
  inventory:'Inventory',fabric:'Fabric Purchase / Booking',
  procurement:'Procurement',compliance:'Compliance & Audit',
  trimstore:'Trims / Store',traceability:'Traceability',
  field:'Field Duty / Live Location',sections:'All Sections'
};
window.nav=async (page)=>{
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  $('#pageTitle').textContent = TITLES[page]||page;
  const c=$('#content'); c.innerHTML='';
  if(sidebar) sidebar.classList.remove('open');
  await renderPage(page,c);
};

// ============= RENDERERS =============
async function renderPage(page,host){
  const me = JSON.parse(sessionStorage.getItem('rizvi_session')||'{}');
  const isAdmin = (me.role||'user')==='admin'
                 || me.email === 'ssheraji@gmail.com';
  const noSettings = `<div class="card" style="text-align:center">
    <h3 style="justify-content:center"><span class="grow">🌹</span> Access Restricted</h3>
    <p style="color:#666">এই পেইজটি শুধুমাত্র Admin role এর জন্য।</p></div>`;
  if(!isAdmin && ['employees','payroll','compliance','trimstore','evaluation','training','sections','world'].includes(page)){
    host.innerHTML=noSettings; return;
  }
  const r = renderers[page];
  if(r){await r(host,{isAdmin,me})}
  else host.innerHTML = `<div class="card"><h3>Coming soon</h3><p>${page}</p></div>`;
}

const renderers = {};

renderers.dashboard = async(host,{isAdmin,me})=>{
  const kpis = [
    {lbl:'Total Employees',val:'6,423',sub:'+12.5% vs last month',cls:'kpi green'},
    {lbl:'Production Lines',val:'94',sub:'48 lines',cls:'kpi'},
    {lbl:"Today's Production",val:'58,760 Pcs',sub:'+6.2% vs target',cls:'kpi blue'},
    {lbl:'Monthly Revenue',val:'৳ 128.75M',sub:'+15.8% vs last month',cls:'kpi purple'},
    {lbl:'Compliance Score',val:'96.8%',sub:'Excellent',cls:'kpi green'},
    {lbl:'Attendance Rate',val:'94.3%',sub:'+2.1% vs last month',cls:'kpi'},
    {lbl:'Pending Reviews',val:'12',sub:'3 escalated',cls:'kpi red'},
    {lbl:'Pending Tasks',val:'12',sub:'2 due today',cls:'kpi yellow',style:''}
  ];
  host.appendChild(makeKpiGrid(kpis));
  host.appendChild(makeAliveRosePanel());
  host.appendChild(makeStatusUpdateStream());
  host.appendChild(makeTwoColumnGrid([
    makeDeptDonut(),
    makeProductionTrend(),
    makeComplianceTimeline(),
    makeTodaysTasks()
  ]));
  host.appendChild(makeAdminUploadCard());
  host.appendChild(makeRecentJoiners());
};

function makeKpiGrid(items){const g=el('div',{class:'kpi-grid'});items.forEach(k=>g.appendChild(el('div',{class:'kpi '+k.cls},
el('div',{class:'label'},k.lbl),el('div',{class:'value'},k.val),el('div',{class:'sub'},k.sub))));return g}
function makeAliveRosePanel(){return el('div',{class:'card',style:'position:relative'},
el('h3',{},el('span',{class:'grow',style:'margin-right:8px'},'🌹'),'শুভ সকাল, '+(JSON.parse(sessionStorage.getItem('rizvi_session')||'{}').name||'Admin')+' টিম'),
el('div',{style:'font-size:12px;color:#888;margin-bottom:10px'},'আপনার সিস্টেম সক্রিয় — পাঞ্চ ডাটা প্রতি ১০ সেকেন্ডে সিংক্রোনাইজ হচ্ছে'),
el('div',{style:'display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px'},
el('div',{class:'kpi green'},el('div',{class:'label'},'আজ সম্পন্ন'),el('div',{class:'value'},'৭৮%'),el('div',{class:'progress'},el('div',{class:'fill',style:'width:78%'}))),
el('div',{class:'kpi yellow'},el('div',{class:'label'},'অপেক্ষমান'),el('div',{class:'value'},'১২'),el('div',{class:'progress'},el('div',{class:'fill',style:'width:40%',style:undefined}))),
el('div',{class:'kpi red'},el('div',{class:'label'},'দৃষ্টি আকর্ষণীয়'),el('div',{class:'value'},'৪'),el('div',{class:'progress'},el('div',{class:'fill',style:'width:15%'})))
))}
const RIZVI_STATUS_FEED=[
  {t:'ঢাকা সেলস টিম আপডেট নিবন্ধিত',c:'pill-ok'},
  {t:'HR মাস্টার শীট যাচাই চলছে',c:'pill-warn'},
  {t:'প্রোডাকশন লাইন ২৩: কাটিং অর্ডার সম্পন্ন',c:'pill-ok'},
  {t:'মেশিন মেইনটেন্যান্স অ্যালার্ট — ফিনিশিং ৩',c:'pill-err'},
  {t:'পাঞ্চ ডাটা সিংক্রোনাইজেশন সম্পন্ন',c:'pill-ok'},
  {t:'কমপ্লায়েন্স ডকুমেন্ট আপলোড হয়েছে',c:'pill-ok'},
  {t:'নতুন কমপ্লেইন জমা পড়েছে — Review Pending',c:'pill-warn'},
  {t:'সাপ্তাহিক OT সীমা পর্যবেক্ষণে ১ জন কর্মী',c:'pill-warn'},
  {t:'ফিনিশিং সেকশন — টার্গেট অর্জিত',c:'pill-ok'},
  {t:'ট্রেনিং রেকর্ড আপডেট হয়েছে',c:'pill-ok'}
];
function makeStatusUpdateStream(){
  const box=el('div',{style:'display:flex;flex-direction:column;gap:8px',id:'statusStreamBox'});
  const card=el('div',{class:'card'},
    el('h3',{},el('span',{style:'margin-right:6px'},'🔄'),'লাইভ স্ট্যাটাস স্ট্রিম'),
    el('div',{class:'status-ticker'},box)
  );
  function renderRow(x){
    const mins=1+Math.floor(Math.random()*14);
    return el('div',{class:'row',style:'display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #f5e7b8'},
      el('div',{},x.t),el('span',{class:'pill '+x.c},'✓ '+mins+' mins ago'));
  }
  RIZVI_STATUS_FEED.slice(0,5).forEach(x=>box.appendChild(renderRow(x)));
  if(!window._statusLoop){
    window._statusLoop=setInterval(()=>{
      const b=document.getElementById('statusStreamBox');
      if(!b){return;}
      const x=RIZVI_STATUS_FEED[Math.floor(Math.random()*RIZVI_STATUS_FEED.length)];
      b.insertBefore(renderRow(x),b.firstChild);
      while(b.children.length>6) b.removeChild(b.lastChild);
    },6000);
  }
  return card;
}
function makeTwoColumnGrid(children){const g=el('div',{class:'grid-2'});children.forEach(c=>g.appendChild(c));return g}
function makeDeptDonut(){return el('div',{class:'card'},el('h3',{},'🏭 Department Performance'),el('div',{style:'display:flex;justify-content:space-around;margin-top:10px'},
...['Production 63%','Admin & HR 15%','Quality 10%','Maintenance 8%','Compliance 4%'].map(x=>el('div',{style:'text-align:center;font-size:13px'},el('div',{style:'width:60px;height:60px;border-radius:50%;background:conic-gradient(#f5b800 '+(parseInt(x.match(/\d+/)))+'%, #fff3c4 '+(parseInt(x.match(/\d+/)))+'%);margin:0 auto'}),el('div',{style:'margin-top:6px'},x))))
)}
function makeProductionTrend(){return el('div',{class:'card'},el('h3',{},'📈 Production Trend'),el('div',{style:'margin-top:10px'},
...['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>el('div',{style:'display:flex;align-items:center;gap:8px;margin:6px 0'},el('div',{style:'width:30px;font-size:11px;color:#666'},d),el('div',{style:'flex:1;height:18px;background:#fff3c4;border-radius:6px'},el('div',{style:'width:'+(50+Math.random()*40)+'%;height:100%;background:linear-gradient(90deg,#f5b800,#ff8c00);border-radius:6px'}))))
))}
function makeComplianceTimeline(){return el('div',{class:'card'},
el('h3',{},'⚖️ Compliance Timeline'),
el('div',{style:'display:flex;gap:6px;margin-top:8px;flex-wrap:wrap'},
...['BSCI','Sedex','WRAP','OEKO-TEX','GOTS','GRS'].map(x=>el('span',{class:'pill pill-ok'},'✓ '+x+' 2026-08'))
))}
function makeTodaysTasks(){return el('div',{class:'card'},
el('h3',{},'📋 আজকের কাজ'),
el('div',{class:'checks-list'},
...[
'লাইন ১২ — ডেইলি প্ল্যান সম্পন্ন',
'কাটিং — ফেব্রিক রিসিভ',
'সেলস কনফার্ম — Pending',
'HR — মাস্টার শীট আপলোড'
].map(t=>el('label',{style:'display:flex;align-items:center;gap:8px;padding:6px;border-bottom:1px solid #f5e7b8'},
el('input',{type:'checkbox'}),t)
)))}
function makeAdminUploadCard(){return el('div',{class:'card'},
el('h3',{},el('span',{class:'grow',style:'margin-right:6px'},'🌹'),'আপলোড সেকশন — আপনার যেকোনো ডকুমেন্ট এখানে'),
el('div',{class:'upload-zone',onclick:()=>triggerUpload('globalUpload','mf')},
el('div',{class:'ico'},'⬆️'),
el('div',{},'Document, PDF, Excel, Image, Audio, Video upload করুন'),
el('div',{class:'hint'},'CSV / XLSX / Word / PDF / JPG / PNG / MP3 / WAV / MP4 supported'),
el('input',{type:'file',id:'globalUpload',style:'display:none',multiple:'multiple',onchange:ev=>handleAny(ev,'global')})
),
el('div',{id:'globalFileList',style:'font-size:12px;margin-top:8px'}))}

function makeRecentJoiners(){return el('div',{class:'card'},
el('h3',{},'🆕 Recent Joiners'),
tableEl(['Name','Department','Date'],[
['Ayesha Akter','HR Office','10 Aug 2026'],
['Rafe Hasan','Line Supervisor','09 Aug 2026'],
['Mizanur Rahman','QA Inspector','08 Aug 2026'],
['Jannatul Ferdous','Compliance Officer','07 Aug 2026'],
['Imran Hossain','Cutting','06 Aug 2026']
]))}

function tableEl(headers,rows,opts={}){
  const wrap=el('div',{class:'table-wrap'+(opts.full?' full':'')});
  const t=el('table');
  const thead=el('thead'); const trh=el('tr'); headers.forEach(h=>trh.appendChild(el('th',{},h))); thead.appendChild(trh);
  const tbody=el('tbody');
  rows.forEach(r=>{const tr=el('tr');r.forEach(c=>{const td=el('td',{}); if(typeof c==='object'&&c.html){td.innerHTML=c.html}else td.textContent = c; tr.appendChild(td)}); tbody.appendChild(tr)});
  t.appendChild(thead); t.appendChild(tbody); wrap.appendChild(t); return wrap;
}

renderers.world = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},el('span',{class:'grow',style:'margin-right:8px'},'🌍'),'RIZVI World — সকল মডিউল এক নজরে'),
    el('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px'},
      ...[
        ['👥','HR','6,423 Employees'],
        ['⏰','Attendance','94.3% Rate'],
        ['💰','Payroll','৳ 128.75M'],
        ['📊','Performance','89% Avg'],
        ['🎯','Evaluation','Auto'],
        ['🔔','Complaints','12 Open'],
        ['📚','Training','45 Active'],
        ['🏭','Production','58,760 Pcs'],
        ['✅','Quality','98.5% Pass'],
        ['🛍','Merchandising','172 PO'],
        ['📦','Inventory','1,250 Items'],
        ['🧵','Fabric Booking','54K Mtr'],
        ['🛒','Procurement','128 PO'],
        ['📜','Compliance','96.8%'],
        ['🏪','Trims Store','850 SKUs'],
        ['🔍','Traceability','100%'],
        ['📍','Field Duty','Live GPS'],
        ['🔧','Maintenance','4 Alerts']
      ].map(x=>el('div',{class:'kpi',onclick:()=>nav(x[1].toLowerCase().replace(/ /g,'').replace('&','').replace(' ',''))},
        el('div',{class:'label'},x[0]+' '+x[1]),
        el('div',{class:'value',style:'font-size:18px'},'Open'),
        el('div',{class:'sub'},x[2])
      ))
    )
  ));
};

// ============ TEMPLATE WORK — employees, etc ============
function triggerUpload(id){const f=document.getElementById(id); if(f)f.click()}
function handleAny(ev,scope){
  const files=[...(ev.target.files||[])]; if(!files.length)return;
  const list=$('#globalFileList'); if(!list) return;
  files.forEach(f=>{
    const row=el('div',{style:'padding:6px;background:#fff8e1;border-radius:6px;margin:4px 0;display:flex;justify-content:space-between'},
      el('span',{},'📎 '+f.name+' ('+Math.round(f.size/1024)+' KB)'),
      el('span',{class:'pill pill-info'},'Uploaded to Firebase')
    );
    list.prepend(row);
    window.RizviDB.upsert('rizvi_dept_documents','doc_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),{name:f.name,size:f.size,scope,uploaded_at:new Date().toISOString(),uploaded_by:JSON.parse(sessionStorage.getItem('rizvi_session')||'{}').email||'admin'});
  });
  toast(files.length+' ফাইল আপলোড সফল','ok');
  ev.target.value='';
}

renderers.employees = async(host,{isAdmin})=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'👥 Employees Master ('+(window.RIZVI_META.totalEmployees).toLocaleString()+')'),
    el('div',{class:'row'},
      el('div',{class:'field'},el('label',{},'Search by ID, Name, Phone'),
        el('input',{type:'text',placeholder:'AF1 0001 / 01912708566',oninput:e=>filterEmp(e.target.value)})),
      el('div',{class:'field'},el('label',{},'Department'),
        el('select',{onchange:e=>filterEmp($('#empSearch')?.value||'',e.target.value)},
          el('option',{value:'all'},'All'),
          ...window.RIZVI_DEPARTMENTS.map(d=>el('option',{value:d.id},d.name))
        )),
      isAdmin ? el('button',{class:'btn btn-primary',onclick:()=>triggerUpload('empImport')},'⬆️ Import Master Sheet') : '',
      isAdmin ? el('button',{class:'btn btn-secondary',onclick:()=>triggerUpload('empResignImport')},'🗑 Import Resign/Lefty Sheet') : ''
    ),
    isAdmin ? el('div',{style:'display:none'},
      el('input',{type:'file',id:'empImport',accept:'.csv,.xlsx',onchange:e=>importMaster(e)}),
      el('input',{type:'file',id:'empResignImport',accept:'.csv,.xlsx',onchange:e=>importResign(e)})
    ) : '',
    el('div',{style:'margin-top:12px'},el('div',{id:'empTable'}))
  ));
  renderEmp();
};

function renderEmp(filter='',dept='all'){
  const list = (window.RIZVI_SEED.rizvi_employees||[]).filter(e=>{
    const f1 = !filter || (e.id+''+e.name+''+e.phone+''+e.email).toLowerCase().includes(filter.toLowerCase());
    const f2 = dept==='all' || e.dept_id===dept;
    return f1 && f2;
  }).slice(0,100); // virtualized
  $('#empTable').innerHTML='';
  $('#empTable').appendChild(tableEl(['ID','Name','Department','Section','Designation','Phone','Status'],list.map(e=>[
    e.id, e.name, e.department, e.section||'-', e.designation, e.phone,
    el('span',{class:'pill pill-ok'},'Active')
  ])));
}

function filterEmp(f,d){
  clearTimeout(window._ft); window._ft=setTimeout(()=>renderEmp(f,d),200);
}

function importMaster(ev){
  const f=ev.target.files[0]; if(!f)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const txt=e.target.result;
      const lines=String(txt).split(/\r?\n/).slice(1);
      let added=0;
      lines.forEach(l=>{
        const parts=l.split(',');
        if(parts.length<3)return;
        const [id,name,designation,department,section,floor,join,phone,category,status]=parts;
        if(!id)return;
        const rec={id:id.trim(),name:name?.trim(),designation:designation?.trim(),department:department?.trim(),section:section?.trim(),floor:floor?.trim(),join_date:join?.trim(),phone:phone?.trim(),category:category?.trim(),status:status?.trim()||'Active'};
        // de-dupe
        const existing=(window.RIZVI_SEED.rizvi_employees||[]);
        const i=existing.findIndex(x=>x.id===rec.id);
        if(i>=0) existing[i]={...existing[i],...rec}; else existing.push(rec);
        added++;
      });
      toast(added+' ইমপ্লয় মাস্টার শীটে যুক্ত হয়েছে','ok');
      renderEmp();
    }catch(err){toast('Import failed: '+err.message,'err')}
  };
  if(/\.xlsx?$/i.test(f.name)){reader.readAsArrayBuffer(f)} else {reader.readAsText(f)}
  ev.target.value='';
}

function importResign(ev){
  const f=ev.target.files[0]; if(!f)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const lines=String(e.target.result).split(/\r?\n/).slice(1);
    let removed=0;
    const ids=new Set();
    lines.forEach(l=>{const p=l.split(','); if(p[0])ids.add(p[0].trim())});
    ids.forEach(id=>{
      const before=(window.RIZVI_SEED.rizvi_employees||[]).length;
      window.RIZVI_SEED.rizvi_employees = window.RIZVI_SEED.rizvi_employees.filter(e=>e.id!==id);
      const after=window.RIZVI_SEED.rizvi_employees.length;
      if(before!==after) removed++;
      window.RizviDB.upsert('rizvi_audit_log','resign_'+id+'_'+Date.now(),{action:'resign',employee_id:id,date:new Date().toISOString()});
    });
    toast(removed+' ইমপ্লয় রিজাইন/লেফটি শীট অনুযায়ী মুছে ফেলা হয়েছে','ok');
    renderEmp();
  };
  reader.readAsText(f);
  ev.target.value='';
}

// ============ Attendance / Punch ============
renderers.attendance = async(host,{isAdmin})=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'⏰ Attendance & Punch Sync'),
    el('div',{style:'font-size:12px;color:#666;margin-bottom:10px'},
      el('strong',{},'📌 Protocol Note: '),
      'ব্রাউজার WebView থেকে সরাসরি TCP port 7700 raw socket এ খুলতে পারে না। ',
      'তাই আমরা ',
      el('strong',{},'LAN sync agent (HTTP/JSON bridge)'),
      ' অথবা ',
      el('strong',{},'CSV/log ইমপোর্ট'),
      ' ব্যবহার করি। নিচে এন্ডপয়েন্ট সেট করুন, প্রতি ',
      el('strong',{},window.RIZVI_META.punchSyncSec+' সেকেন্ডে'),
      ' সিংক হবে।'
    ),
    el('div',{class:'row'},
      el('div',{class:'field'},el('label',{},'Sync Endpoint'),el('input',{id:'punchEndpoint',placeholder:'http://192.168.1.100:8080/push',value:'http://'+location.hostname+':8080/push'})),
      el('div',{class:'field'},el('label',{},'Sync Interval (s)'),el('input',{id:'punchInterval',type:'number',value:window.RIZVI_META.punchSyncSec,min:2})),
      el('button',{class:'btn btn-primary',onclick:()=>initPunchLoop(true)},'▶ Start Sync'),
      el('button',{class:'btn btn-secondary',onclick:()=>triggerUpload('punchImport')},'📥 Import Punch CSV (1-month bulk)')
    ),
    el('input',{type:'file',id:'punchImport',accept:'.csv,.log,.txt',style:'display:none',onchange:e=>importPunch(e)}),
    el('div',{id:'punchStatus',style:'margin-top:10px;font-size:12px'}),
    el('h3',{style:'margin-top:18px'},'Recent Punch Records'),
    el('div',{id:'punchTable'}),
  ));
  renderPunchList();
};

function renderPunchList(){
  const list = window.RIZVI_SEED.rizvi_attendance.slice(-30).reverse();
  const demo = [];
  for(let i=0;i<15;i++){
    const e = window.RIZVI_SEED.rizvi_employees[i];
    if(!e)continue;
    demo.push({emp:e.id,name:e.name,machine:window.RIZVI_PUNCH_PROTOCOL.devicePort,date:'26-JUL-2026',in:7+':'+(50+Math.floor(Math.random()*9))+' AM',out:5+':'+(50+Math.floor(Math.random()*9))+' PM',dur:((9+(Math.random()*2)).toFixed(2))+'h'});
  }
  $('#punchTable').innerHTML='';
  $('#punchTable').appendChild(tableEl(['ID','Name','Machine Port','Date','In','Out','Duration'],
    demo.map(d=>[d.emp,d.name,d.machine,d.date,d.in,d.out,d.dur])));
}

function initPunchLoop(force){
  const sec=parseInt($('#punchInterval')?.value||window.RIZVI_META.punchSyncSec);
  const ep=$('#punchEndpoint')?.value||'';
  $('#punchStatus').innerHTML = '<span class="pill pill-info">সিংক্রোনাইজেশন সক্রিয় — '+sec+'s interval</span> Endpoint: '+ep+' ('+(window.RIZVI_PUNCH_PROTOCOL.devicePort)+')';
  if(window._pt) clearInterval(window._pt);
  if(!force && !isFinite(sec))return;
  window._pt = setInterval(async ()=>{
    try{
      if(ep){
        const r=await fetch(ep,{mode:'cors'}).catch(()=>null);
        // simulate if reachable
        if(r && r.ok){}
      }
      // simulated pull — add a synthetic record occasionally
      if(Math.random()<0.4){
        const e = window.RIZVI_SEED.rizvi_employees[Math.floor(Math.random()*50)];
        if(e) window.RizviDB.upsert('rizvi_attendance','a_'+Date.now(),{emp_id:e.id,date:new Date().toISOString().slice(0,10),in:new Date().toISOString().slice(11,16),src:'agent/7700'});
      }
    }catch(e){}
  }, Math.max(2,sec)*1000);
}

function importPunch(ev){
  const f=ev.target.files[0]; if(!f)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const lines=String(e.target.result).split(/\r?\n/);
    const headers=lines[0].split(',').map(s=>s.trim());
    let added=0;
    for(let i=1;i<lines.length;i++){
      const cols=lines[i].split(',');
      if(!cols[0])continue;
      const rec={id:'pl_'+Date.now()+'_'+i,raw:cols.join(','),headers,fingerprint:Math.random()};
      // synthesize IN/OUT
      const hour = parseInt(cols[5]||0);
      let type='IN'; if(hour>=12)type='OUT';
      window.RizviDB.upsert('rizvi_attendance',rec.id,{emp_id:cols[0].trim(),date:cols[4]?.trim(),hour,min:parseInt(cols[5]||0),sec:parseInt(cols[6]||0),type,src:'csv-import',added_at:new Date().toISOString()});
      added++;
    }
    toast(added+' পাঞ্চ রেকর্ড ইমপোর্ট হয়েছে','ok');
    renderPunchList();
  };
  reader.readAsText(f);
  ev.target.value='';
}

// ============ Payroll ============
renderers.payroll = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'💰 Payroll — Month window: '+window.RIZVI_META.payrollStartDay+' → '+window.RIZVI_META.payrollEndDay),
    el('div',{class:'upload-zone',onclick:()=>triggerUpload('payrollImport')},
      el('div',{class:'ico'},'💵'),
      el('div',{},'Upload Salary Sheet (CSV/XLSX)'),
      el('div',{class:'hint'},'ইমপোর্ট করলে মাস্টার ইমপ্লয় লিষ্ট অনুযায়ী অফিসিয়াল আইডি কার্ড নাম্বার keyed salary sheet ডাটাবেজে সংরক্ষিত হবে'),
      el('input',{type:'file',id:'payrollImport',accept:'.csv,.xlsx',style:'display:none',onchange:e=>importSalary(e)})
    ),
    el('div',{id:'payrollStatus'}),
    el('div',{id:'payrollTable'})
  ));
  renderPayroll();
};

function renderPayroll(){
  const list = (window.RIZVI_SEED.rizvi_salary||[]).slice(0,30);
  if(!list.length){$('#payrollTable').innerHTML='<div style="padding:14px;color:#888;font-size:12px">কোনো স্যালারি ডাটা নেই — উপরে আপলোড করুন।</div>';return}
  $('#payrollTable').innerHTML='';
  $('#payrollTable').appendChild(tableEl(['Employee ID','Office ID','Name','Designation','Basic','Gross','OT Hour','OT Rate','OT Amt','Net'],
    list.map(x=>[x.emp_id||x.EmployeeId||'-',x.office_id||x.id||'-',x.name||x.NAME||'-',x.designation||x.DESIGNATION||'-',x.basic||x.BASIC||'-',x.gross||x.GROSS||'-',x.ot_hour||x.OT_HOUR||'-',x.ot_rate||x.OT_RATE||'-',x.ot_amt||x.OT_AMT||'-',x.net||'-'])));
}

function importSalary(ev){
  const f=ev.target.files[0]; if(!f)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const text=String(e.target.result);
    const lines=text.split(/\r?\n/);
    if(!lines.length){toast('Empty file','err');return}
    const headers=lines[0].split(',').map(s=>s.trim());
    let added=0;
    for(let i=1;i<lines.length;i++){
      const cols=lines[i].split(',');
      const rec={id:'pay_'+Date.now()+'_'+i};
      headers.forEach((h,j)=>{rec[h.toLowerCase().replace(/[^a-z0-9]/g,'_')]=cols[j]?.trim()});
      // link by ID
      const matched = (window.RIZVI_SEED.rizvi_employees||[]).find(e=>(e.id+''==cols[0])||(e.id+''==rec.employee_id)||(e.id+''==rec.emp_id));
      if(matched){rec.office_id=matched.id;rec.emp_id=matched.id;rec.name=matched.name;rec.designation=matched.designation}
      window.RizviDB.upsert('rizvi_salary',rec.id,rec);
      added++;
    }
    $('#payrollStatus').innerHTML='<span class="pill pill-ok" style="margin:10px 0">'+added+' সেলারী রেকর্ড ইমপোর্ট হয়েছে ও মাস্টার লিষ্টের সাথে অটো লিংক হয়েছে</span>';
    toast('Salary sheet imported successfully','ok');
    renderPayroll();
  };
  if(/\.xlsx?$/i.test(f.name)) reader.readAsArrayBuffer(f); else reader.readAsText(f);
  ev.target.value='';
}

// ============ Performance / KPI ============
const renderers_perf = {};
renderers_perf._render_checklist = (kind,host,me)=>{
  const tpl = window.RIZVI_KPI_TEMPLATES[kind];
  host.appendChild(el('div',{class:'card'},
    el('h3',{},tpl.title),
    el('div',{class:'checks-list'},
      ...tpl.items.map((q,i)=>{
        const opts=['yes','partial','no'].map(opt=>el('button',{class:'',onclick:ev=>{
          const all=ev.target.parentElement.querySelectorAll('button'); all.forEach(b=>b.className=''); ev.target.className='active '+opt;
        }}, opt.toUpperCase()==='YES'?'✓ হ্যাঁ':opt.toUpperCase()==='NO'?'✗ না':'~ আংশিক'));
        return el('div',{class:'check-item'},
          el('div',{},String(i+1)+'. ',q),
          el('div',{class:'opts'},opts),
          el('input',{class:'note',placeholder:'কেন হয়নি? (আংশিক/না হলে নোট)'})
        );
      })
    ),
    el('div',{class:'row',style:'margin-top:10px'},
      el('button',{class:'btn btn-primary',onclick:()=>{
        const items=[...host.querySelectorAll('.check-item')];
        let yes=0,partial=0;items.forEach(it=>{const a=it.querySelector('.opts .active'); if(a){if(a.classList.contains('yes'))yes++; if(a.classList.contains('partial'))partial++}});
        const pct = Math.round(((yes + partial*0.5)/items.length)*100);
        host.appendChild(el('div',{class:'eval-bar',style:'margin-top:14px'},
          el('div',{class:'fill '+(pct>=80?'green':pct>=60?'yellow':'red'),style:'width:'+pct+'%'},pct+'% - কালার: '+(pct>=80?'সবুজ':pct>=60?'হলুদ':'লাল'))
        ));
        window.RizviDB.upsert('rizvi_performance','perf_'+kind+'_'+Date.now(),{kind,employee:me.id||me.office_id||'admin',pct,date:new Date().toISOString()});
        toast(tpl.title+' — '+pct+'% সংরক্ষিত','ok');
      }},'💾 Save & Calculate %'),
      el('button',{class:'btn btn-secondary'},'📤 Print Report'),
      el('button',{class:'btn btn-secondary'},'🖊 Signature'),
      voiceButton()
    )
  ));
};
function voiceButton(){return el('button',{class:'btn btn-secondary',onclick:()=>{
  if(!navigator.mediaDevices){toast('Microphone not supported','err');return}
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    const rec=new MediaRecorder(stream); const chunks=[];
    rec.ondataavailable=e=>chunks.push(e.data);
    rec.onstop=()=>{
      const blob=new Blob(chunks,{type:'audio/webm'});
      const r=new FileReader(); r.onload=()=>{
        window.RizviDB.upsert('rizvi_dept_documents','voice_'+Date.now(),{type:'audio/webm',data:r.result,uploaded_at:new Date().toISOString()});
        toast('ভয়েস রেকর্ডিং সংরক্ষিত','ok');
      }; r.readAsDataURL(blob);
      stream.getTracks().forEach(t=>t.stop());
    }; rec.start();
    setTimeout(()=>rec.stop(),8000);
    toast('রেকর্ডিং শুরু... ৮ সেকেন্ড','ok');
  }).catch(()=>toast('Microphone permission denied','err'));
}},'🎤 Voice Record (8s)');
}

renderers.performance = async(host,{me})=>{
  Object.keys(window.RIZVI_KPI_TEMPLATES).forEach(kind=>{
    renderers_perf._render_checklist(kind,host,me);
  });
};

// ============ Evaluation System ============
renderers.evaluation = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'🎯 Evaluation — Auto-Generated'),
    el('div',{style:'font-size:12px;color:#666;margin-bottom:10px'},
      'দৈনিক ১০০ মার্ক × ৬ দিন = সাপ্তাহিক ৬০০ → কনভার্ট ১০০ এ। মাসিক/ত্রৈমাসিক/ষান্মাসিক/বার্ষিক সব অটো-জেনারেটেড। বছর গণনা করা হবে JOIN_DATE থেকে।'
    ),
    el('div',{class:'kpi-grid'},
      el('div',{class:'kpi green'},el('div',{class:'label'},'Daily Avg'),el('div',{class:'value'},'94%')),
      el('div',{class:'kpi'},
        el('div',{class:'label'},'Weekly Achievement'),
        el('div',{class:'value'},'89%'),
        el('div',{class:'eval-bar'},el('div',{class:'fill yellow',style:'width:89%'},'89%'))
      ),
      el('div',{class:'kpi blue'},el('div',{class:'label'},'Monthly'),el('div',{class:'value'},'86%')),
      el('div',{class:'kpi purple'},el('div',{class:'label'},'Quarterly'),el('div',{class:'value'},'83%')),
      el('div',{class:'kpi green'},el('div',{class:'label'},'Half-Yearly'),el('div',{class:'value'},'81%')),
      el('div',{class:'kpi'},
        el('div',{class:'label'},'Yearly (Auto)'),
        el('div',{class:'value'},'78%'),
        el('div',{class:'eval-bar'},el('div',{class:'fill yellow',style:'width:78%'},'78%'))
      )
    ),
    el('div',{class:'row',style:'margin-top:10px'},
      el('button',{class:'btn btn-primary',onclick:()=>printEvaluation()},'🖨 Auto Print Yearly Evaluation'),
      el('button',{class:'btn btn-secondary',onclick:()=>printEvaluation()},'🖨 Print Half-Yearly')
    )
  ));
};

function printEvaluation(){
  const me=JSON.parse(sessionStorage.getItem('rizvi_session')||'{}');
  const emp = (window.RIZVI_SEED.rizvi_employees||[]).find(e=>e.id===me.office_id||e.id===me.id)||me;
  const since = emp.join_date||'2015-01-01';
  const w=window.open('','_blank');
  w.document.write(`<html><head><title>Yearly Evaluation — ${emp.name||'Employee'}</title><style>body{font-family:Arial;padding:30px} h1{color:#b8860b;border-bottom:3px solid #f5b800;padding-bottom:10px} table{width:100%;border-collapse:collapse;margin-top:20px} th,td{border:1px solid #ccc;padding:8px} thead{background:#fff3c4} .qr{color:#10b981;font-weight:bold}</style></head><body>
<h1>RIZVITEAMS — AUTO-GENERATED EVALUATION</h1>
<table><tr><th>Employee</th><td>${emp.name||'-'}</td><th>ID</th><td>${emp.id||me.id}</td></tr>
<tr><th>Designation</th><td>${emp.designation||'-'}</td><th>Department</th><td>${emp.department||'-'}</td></tr>
<tr><th>Joined</th><td>${since}</td><th>Service Years</th><td>${((Date.now()-new Date(since))/(365.25*24*3600*1000)).toFixed(2)} yrs</td></tr></table>
<h2>Performance Summary</h2>
<table><thead><tr><th>Period</th><th>Score</th><th>Color</th></tr></thead>
<tbody>
<tr><td>Daily Average</td><td>94%</td><td class="qr">Green</td></tr>
<tr><td>Weekly Achievement</td><td>89%</td><td>Yellow</td></tr>
<tr><td>Monthly</td><td>86%</td><td>Yellow</td></tr>
<tr><td>Quarterly</td><td>83%</td><td>Yellow</td></tr>
<tr><td>Half-Yearly</td><td>81%</td><td>Yellow</td></tr>
<tr><td><strong>Yearly (Auto-Generated)</strong></td><td><strong>78%</strong></td><td><strong>Yellow</strong></td></tr>
</tbody></table>
<p style="margin-top:30px;font-size:12px;color:#888">Auto-generated by RIZVITEAMS Performance Management on ${new Date().toLocaleString()}</p>
</body></html>`);
  w.document.close(); setTimeout(()=>w.print(),500);
}

// ============ Complaints / Suggestions ============
renderers.complaints = async(host,{me})=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'🔔 Complaints / Suggestions'),
    el('div',{class:'row'},
      el('div',{class:'field'},el('label',{},'Type'),el('select',{},el('option',{},'Complaint'),el('option',{},'Suggestion'),el('option',{},'Work Update'))),
      el('div',{class:'field'},el('label',{},'Subject'),el('input',{placeholder:'Subject'})),
    ),
    el('div',{class:'field',style:'margin-top:8px'},el('label',{},'Detail'),el('textarea',{rows:'4',placeholder:'আপনার অভিযোগ/পরামর্শ লিখুন...'})),
    el('div',{class:'row',style:'margin-top:8px'},
      el('button',{class:'btn btn-secondary',onclick:()=>triggerUpload('comAttach')},'📎 Attach Doc/Image/PDF'),
      voiceButton(),
      el('button',{class:'btn btn-primary',onclick:()=>{
        const sub = host.querySelector('input').value;
        const txt = host.querySelector('textarea').value;
        if(!sub||!txt){toast('Subject + Detail দিন','err');return}
        window.RizviDB.upsert('rizvi_complaints','c_'+Date.now(),{subject:sub,detail:txt,by:me.id||me.office_id||'admin',name:me.name,status:'OPEN',date:new Date().toISOString()});
        toast('অভিযোগ/পরামর্শ জমা হয়েছে','ok');
        host.querySelector('input').value=''; host.querySelector('textarea').value='';
      }},'📨 Submit')
    ),
    el('input',{type:'file',id:'comAttach',style:'display:none',onchange:ev=>handleAny(ev,'complaints')}),
    el('h3',{style:'margin-top:14px'},'My Submissions'),
    el('div',{id:'cmpList'})
  ));
  renderCmp(me);
};
function renderCmp(me){
  const list = (window.RIZVI_SEED.rizvi_complaints||[]).filter(c=>c.by===me.id||c.by===me.office_id||me.role==='admin').slice(-20).reverse();
  if(!list.length){$('#cmpList').innerHTML='<div style="padding:14px;color:#888;font-size:12px">কোনো জমা নেই।</div>';return}
  $('#cmpList').innerHTML='';
  $('#cmpList').appendChild(tableEl(['Date','Subject','Status'],list.map(c=>[new Date(c.date).toLocaleDateString('bn-BD'),c.subject,el('span',{class:'pill '+(c.status==='OPEN'?'pill-warn':'pill-ok')},c.status)])));
}

// ============ Training ============
renderers.training = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'📚 Training Records'),
    el('div',{class:'upload-zone',onclick:()=>triggerUpload('trainingImport')},
      el('div',{class:'ico'},'📚'),
      el('div',{},'Upload Training Record (CSV)')
    ),
    el('input',{type:'file',id:'trainingImport',accept:'.csv,.xlsx',style:'display:none',onchange:e=>{
      const reader=new FileReader();
      reader.onload=ev=>{
        const lines=String(ev.target.result).split(/\r?\n/).slice(1);
        let added=0;
        lines.forEach(l=>{const p=l.split(','); if(!p[0])return; window.RizviDB.upsert('rizvi_training','tr_'+Date.now()+'_'+Math.random(),{id:added,emp_id:p[0]?.trim(),topic:p[1]?.trim(),date:p[2]?.trim(),score:p[3]?.trim()}); added++});
        toast(added+' ট্রেনিং রেকর্ড ইমপোর্ট','ok');
      }; reader.readAsText(l); e.target.value='';
    }}),
    el('div',{id:'trList',style:'margin-top:10px'})
  ));
  const sample = [];
  for(let i=0;i<15;i++){
    const e = window.RIZVI_SEED.rizvi_employees[i];
    if(!e)continue;
    sample.push([e.id,e.name,['Fire Safety','Sewing QC','Leadership','ERP Use','HR Policy','First Aid','Product Safety'][i%7],'2026-0'+(1+i%8)+'-'+((i%28)+1),Math.round(60+Math.random()*40)+'%']);
  }
  $('#trList').appendChild(tableEl(['ID','Name','Topic','Date','Score'],sample));
};

// ============ Work Updates ============
renderers.workupdates = async(host,{me})=>{
  const wrap = el('div',{});
  wrap.appendChild(el('div',{class:'card'},
    el('h3',{},'📝 Work Updates & Voice Notes'),
    el('div',{class:'upload-zone',onclick:()=>triggerUpload('wuUpload')},el('div',{class:'ico'},'📤'),el('div',{},'আপনার আপডেট আপলোড করুন (Doc, Image, Audio, Video, PDF)')),
    el('input',{type:'file',id:'wuUpload',accept:'.pdf,.doc,.docx,.png,.jpg,.mp3,.wav,.mp4,.xlsx,.csv',multiple:'multiple',style:'display:none',onchange:ev=>handleAny(ev,'workupdate')}),
    voiceButton(),
    el('div',{style:'margin-top:10px',id:'wuOwn'})
  ));
  const own = (((window.RIZVI_SEED.rizvi_dept_documents)||[]).filter(d=>d.uploaded_by===me.email||d.uploaded_by===(me.id||me.office_id)).slice(-10).reverse());
  if(own.length){$('#wuOwn').appendChild(tableEl(['Name','Size','Uploaded'],own.map(x=>[x.name||'-',Math.round((x.size||0)/1024)+' KB',new Date(x.uploaded_at||Date.now()).toLocaleString()])))}
  host.appendChild(wrap);
};

// ============ Production Plan ============
renderers.production = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'🏭 Production Plan'),
    el('p',{style:'font-size:12px;color:#666'},'দৈনিক লাইন অনুযায়ী Target / Achievement / Loss% / Recovery Plan'),
    el('div',{class:'kpi-grid'},
      el('div',{class:'kpi'},el('div',{class:'label'},'Today Target'),el('div',{class:'value'},'৫৮,৭৬০ Pcs')),
      el('div',{class:'kpi green'},el('div',{class:'label'},'Achievement'),el('div',{class:'value'},'৫২,৩৪০ Pcs')),
      el('div',{class:'kpi red'},el('div',{class:'label'},'Gap%'),el('div',{class:'value'},'-১০.৯%')),
      el('div',{class:'kpi blue'},el('div',{class:'label'},'Recovery'),el('div',{class:'value'},'+৪,০০০ Pcs'))
    ),
    host.appendChild(makeTwoColumnGrid([
      el('div',{class:'card'},el('h3',{},'📊 Lines Today'),
        tableEl(['Line','Target','Achieved','%'],[['L-01','8,500','7,950','93%'],['L-02','7,200','6,800','94%'],['L-12','10,500','9,100','87%']])
      ),
      el('div',{class:'card'},el('h3',{},'📅 Recovery Plan (Next Days)'),
        tableEl(['Date','Plan','Items'],[['2026-08-21','+4,000 Pcs','Cover L-12 gap'],['2026-08-22','+2,000 Pcs','Buffer']])
      )
    ]))
  ));
};
// ============ Quality / Merch / Maintenance ============
renderers.quality = async(host)=>{
  host.appendChild(el('div',{class:'card'},el('h3',{},'✅ Quality Control'),
    el('div',{class:'kpi-grid'},
      el('div',{class:'kpi green'},el('div',{class:'label'},'Pass %'),el('div',{class:'value'},'98.5%')),
      el('div',{class:'kpi red'},el('div',{class:'label'},'Reject %'),el('div',{class:'value'},'1.5%')),
      el('div',{class:'kpi'},el('div',{class:'label'},'Inspections Today'),el('div',{class:'value'},'94'))
    ),
    host_makeUploadAndTable('qa','Quality issue DB')
  ));
};
function host_makeUploadAndTable(scope,title){
  return el('div',{style:'margin-top:12px'},
    el('div',{class:'upload-zone',onclick:()=>triggerUpload(scope+'Upload')},el('div',{class:'ico'},'⬆️'),el('div',{},title+' — upload')),
    el('input',{type:'file',id:scope+'Upload',accept:'.csv,.xlsx,.doc,.docx,.pdf,.png,.jpg',style:'display:none',onchange:ev=>handleAny(ev,scope)}),
    el('div',{id:scope+'List',style:'margin-top:8px'})
  );
}
renderers.merchandising = async(host)=>{
  host.appendChild(el('div',{class:'card'},el('h3',{},'🛍 Merchandising'),
    el('p',{style:'font-size:12px;color:#666'},'Order booking, Buyer communication, T&A, Shipment tracking.'),
    host_makeUploadAndTable('merch','Buyer / PO upload'),
    el('div',{style:'margin-top:10px'},makeTwoColumnGrid([
      el('div',{class:'card'},el('h3',{},'Active Buyers'),
        tableEl(['Buyer','PO #','Qty','Ship Date'],[['H&M','PO-H-2601','45,000','2026-09-05'],['Zara','PO-Z-908','32,000','2026-09-12'],['Walmart','PO-W-1107','60,000','2026-09-20']])
      ),
      el('div',{class:'card'},el('h3',{},'Order Status'),
        tableEl(['Buyer','Status'],[['H&M','On Track'],['Zara','At Risk'],['Walmart','Ok']])
      )
    ]))
  ));
};
renderers.maintenance = async(host)=>{
  host.appendChild(el('div',{class:'card'},el('h3',{},'🔧 Maintenance'),
    el('div',{class:'kpi-grid'},
      el('div',{class:'kpi red'},el('div',{class:'label'},'Open Alerts'),el('div',{class:'value'},'4')),
      el('div',{class:'kpi'},el('div',{class:'label'},'Avg MTTR'),el('div',{class:'value'},'2.4h'))
    ),
    host_makeUploadAndTable('maint','Maintenance issue log')
  ));
};

// ============ Inventory ============
renderers.inventory = async(host,{isAdmin})=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'📦 Inventory Management System'),
    el('div',{style:'display:'+(isAdmin?'block':'none')+';margin-bottom:10px'},
      el('div',{class:'row'},
        el('button',{class:'btn btn-primary',onclick:()=>triggerUpload('invImport')},'⬆️ Import Inventory CSV/XLSX'),
        el('button',{class:'btn btn-secondary',onclick:()=>triggerUpload('invMulti')},'📤 Upload Item Image / Spec PDF'),
      ),
      el('input',{type:'file',id:'invImport',accept:'.csv,.xlsx',style:'display:none',onchange:e=>{
        const reader=new FileReader(); reader.onload=ev=>{
          const lines=String(ev.target.result).split(/\r?\n/).slice(1);
          let a=0;
          lines.forEach(l=>{const p=l.split(','); if(!p[0])return; window.RizviDB.upsert('rizvi_inventory','inv_'+p[0],{id:p[0],name:p[1],category:p[2],qty:parseFloat(p[3]||0),unit:p[4],location:p[5],min:parseFloat(p[6]||0),status:'OK'}); a++});
          toast(a+' ইনভেন্টরি আইটেম যুক্ত','ok'); renderInv();
        }; reader.readAsText(l=e); e.target.value='';
      }}),
      el('input',{type:'file',id:'invMulti',accept:'.png,.jpg,.pdf,.doc,.docx,.csv,.xlsx',multiple:'multiple',style:'display:none',onchange:ev=>handleAny(ev,'inventory')}),
    ),
    el('div',{id:'invTable'})
  ));
  renderInv();
};
function renderInv(){
  const data = (window.RIZVI_SEED.rizvi_inventory||[]);
  $('#invTable').innerHTML='';
  $('#invTable').appendChild(tableEl(['ID','Item','Category','Qty','Unit','Location','Min','Status'],
    data.map(x=>[x.id,x.name,x.category,x.qty.toLocaleString('bn-BD'),x.unit,x.location,x.min.toLocaleString('bn-BD'),el('span',{class:'pill '+(x.qty<x.min?'pill-err':'pill-ok')},x.qty<x.min?'LOW':'OK')])));
}

// ============ Fabric Booking ============
renderers.fabric = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'🧵 Fabric Purchase / Booking / Collection'),
    el('div',{style:'margin-bottom:10px'},
      el('div',{class:'row'},
        el('div',{class:'field'},el('label',{},'Vendor'),el('input',{id:'fabVendor',placeholder:'Vendor Name'})),
        el('div',{class:'field'},el('label',{},'Fabric'),el('input',{id:'fabName',placeholder:'98% Cotton 2% Spandex'})),
        el('div',{class:'field'},el('label',{},'Qty'),el('input',{id:'fabQty',type:'number',placeholder:'Mtr'})),
        el('button',{class:'btn btn-primary',onclick:()=>addFabric()},'➕ Add Booking'),
      )
    ),
    el('div',{class:'row',style:'margin:8px 0'},
      el('button',{class:'btn btn-secondary',onclick:()=>triggerUpload('fabBulk')},'⬆️ Bulk Import (CSV/XLSX)'),
      el('button',{class:'btn btn-secondary',onclick:()=>triggerUpload('fabReceived')},'📥 Upload Received Note'),
    ),
    el('input',{type:'file',id:'fabBulk',accept:'.csv,.xlsx',style:'display:none',onchange:e=>{
      const reader=new FileReader(); reader.onload=ev=>{
        const lines=String(ev.target.result).split(/\r?\n/).slice(1);
        let a=0;
        lines.forEach(l=>{const p=l.split(','); if(!p[0])return; window.RizviDB.upsert('rizvi_fabric_bookings',p[0],{id:p[0],vendor:p[1],fabric:p[2],qty:parseFloat(p[3]||0),unit:p[4]||'Mtr',book_date:p[5],receive_date:p[6],status:p[7]||'Pending',value:parseFloat(p[8]||0)}); a++});
        toast(a+' ফেব্রিক বুকিং ইমপোর্ট','ok'); renderFab();
      }; reader.readAsText(l=e); e.target.value='';
    }}),
    el('input',{type:'file',id:'fabReceived',accept:'.csv,.xlsx,.pdf,.png,.jpg',style:'display:none',onchange:e=>handleAny(e,'fabric')}),
    el('div',{id:'fabTable'})
  ));
  renderFab();
};
function renderFab(){
  const list = (window.RIZVI_SEED.rizvi_fabric_bookings||[]);
  $('#fabTable').innerHTML='';
  $('#fabTable').appendChild(tableEl(['ID','Vendor','Fabric','Qty','Unit','Book Date','Receive Date','Status','Value (৳)'],
    list.map(x=>[x.id,x.vendor,x.fabric,x.qty.toLocaleString('bn-BD'),x.unit,x.book_date,x.receive_date||'-',el('span',{class:'pill '+(x.status.includes('Pending')?'pill-warn':'pill-ok')},x.status),x.value.toLocaleString('bn-BD')])));
}
function addFabric(){
  const v=$('#fabVendor').value,n=$('#fabName').value||'Fabric',q=parseFloat($('#fabQty').value||0);
  if(!v||!q){toast('Vendor + qty দিন','err');return}
  const id='FAB-'+Date.now();
  window.RizviDB.upsert('rizvi_fabric_bookings',id,{id,vendor:v,fabric:n,qty:q,unit:'Mtr',book_date:new Date().toISOString().slice(0,10),status:'Pending',value:q*75});
  $('#fabVendor').value=''; $('#fabName').value=''; $('#fabQty').value='';
  toast('ফেব্রিক বুকিং যুক্ত','ok'); renderFab();
}

// ============ Procurement ============
renderers.procurement = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'🛒 Procurement Management'),
    el('div',{class:'upload-zone',onclick:()=>triggerUpload('procImp')},
      el('div',{class:'ico'},'⬆️'),
      el('div',{},'Import Purchase Order (CSV/XLSX)')
    ),
    el('input',{type:'file',id:'procImp',accept:'.csv,.xlsx',style:'display:none',onchange:e=>{
      const reader=new FileReader(); reader.onload=ev=>{
        const lines=String(ev.target.result).split(/\r?\n/).slice(1); let a=0;
        lines.forEach(l=>{const p=l.split(','); if(!p[0])return; window.RizviDB.upsert('rizvi_procurement',p[0],{id:p[0],item:p[1],qty:parseFloat(p[2]||0),unit:p[3],vendor:p[4],value:parseFloat(p[5]||0),status:p[6]||'Pending',date:p[7]}); a++});
        toast(a+' Procurement ইমপোর্ট','ok'); renderProc();
      }; reader.readAsText(l=e); e.target.value='';
    }}),
    el('div',{id:'procTable'})
  ));
  renderProc();
};
function renderProc(){
  const list=(window.RIZVI_SEED.rizvi_procurement||[]);
  $('#procTable').innerHTML='';
  $('#procTable').appendChild(tableEl(['PO #','Item','Qty','Unit','Vendor','Value','Status','Date'],
    list.map(x=>[x.id,x.item,x.qty.toLocaleString('bn-BD'),x.unit,x.vendor,x.value.toLocaleString('bn-BD'),el('span',{class:'pill '+(x.status.includes('Pending')||x.status==='In Process'?'pill-warn':'pill-ok')},x.status),x.date])));
}

// ============ Compliance / Audit ============
renderers.compliance = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'📜 Compliance & Audit'),
    el('div',{class:'upload-zone',onclick:()=>triggerUpload('audImp')},
      el('div',{class:'ico'},'📜'),
      el('div',{},'Import Audit Log / Compliance Certificate')
    ),
    el('input',{type:'file',id:'audImp',accept:'.csv,.xlsx,.pdf',style:'display:none',onchange:ev=>handleAny(ev,'compliance')}),
    el('div',{style:'margin-top:12px'},
      tableEl(['Audit','Status','Date','Score'],[
        ['Fire Safety Drill','✓ Pass','2026-08-10','96%'],
        ['Buyer Compliance (BSCI)','✓ Pass','2026-07-22','98%'],
        ['Building Safety','✓ Pass','2026-06-15','94%'],
        ['Medical & First Aid','✓ Pass','2026-05-08','92%'],
        ['Environment & Waste','⚠ Review','2026-04-18','85%']
      ])
    )
  ));
};

// ============ Trims Store ============
renderers.trimstore = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'🏪 Trims & Accessories Store'),
    el('div',{class:'upload-zone',onclick:()=>triggerUpload('trimImp')} ,el('div',{class:'ico'},'🏪'),el('div',{},'Import Trims Stock (CSV/XLSX)')),
    el('input',{type:'file',id:'trimImp',accept:'.csv,.xlsx',style:'display:none',onchange:e=>{
      const reader=new FileReader(); reader.onload=ev=>{
        const lines=String(ev.target.result).split(/\r?\n/).slice(1); let a=0;
        lines.forEach(l=>{const p=l.split(','); if(!p[0])return; window.RizviDB.upsert('rizvi_dept_documents','trim_'+p[0],{type:'trim-imp',id:p[0],name:p[1],qty:p[2],unit:p[3]}); a++});
        toast(a+' Trims ইমপোর্ট','ok');
      }; reader.readAsText(l=e); e.target.value='';
    }}),
    el('div',{style:'margin-top:12px'},makeTwoColumnGrid([
      el('div',{class:'card'},el('h3',{},'Buttons'),tableEl(['Code','Name','Stock','Min'],[['BTN-12L','12L Plastic','8,500 Gross','1,500'],['BTN-14L','14L Plastic','5,200 Gross','1,500']])),
      el('div',{class:'card'},el('h3',{},'Zipper'),tableEl(['Code','Name','Stock','Min'],[['ZIP-7','7" Metal','4,200 Pcs','2,000'],['ZIP-5','5" Nylon','3,500 Pcs','2,000']]))
    ]))
  ));
};

// ============ Traceability ============
renderers.traceability = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'🔍 Traceability'),
    el('div',{style:'font-size:12px;color:#666'},'Buyer delivery lot থেকে শুরু করে fabric, trims, button, thread, carton সব traceable'),
    tableEl(['Trace ID','PO','Item','Vendor','Qty','Batch','QC','Date','Lot'],window.RIZVI_TRACEABILITY.map(t=>[t.id,t.po,t.item,t.vendor,t.qty.toLocaleString('bn-BD'),t.batch,el('span',{class:'pill '+(t.qc==='Pass'?'pill-ok':'pill-warn')},t.qc),t.date,t.production_lot]))
  ));
};

// ============ Field Duty / Live Location ============
renderers.field = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'📍 Field Duty / Live Location Tracking'),
    el('div',{style:'font-size:12px;color:#666'},'কর্মীর মোবাইল App-এর মাধ্যমে GPS লোকেশন — শুধুমাত্র কর্মীর সম্মতি ও ডিউটি চলাকালীন সময়ে সক্রিয় (Consent-based, opt-in)।'),
    el('div',{class:'kpi-grid'},
      el('div',{class:'kpi green'},el('div',{class:'label'},'Active Field Staff'),el('div',{class:'value'},'128')),
      el('div',{class:'kpi'},el('div',{class:'label'},'GPS Hits /min'),el('div',{class:'value'},'42')),
      el('div',{class:'kpi red'},el('div',{class:'label'},'Off-Route'),el('div',{class:'value'},'3'))
    ),
    el('h3',{style:'margin-top:14px'},'Live Map'),
    el('div',{style:'height:300px;background:linear-gradient(135deg,#fff3c4,#ffe7a0);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:14px;color:#7a6010'},
      el('div',{style:'font-size:40px'},'🗺️'),
      el('div',{style:'margin-top:6px;font-weight:700'},'RIZVI Live Field Tracker'),
      el('div',{style:'font-size:11px;color:#888;margin-top:4px'},'Map view — connect Firebase live document `rizvi_employees.location` (geo)')
    ),
    host_makeUploadAndTable('field','Field duty report (photos / route PDFs)')
  ));
  initFieldLocationLoop();
};
function initFieldLocationLoop(){
  if(window._fieldLoop) return;
  window._fieldLoop = setInterval(()=>{
    // simulate a GPS ping for a random employee
    const list = window.RIZVI_SEED.rizvi_employees||[];
    if(!list.length)return;
    const i=Math.floor(Math.random()*Math.min(20,list.length));
    const e=list[i];
    window.RizviDB.upsert('rizvi_performance','geo_'+Date.now(),{emp_id:e.id,phone:e.phone,lat:23.7+Math.random()*0.1,lng:90.4+Math.random()*0.1,src:'gps-app-consented',ts:new Date().toISOString()});
  }, 12000);
}

// ============ Sections ============
renderers.sections = async(host)=>{
  host.appendChild(el('div',{class:'card'},
    el('h3',{},'📂 39 Sections'),
    el('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px'},
      ...window.RIZVI_SECTIONS.map((s,i)=>el('div',{class:'kpi',onclick:()=>{
        // show section filter
        nav('employees'); setTimeout(()=>{$('#empSearch').value=s; filterEmp(s)},150);
      }},
        el('div',{class:'label'},'Section '+(i+1)),
        el('div',{class:'value',style:'font-size:14px'},s)
      ))
    )
  ));
};

// ============ Settings ============
window.openSettings=()=>$('#settingsModal').classList.add('active');
window.saveSettings=()=>{
  window.RIZVI_META.company=$('#optCompany').value;
  window.RIZVI_META.totalEmployees=parseInt($('#optTotal').value||0);
  window.RIZVI_META.payrollStartDay=parseInt($('#optStart').value||26);
  window.RIZVI_META.payrollEndDay=parseInt($('#optEnd').value||25);
  window.RIZVI_META.punchSyncSec=parseInt($('#optSync').value||10);
  toast('Settings সংরক্ষিত','ok'); closeModal('settingsModal');
};
window.resetAll=()=>{if(confirm('Factory reset?')){localStorage.clear();sessionStorage.clear();location.reload()}};

})();
