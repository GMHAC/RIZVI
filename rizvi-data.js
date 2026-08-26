/* rizvi-data.js — seed data for departments, sections, designations, sample employees,
   punch machine columns, payroll rules per the attached documents. */
window.RIZVI_META = {
  company:'RIZVI FASHIONS LTD.',
  payrollStartDay:26,
  payrollEndDay:25,
  punchSyncSec:10,
  totalEmployees:6469,
  currency:'৳'
};

// Departments — real counts from Regular_Employee_Data_Up_To_27_07_2026.csv (6,469 employees)
window.RIZVI_DEPARTMENTS = [
  {id:'PROD',name:'Production',bn:'উৎপাদন',personnel:5094,color:'#f5b800'},
  {id:'QC',name:'Quality Assurance',bn:'মান নিয়ন্ত্রণ',personnel:718,color:'#10b981'},
  {id:'HR',name:'Admin  HR & Compliance',bn:'এইচআর ও প্রশাসন',personnel:230,color:'#2563eb'},
  {id:'MKT',name:'Marketing & Merchandising',bn:'মার্কেটিং ও মার্চেন্ডাইজিং',personnel:174,color:'#9333ea'},
  {id:'STO',name:'Store.',bn:'স্টোর/গুদাম',personnel:167,color:'#0891b2'},
  {id:'FIN',name:'Accounts & Finance',bn:'হিসাব ও অর্থ',personnel:24,color:'#16a34a'},
  {id:'IE',name:'IE.',bn:'শিল্প প্রকৌশল',personnel:24,color:'#ca8a04'},
  {id:'AUD',name:'Audit',bn:'নিরীক্ষা',personnel:13,color:'#dc2626'},
  {id:'COM',name:'Commercial',bn:'বাণিজ্যিক',personnel:13,color:'#e11d48'},
  {id:'PLN',name:'Planning',bn:'পরিকল্পনা',personnel:12,color:'#7c3aed'}
];

// 39 Sections (from Guide_Rizvi.txt)
window.RIZVI_SECTIONS = [
  'Sewing','Finishing','Cutting','Sewing Quality','Cutting Quality',
  'Finishing Quality','HR & Admin','Compliance','Accounts & Finance',
  'Audit','Store','Warehouse','Maintenance','Industrial Engineering',
  'Security','Medical','Welfare','Merchandising','Marketing','Planning',
  'Fabric Store','Trims Store','Production Planning','IE','Cutting Section',
  'Sewing Section','Finishing Section','Packing','Sub-Store','IE-Planning',
  'Quality Lab','Sample','CAD','IT','Training','R&D','Reception',
  'Cafeteria','Housekeeping'
];

// 200 Designations (subset — full bucket auto-categorizes)
window.RIZVI_DESIGNATIONS = [
  // Tier-1: Director / GM / AGM
  'Director','Deputy Director','General Manager (GM)','AGM','Sr.AGM',
  // Tier-2: Manager
  'Sr.Manager','Manager','Asst.Manager','Deputy Manager',
  // Tier-3: Officers
  'Sr.Officer','Officer','Jr.Officer','Trainee Officer','Asst.Officer',
  // Tier-4: Admin / Accounts / Procurement titles
  'Accounts Officer','Sr.Accounts Officer','Accounts Executive','Sr.Executive',
  'Executive','Jr.Executive','Sr.Accountant','Accountant','Jr.Accountant',
  'Procurement Officer','Sr.Procurement Officer','Procurement Executive',
  'Compliance Officer','Sr.Compliance Officer','HR Officer','Sr.HR Officer',
  'Audit Officer','Sr.Audit Officer','Store Keeper','Sr.Store Keeper',
  'Welfare Officer','Medical Officer','Security Officer',
  // Tier-5: Production operators & helpers
  'Production Manager','Sr.Production Officer','Line Incharge','Floor Incharge',
  'Mechanic','Electrician','Helper','Operator','Machine Operator','Sr.Operator','Junior Operator',
  // QC
  'QC Officer','Sr.QC Officer','QC Inspector','Sewing QC','Finishing QC','Cutting QC',
  // Merchandising / IE
  'Merchandiser','Sr.Merchandiser','Merchandising Executive','IE Officer','Sustainability Officer',
  // Generic
  'Receptionist','Office Assistant','Driver','Cleaner','Canteen Staff'
];

