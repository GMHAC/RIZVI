// firebase-app.js — Firebase bootstrap + offline-safe Firestore wrapper.
// Pure Firebase compat SDK (Spark free-tier compatible)
(function(){
  if(!window.RIZVI_FIREBASE_CONFIG){return}
  try{
    if(!firebase.apps.length){
      firebase.initializeApp(window.RIZVI_FIREBASE_CONFIG);
    }
    if(firebase.analytics && firebase.analytics.isSupported && firebase.analytics.isSupported()){
      firebase.analytics();
    }
    window.db = firebase.firestore();
    window.auth = firebase.auth();
    window.storage = firebase.storage();
    window.RIZVI_FB_OK = true;
  }catch(e){
    console.warn('Firebase init failed, using local fallback', e);
    window.RIZVI_FB_OK = false;
  }
})();

// Offline-safe data helper. If Firestore unreachable, uses in-memory seed.
window.RizviDB = (function(){
  const NS = {
    employees:'rizvi_employees',
    task_lists:'rizvi_task_lists',
    training:'rizvi_training_records',
    salary:'rizvi_salary_data',
    payroll:'rizvi_payroll',
    complaints:'rizvi_complaints',
    documents:'rizvi_dept_documents',
    custom:'rizvi_custom_fields',
    inventory:'rizvi_inventory',
    fabric:'rizvi_fabric_bookings',
    procurement:'rizvi_procurement',
    attendance:'rizvi_attendance',
    performance:'rizvi_performance',
    audit_log:'rizvi_audit_log'
  };
  const mem = {}; // in-memory cache so the UI never breaks
  function _k(c){return NS[c]||c}

  return {
    collectionNS(){return NS},
    async list(col){
      const k = _k(col);
      if(window.RIZVI_FB_OK){
        try{
          const snap = await window.db.collection(k).limit(500).get();
          const rows = snap.docs.map(d=>({id:d.id,...d.data()}));
          mem[k] = rows; return rows;
        }catch(e){return mem[k]||[]}
      }
      return (window.RIZVI_SEED && window.RIZVI_SEED[k]) || mem[k] || [];
    },
    async upsert(col, id, data){
      const k = _k(col); data.updated_at = new Date().toISOString();
      if(window.RIZVI_FB_OK){
        try{await window.db.collection(k).doc(id).set(data,{merge:true})}catch(e){}
      }
      if(!mem[k]) mem[k]=[];
      const i = mem[k].findIndex(x=>x.id===id);
      if(i>=0) mem[k][i]={id,...data}; else mem[k].push({id,...data});
      if(window.RIZVI_SEED && window.RIZVI_SEED[k]){
        const j = window.RIZVI_SEED[k].findIndex(x=>x.id===id);
        if(j>=0) window.RIZVI_SEED[k][j]={id,...data};
        else window.RIZVI_SEED[k].push({id,...data});
      }
      return {id,...data};
    },
    async remove(col,id){
      const k = _k(col);
      if(window.RIZVI_FB_OK){
        try{await window.db.collection(k).doc(id).delete()}catch(e){}
      }
      if(mem[k]) mem[k]=mem[k].filter(x=>x.id!==id);
      if(window.RIZVI_SEED && window.RIZVI_SEED[k]){
        window.RIZVI_SEED[k]=window.RIZVI_SEED[k].filter(x=>x.id!==id);
      }
    },
    async bulkImport(col, rows){
      const k=_k(col);
      if(window.RIZVI_FB_OK){
        try{
          const batch = window.db.batch();
          rows.slice(0,400).forEach(r=>{batch.set(window.db.collection(k).doc(String(r.id||r.employee_id||r.emp_id||Math.random().toString(36).slice(2,9))),r,{merge:true})});
          await batch.commit();
        }catch(e){}
      }
      if(!window.RIZVI_SEED) window.RIZVI_SEED={};
      window.RIZVI_SEED[k] = (window.RIZVI_SEED[k]||[]).concat(rows);
    }
  };
})();
