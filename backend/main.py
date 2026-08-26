from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from pathlib import Path
import sqlite3, csv, io, datetime, math

BASE=Path(__file__).resolve().parent.parent
DB=BASE/"database/rizvi_impms.db"
app=FastAPI(title="RIZVI FAMILY IMPMS API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def db():
    c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c

def recalc_week(employee_id, week_start):
    c=db()
    ws=datetime.date.fromisoformat(week_start)
    we=ws+datetime.timedelta(days=6)
    data=c.execute("""select coalesce(sum(net_seconds),0) total,
                             coalesce(sum(general_seconds),0) general,
                             coalesce(sum(ot_seconds),0) ot
                      from daily_attendance
                      where employee_id=? and work_date between ? and ?""",
                   (employee_id, ws.isoformat(), we.isoformat())).fetchone()
    total=int(data["total"] or 0); general=int(data["general"] or 0); ot=int(data["ot"] or 0)
    status="RED" if total>72*3600 else ("YELLOW" if total==72*3600 else "GREEN")
    c.execute("""insert into weekly_hours(employee_id,week_start,week_end,total_seconds,general_seconds,ot_seconds,status)
                 values(?,?,?,?,?,?,?)
                 on conflict(employee_id,week_start) do update set
                 week_end=excluded.week_end,total_seconds=excluded.total_seconds,
                 general_seconds=excluded.general_seconds,ot_seconds=excluded.ot_seconds,status=excluded.status""",
              (employee_id,ws.isoformat(),we.isoformat(),total,general,ot,status))
    c.commit(); c.close()
    return {"total_seconds":total,"general_seconds":general,"ot_seconds":ot,"status":status}

def rows(sql,args=()):
    c=db()
    try:return [dict(x) for x in c.execute(sql,args).fetchall()]
    finally:c.close()

@app.get("/api/health")
def health(): return {"status":"OK","server_time":datetime.datetime.now().isoformat()}

@app.get("/api/dashboard/summary")
def summary():
    c=db()
    emp=c.execute("select count(*) n from employees where status='ACTIVE'").fetchone()["n"]
    dep=c.execute("select count(*) n from departments").fetchone()["n"]
    des=c.execute("select count(*) n from designations").fetchone()["n"]
    comp=c.execute("select count(*) n from complaints").fetchone()["n"]
    open_comp=c.execute("select count(*) n from complaints where status not in ('CLOSED','RESOLVED')").fetchone()["n"]
    red=c.execute("select count(*) n from weekly_hours where total_seconds>259200").fetchone()["n"] # >72h
    yellow=c.execute("select count(*) n from weekly_hours where total_seconds=259200").fetchone()["n"]
    return {"employees":emp,"departments":dep,"designations":des,"complaints":comp,"open_complaints":open_comp,"red_72h":red,"yellow_72h":yellow}

@app.get("/api/employees/{employee_id}")
def employee(employee_id:str):
    r=rows("""select e.*,s.gross_salary,s.basic,s.ot_hour,s.ot_rate,s.ot_amt,s.net_pay
              from employees e left join salary_master s on e.employee_id=s.employee_id
              where e.employee_id=?""",(employee_id,))
    if not r: raise HTTPException(404,"Employee not found")
    return r[0]

@app.get("/api/employees/{employee_id}/weekly")
def weekly(employee_id:str):
    return rows("select * from weekly_hours where employee_id=? order by week_start desc",(employee_id,))

@app.get("/api/employees/{employee_id}/complaints")
def my_complaints(employee_id:str):
    return rows("select id,type,subject,status,management_response,created_at,updated_at from complaints where employee_id=? order by id desc",(employee_id,))

class Punch(BaseModel):
    employee_id:str; punch_date:str
    in_hour:int; in_minute:int; in_second:int
    out_hour:int; out_minute:int; out_second:int
    break_seconds:int=0; approved_ot_hours:float=0

@app.post("/api/punch")
def add_punch(p:Punch):
    if not (0<=p.in_hour<=23 and 0<=p.out_hour<=23 and 0<=p.in_minute<=59 and 0<=p.out_minute<=59 and 0<=p.in_second<=59 and 0<=p.out_second<=59):
        raise HTTPException(400,"Invalid H:M:S")
    c=db()
    c.execute("""insert into punch_records(employee_id,punch_date,in_hour,in_minute,in_second,out_hour,out_minute,out_second,break_seconds,approved_ot_hours)
                 values(?,?,?,?,?,?,?,?,?,?)""",
              (p.employee_id,p.punch_date,p.in_hour,p.in_minute,p.in_second,p.out_hour,p.out_minute,p.out_second,p.break_seconds,p.approved_ot_hours))
    in_s=p.in_hour*3600+p.in_minute*60+p.in_second
    out_s=p.out_hour*3600+p.out_minute*60+p.out_second
    net=max(0,out_s-in_s-p.break_seconds)
    # 48h general weekly baseline is applied in weekly aggregation; daily general time is capped at 8h.
    general=min(net,8*3600); ot=max(0,net-general)
    c.execute("""insert or replace into daily_attendance(employee_id,work_date,net_seconds,net_duration,general_seconds,ot_seconds,validation)
                 values(?,?,?,?,?,?,?)""",
              (p.employee_id,p.punch_date,net,f"{net//3600:02d}:{(net%3600)//60:02d}:{net%60:02d}",general,ot,"OK"))
    c.commit(); c.close()
    ws=datetime.date.fromisoformat(p.punch_date)
    # Saturday-start week: Saturday=0 ... Friday=6
    week_start=ws-datetime.timedelta(days=(ws.weekday()-5)%7)
    weekly=recalc_week(p.employee_id, week_start.isoformat())
    return {"net_seconds":net,"net_duration":f"{net//3600:02d}:{(net%3600)//60:02d}:{net%60:02d}","weekly":weekly}

@app.post("/api/location")
def location(employee_id:str=Form(...), latitude:float=Form(...), longitude:float=Form(...), accuracy:float=Form(0)):
    c=db()
    c.execute("insert into location_pings(employee_id,latitude,longitude,accuracy) values(?,?,?,?)",(employee_id,latitude,longitude,accuracy))
    c.commit();c.close()
    return {"status":"saved","source":"GPS"}

@app.post("/api/complaints")
async def complaint(employee_id:str=Form(...), typ:str=Form("COMPLAINT"), subject:str=Form(...), description:str=Form(...),
                    voice:UploadFile|None=File(None), document:UploadFile|None=File(None), image:UploadFile|None=File(None), video:UploadFile|None=File(None)):
    uploads=BASE/"uploads"; uploads.mkdir(exist_ok=True)
    paths={}
    for key,f in [("voice",voice),("document",document),("image",image),("video",video)]:
        if f:
            name=f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{employee_id}_{key}_{f.filename}"
            dest=uploads/name; dest.write_bytes(await f.read()); paths[key]=str(dest.relative_to(BASE))
    c=db(); c.execute("""insert into complaints(employee_id,type,subject,description,voice_file,document_file,image_file,video_file)
                         values(?,?,?,?,?,?,?,?)""",
                     (employee_id,typ,subject,description,paths.get("voice"),paths.get("document"),paths.get("image"),paths.get("video")))
    c.commit(); cid=c.execute("select last_insert_rowid() id").fetchone()["id"];c.close()
    return {"id":cid,"status":"SUBMITTED"}


@app.post("/api/import/punch")
async def import_punch(file:UploadFile=File(...)):
    data=await file.read()
    name=file.filename.lower()
    if name.endswith(".csv"):
        df=pd.read_csv(io.BytesIO(data))
    else:
        df=pd.read_excel(io.BytesIO(data))
    required=["EMPLOYEE_ID","PUNCH_DATE","IN_HOUR","IN_MINUTE","IN_SECOND","OUT_HOUR","OUT_MINUTE","OUT_SECOND"]
    missing=[x for x in required if x not in df.columns]
    if missing: raise HTTPException(400, f"Missing columns: {missing}")
    accepted=rejected=0; c=db(); touched=set()
    for _,r in df.iterrows():
        try:
            eid=str(r["EMPLOYEE_ID"]).strip()
            vals=[int(r["IN_HOUR"]),int(r["IN_MINUTE"]),int(r["IN_SECOND"]),int(r["OUT_HOUR"]),int(r["OUT_MINUTE"]),int(r["OUT_SECOND"])]
            if not eid or not (0<=vals[0]<=23 and 0<=vals[1]<=59 and 0<=vals[2]<=59 and 0<=vals[3]<=23 and 0<=vals[4]<=59 and 0<=vals[5]<=59): raise ValueError()
            if c.execute("select 1 from employees where employee_id=?",(eid,)).fetchone() is None: raise ValueError()
            br=int(r.get("BREAK_SECONDS",0) or 0)
            appot=float(r.get("APPROVED_OT_HOURS",0) or 0)
            date=str(r["PUNCH_DATE"])[:10]
            c.execute("""insert into punch_records(employee_id,punch_date,in_hour,in_minute,in_second,out_hour,out_minute,out_second,break_seconds,approved_ot_hours,source_file)
                         values(?,?,?,?,?,?,?,?,?,?,?)""",(eid,date,*vals,br,appot,file.filename))
            ins=vals[0]*3600+vals[1]*60+vals[2]; outs=vals[3]*3600+vals[4]*60+vals[5]
            net=max(0,outs-ins-br); gen=min(net,8*3600); ot=max(0,net-gen)
            c.execute("""insert or replace into daily_attendance(employee_id,work_date,net_seconds,net_duration,general_seconds,ot_seconds,validation)
                         values(?,?,?,?,?,?,?)""",(eid,date,net,f"{net//3600:02d}:{(net%3600)//60:02d}:{net%60:02d}",gen,ot,"OK"))
            touched.add((eid,date)); accepted+=1
        except Exception:
            rejected+=1
    c.execute("insert into imports(import_type,filename,rows_received,rows_accepted,rows_rejected) values(?,?,?,?,?)",
              ("PUNCH",file.filename,len(df),accepted,rejected))
    c.commit(); c.close()
    for eid,date in touched:
        d=datetime.date.fromisoformat(date); ws=d-datetime.timedelta(days=(d.weekday()-5)%7)
        recalc_week(eid,ws.isoformat())
    return {"rows_received":len(df),"rows_accepted":accepted,"rows_rejected":rejected}

@app.post("/api/import/kpi")
async def import_kpi(file:UploadFile=File(...)):
    data=await file.read(); name=file.filename.lower()
    df=pd.read_csv(io.BytesIO(data)) if name.endswith(".csv") else pd.read_excel(io.BytesIO(data))
    required=["DEPARTMENT","DESIGNATION","PERIOD_TYPE","TASK_CODE","TASK_TITLE"]
    missing=[x for x in required if x not in df.columns]
    if missing: raise HTTPException(400,f"Missing columns: {missing}")
    c=db(); n=0
    for _,r in df.iterrows():
        c.execute("""insert into kpi_templates(department,designation,period_type,task_code,task_title,weight)
                     values(?,?,?,?,?,?)""",(str(r["DEPARTMENT"]),str(r["DESIGNATION"]),str(r["PERIOD_TYPE"]),str(r["TASK_CODE"]),str(r["TASK_TITLE"]),float(r.get("WEIGHT",100) or 100)))
        n+=1
    c.commit();c.close();return {"rows_accepted":n}

@app.post("/api/import/training")
async def import_training(file:UploadFile=File(...)):
    data=await file.read(); name=file.filename.lower()
    df=pd.read_csv(io.BytesIO(data)) if name.endswith(".csv") else pd.read_excel(io.BytesIO(data))
    required=["EMPLOYEE_ID","TRAINING_NAME","TRAINING_DATE"]
    missing=[x for x in required if x not in df.columns]
    if missing: raise HTTPException(400,f"Missing columns: {missing}")
    c=db(); n=0
    for _,r in df.iterrows():
        c.execute("insert into training_records(employee_id,training_name,training_date,source_file,verified) values(?,?,?,?,1)",
                  (str(r["EMPLOYEE_ID"]),str(r["TRAINING_NAME"]),str(r["TRAINING_DATE"]),file.filename)); n+=1
    c.commit();c.close();return {"rows_accepted":n}

@app.get("/api/training/gaps")
def training_gaps():
    # Employees older than 6 months with no training record.
    today=datetime.date.today()
    c=db()
    out=[]
    for r in c.execute("select employee_id,name,designation,department,join_date from employees where status='ACTIVE'").fetchall():
        try: jd=datetime.datetime.strptime(r["join_date"],"%d/%m/%y").date()
        except:
            try: jd=datetime.datetime.strptime(r["join_date"],"%Y-%m-%d").date()
            except: continue
        if (today-jd).days>=183:
            n=c.execute("select count(*) n from training_records where employee_id=?",(r["employee_id"],)).fetchone()["n"]
            if n==0: out.append(dict(r))
    c.close(); return out

@app.get("/api/org")
def org():
    return {
      "departments":rows("select * from departments order by employee_count desc"),
      "sections":rows("select * from sections order by employee_count desc"),
      "floors":rows("select * from floors order by employee_count desc"),
      "designations":rows("select * from designations order by employee_count desc"),
      "categories":rows("select * from categories order by employee_count desc")
    }

@app.post("/api/import/employees")
async def import_employees(file:UploadFile=File(...)):
    data=await file.read()
    text=data.decode("utf-8-sig",errors="ignore")
    reader=csv.DictReader(io.StringIO(text))
    c=db(); accepted=0; rejected=0
    for r in reader:
        eid=(r.get("EMPLOYEE_ID") or "").strip()
        if not eid: rejected+=1; continue
        c.execute("""insert into employees(employee_id,name,designation,grade,department,section,floor,line,category,join_date,status)
                     values(?,?,?,?,?,?,?,?,?,?,?) on conflict(employee_id) do update set
                     name=excluded.name,designation=excluded.designation,grade=excluded.grade,department=excluded.department,
                     section=excluded.section,floor=excluded.floor,line=excluded.line,category=excluded.category,join_date=excluded.join_date""",
                  (eid,r.get("NAME",""),r.get("DESIGNATION",""),r.get("GRADE",""),r.get("DEPARTMENT",""),r.get("SECTION",""),r.get("FLOOR",""),r.get("LINE",""),r.get("CATEGORY",""),r.get("JOIN_DATE",""),"ACTIVE"))
        accepted+=1
    c.execute("insert into imports(import_type,filename,rows_received,rows_accepted,rows_rejected) values(?,?,?,?,?)",("EMPLOYEE_MASTER",file.filename,accepted+rejected,accepted,rejected))
    c.commit();c.close()
    return {"rows_received":accepted+rejected,"rows_accepted":accepted,"rows_rejected":rejected}