// ---------------- EMPLOYEE SEED (sample records based on master file) ----------------
function _emp(i){
  const sections = window.RIZVI_SECTIONS; const depts = window.RIZVI_DEPARTMENTS;
  const desigs = window.RIZVI_DESIGNATIONS; const d = depts[i%depts.length]; const sec=sections[i%sections.length];
  const desig=desigs[i%desigs.length];
  const codes=['AF1','SW1','SW2','FI2','FI1','CU1','CT2','QC1','HR2','MK1','ST1','ST2','AU1','IE2','CO2','PL1','SE2','PA1','WH1'];
  const cc=codes[i%codes.length];
  return {
    id:`${cc} ${String(i+1).padStart(4,'0')}`,
    name:`Sample Employee ${i+1}`,
    department:d.name,dept_id:d.id,section:sec,
    designation:desig,category:['Workers','Administrative Staff','Management','Staff Welfare'][i%4],
    join_date:`20${10+(i%15)}-0${1+(i%9)}-0${1+(i%9)}`,
    floor:['Ground Floor','1st','2nd','3rd','4th','5th','6th','Head Office'][i%8],
    phone:`0171${String(1000000+i).slice(-7)}`,
    email:`emp${i+1}@rizvifashions.com`,
    status:'Active',
    gender:i%2?'Male':'Female',
    blood_group:['A+','B+','O+','AB+','A-','B-','O-'][i%7],
    weekend:['Friday','Saturday','Sunday'][i%3],
    basic:Math.round(15000+Math.random()*50000),
    gross:Math.round(20000+Math.random()*60000),
    location:['Head Office','Factory-1','Factory-2','Warehouse','Field Duty'][i%5],
    attendance_rate:Math.round(80+Math.random()*20),
    performance:Math.round(60+Math.random()*40),
    role:'user'
  };
}
function _seedEmpList(n){
  const arr=[]; for(let i=0;i<n;i++) arr.push(_emp(i)); return arr;
}

// ---------------- PUNCH MACHINE PROTOCOL (port 7700) ----------------
// Per attached "100_MACHINE_SYSTEM_FULL_INFORMATION.docx": ZK-style TCP push on 7700.
// Browser WebView cannot open raw TCP — so we expose:
//   (a) a configurable "punch endpoint" (ws/http) for the sync agent installed on the LAN,
//   (b) a CSV/log-file import that accepts full month of punch history in one shot.
// The 10-second sync runs regardless and pulls whatever the agent exposes via HTTP.
window.RIZVI_PUNCH_PROTOCOL = {
  devicePort:7700,
  tcpNative:'not directly accessible from browser/WebView',
  bridgeOptions:[
    {label:'LAN sync agent (recommended)',hint:'Run small Python service on LAN that talks TCP to device and exposes HTTP/JSON on local network',endpoint:'http://192.168.x.x:8080/push'},
    {label:'Direct device HTTP (if firmware supports)',hint:'Some ZKTeco/Hikvision devices expose HTTP on port 8080',endpoint:'http://<device-ip>:8080/iWsService'},
    {label:'CSV / log import',hint:'One-month bulk import of access_log.csv (EmployeeId,LogDate,LogHour,LogMin,LogSec)',endpoint:'<file upload>'}
  ],
  csvColumns:['Employee Id','Access Control Id','Employee Name','Machine Ip','Log Date','Log Hour','Log Min','Log Sec']
};

// ---------------- ADMIN ALLOWLIST (real auth via Firebase — no password stored here) ----------------
// Anyone signing in with one of these emails through Firebase Authentication gets Admin access.
// Add / remove admins here, or manage via Firebase Console > Authentication.
window.RIZVI_ADMIN_EMAILS = ['ssheraji@gmail.com'];

// ---------------- OFFLINE-ONLY FALLBACK (used only if Firebase is unreachable) ----------------
// No passwords are stored here — this repo is public-readable, so no real credential ever
// lives in code. When Firebase is unreachable, offline admin login is disabled by design
// (adminSeed.password is undefined below, so the check in rizvi-app.js always fails safely).
// Employee offline fallback still works via the generic default in rizvi-app.js loginUser().
window.RIZVI_DEFAULT_USERS = [
  {id:'ADMIN',email:'ssheraji@gmail.com',role:'admin',name:'Admin',designation:'System Administrator',department:'Admin  HR & Compliance'},
  {id:'EMP-AF1-0001',email:'rabeul.hasan@rizvifashions.com',mobile:'01912708566',role:'user',name:'Rabeul Hasan',designation:'A.G.M',department:'Accounts & Finance',office_id:'AF1 0001'}
];

// ---------------- TASK / KPI / EVALUATION TEMPLATES ----------------
window.RIZVI_KPI_TEMPLATES = {
  daily:{
    title:'দৈনিক কাজের তালিকা (Daily Job Checklist)',
    maxScore:100,
    items:[
      'উপস্থিতি ও শিফট অনুযায়ী উপস্থিত থাকা',
      'নির্ধারিত টার্গেট অনুযায়ী কাজ সম্পন্ন করা',
      'কাজের মান পরীক্ষা করা ও রিপোর্ট করা',
      'নিরাপত্তা সরঞ্জাম ব্যবহার ও রক্ষণাবেক্ষণ',
      'কাজের ডকুমেন্টেশন/রিপোর্ট প্রদান',
      'টিম মিটিং/হ্যান্ডওভার অংশগ্রহণ',
      'মেশিন/সরঞ্জাম পরিচ্ছন্নতা',
      'কাঁচামাল/আউটপুট হিসাব রক্ষণ'
    ]
  },
  weekly:{
    title:'সাপ্তাহিক কাজের মূল্যায়ন (Weekly — 600 marks)',
    maxScore:100,
    items:[
      'সাপ্তাহিক প্ল্যান বাস্তবায়ন',
      'কাঁচামাল/আউটপুট লক্ষ্য পূরণ',
      'কোয়ালিটি স্ট্যান্ডার্ড বজায়',
      'সুপারভাইজারি রিভিউ',
      'রিপোর্টিং',
      'হ্যান্ডওভার/ডকুমেন্টেশন'
    ]
  },
  monthly:{
    title:'মাসিক কাজের মূল্যায়ন',
    maxScore:100,
    items:[
      'মাসিক KPI পূরণ',
      'সাপ্তাহিক গড় অর্জন',
      'টার্গেট ভার্সাস অর্জন',
      'বিশ্লেষণ ও রিপোর্ট',
      'উন্নয়ন পরিকল্পনা',
      'ট্রেনিং ও টিম সিনার্জি'
    ]
  },
  quarterly:{
    title:'ত্রৈমাসিক কাজের মূল্যায়ন',
    maxScore:100,
    items:[
      'ত্রৈমাসিক লক্ষ্য পূরণ',
      'টার্গেট বনাম অর্জন বিশ্লেষণ',
      'বিভাগীয় অবদান',
      'উন্নয়ন প্রকল্প',
      'রিস্ক ম্যানেজমেন্ট'
    ]
  },
  half:{
    title:'ষান্মাসিক মূল্যায়ন',
    maxScore:100,
    items:[
      'ষান্মাসিক KPI পূরণ',
      'উন্নয়ন পরিকল্পনা বাস্তবায়ন',
      'বিভাগীয় সহযোগিতা',
      'Audit ও compliance',
      'ক্যারিয়ার গ্রোথ প্ল্যান'
    ]
  },
  yearly:{
    title:'বার্ষিক মূল্যায়ন (Auto-Generated)',
    maxScore:100,
    items:[
      'বার্ষিক টার্গেট পূরণ',
      'দৈনিক/সাপ্তাহিক/মাসিক/ত্রৈমাসিক/ষান্মাসিক সামারি',
      'কর্মক্ষমতা বৃদ্ধির হার',
      'প্রশিক্ষণ সম্পন্ন',
      'বিভাগীয় অবদান',
      'Team Leadership & Innovation',
      'Discipline & Compliance',
      'Annual Review readiness'
    ]
  }
};

window.RIZVI_EVAL_RULES = {
  daily:'100 marks/day × 6 working days',
  weekly:'Total of 600 → /100 (color-coded on dashboards)',
  monthly:'Average of weekly % + monthly KPI %',
  quarterly:'Average of monthly % over quarter',
  half:'Average of quarterly % over half-year',
  yearly:'Weighted average across all periods since JOIN_DATE',
  monthWindow:'Payroll runs from 26th of previous month to 25th of current month'
};

// ---------- RESIGN / LEFTY / ADDITIONAL SEEDS ----------
window.RIZVI_INVENTORY_ITEMS = [
  {id:'INV-001',name:'ফেব্রিক (জাপান কটন)',category:'Fabric',qty:12500,unit:'Meter',location:'Fabric Store',min:2000,status:'OK'},
  {id:'INV-002',name:'বোতাম (Plastik 12L)',category:'Trims',qty:8500,unit:'Gross',location:'Trims Store',min:1500,status:'OK'},
  {id:'INV-003',name:'সুতা (Polyester 40/2)',category:'Thread',qty:230,unit:'Cone',location:'Sewing Section',min:80,status:'Low'},
  {id:'INV-004',name:'জিপার (Metal 7")',category:'Trims',qty:4200,unit:'Pcs',location:'Trims Store',min:2000,status:'OK'},
  {id:'INV-005',name:'Carton (Export)',category:'Packing',qty:780,unit:'Pcs',location:'Packing',min:600,status:'OK'},
  {id:'INV-006',name:'Tag & Care Label',category:'Trims',qty:12000,unit:'Pcs',location:'Trims Store',min:3000,status:'OK'},
  {id:'INV-007',name:'হ্যাঙ্গার',category:'Packing',qty:6500,unit:'Pcs',location:'Packing',min:2000,status:'OK'},
  {id:'INV-008',name:'পলি ব্যাগ',category:'Packing',qty:18200,unit:'Pcs',location:'Packing',min:5000,status:'OK'}
];

window.RIZVI_FABRIC_BOOKINGS = [
  {id:'FAB-2026-001',vendor:'Pacific Jeans Ltd.',fabric:'98%Cotton 2%Spandex',qty:25000,unit:'Mtr',book_date:'2026-07-10',receive_date:'2026-08-05',status:'Partial Received',value:1875000},
  {id:'FAB-2026-002',vendor:'Epyllion Fabric',fabric:'100% Cotton Jersey',qty:18000,unit:'Mtr',book_date:'2026-07-12',receive_date:'2026-08-08',status:'Received',value:1260000},
  {id:'FAB-2026-003',vendor:'NB Tex',fabric:'Fleece 320 GSM',qty:12000,unit:'Mtr',book_date:'2026-07-15',receive_date:'2026-08-12',status:'Pending',value:1080000}
];

window.RIZVI_PROCUREMENT = [
  {id:'PO-2026-001',item:'বোতাম',qty:5000,unit:'Gross',vendor:'K.K. Accessories',value:425000,status:'Approved',date:'2026-07-22'},
  {id:'PO-2026-002',item:'সুতা',qty:300,unit:'Cone',vendor:'Coats BD',value:78000,status:'Received',date:'2026-07-25'},
  {id:'PO-2026-003',item:'ফেব্রিক কালার কার্ড',qty:50,unit:'Set',vendor:'Pantone Color',value:85000,status:'In Process',date:'2026-07-29'},
  {id:'PO-2026-004',item:'পলি ব্যাগ',qty:20000,unit:'Pcs',vendor:'Star Pack BD',value:120000,status:'Approved',date:'2026-08-02'},
  {id:'PO-2026-005',item:'Carton Box',qty:3000,unit:'Pcs',vendor:'Delta Carton',value:180000,status:'In Process',date:'2026-08-05'}
];

window.RIZVI_TRACEABILITY = [
  {id:'TR-2026-001',po:'PO-2026-004',item:'পলি ব্যাগ',vendor:'Star Pack BD',qty:20000,batch:'B-20260805',qc:'Pass',date:'2026-08-12',production_lot:'LOT-A-001'},
  {id:'TR-2026-002',po:'PO-2026-001',item:'বোতাম',vendor:'K.K. Accessories',qty:5000,batch:'B-20260807',qc:'Pass',date:'2026-08-10',production_lot:'LOT-A-001'},
  {id:'TR-2026-003',po:'FAB-2026-001',item:'Cotton Spandex',vendor:'Pacific Jeans Ltd.',qty:15000,batch:'B-20260809',qc:'Pass',date:'2026-08-09',production_lot:'LOT-A-001'},
  {id:'TR-2026-004',po:'PO-2026-002',item:'সুতা',vendor:'Coats BD',qty:280,batch:'B-20260811',qc:'Pass',date:'2026-08-11',production_lot:'LOT-A-002'}
];

// ------------------- SEED (in-memory) ------------------- //
window.RIZVI_SEED = {
  rizvi_employees: (window.RIZVI_REAL_EMPLOYEES && window.RIZVI_REAL_EMPLOYEES.length)
    ? window.RIZVI_REAL_EMPLOYEES
    : _seedEmpList(120), // fallback demo data if real-employees.js is missing
  rizvi_task_lists:[],
  rizvi_training:[],
  rizvi_salary:[],
  rizvi_payroll:[],
  rizvi_complaints:[],
  rizvi_dept_documents:[],
  rizvi_custom:[],
  rizvi_inventory:window.RIZVI_INVENTORY_ITEMS.slice(),
  rizvi_fabric_bookings:window.RIZVI_FABRIC_BOOKINGS.slice(),
  rizvi_procurement:window.RIZVI_PROCUREMENT.slice(),
  rizvi_attendance:[],
  rizvi_performance:[],
  rizvi_audit_log:[]
};
