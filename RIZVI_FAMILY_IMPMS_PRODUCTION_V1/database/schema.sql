
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS departments(id INTEGER PRIMARY KEY, name TEXT UNIQUE, employee_count INTEGER);
CREATE TABLE IF NOT EXISTS sections(id INTEGER PRIMARY KEY, name TEXT UNIQUE, employee_count INTEGER);
CREATE TABLE IF NOT EXISTS floors(id INTEGER PRIMARY KEY, name TEXT UNIQUE, employee_count INTEGER);
CREATE TABLE IF NOT EXISTS designations(id INTEGER PRIMARY KEY, name TEXT UNIQUE, employee_count INTEGER);
CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY, name TEXT UNIQUE, employee_count INTEGER);
CREATE TABLE IF NOT EXISTS employees(
 employee_id TEXT PRIMARY KEY, name TEXT, designation TEXT, grade TEXT, department TEXT, section TEXT,
 floor TEXT, line TEXT, category TEXT, join_date TEXT, mobile TEXT, email TEXT, status TEXT DEFAULT 'ACTIVE',
 last_working_date TEXT
);
CREATE TABLE IF NOT EXISTS salary_master(
 employee_id TEXT PRIMARY KEY, gross_salary REAL, basic REAL, ot_hour REAL, ot_rate REAL, ot_amt REAL,
 net_pay REAL, total_absent REAL, total_present REAL, working_day REAL, source_month TEXT,
 FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);
CREATE TABLE IF NOT EXISTS punch_records(
 id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id TEXT, punch_date TEXT,
 in_hour INTEGER, in_minute INTEGER, in_second INTEGER,
 out_hour INTEGER, out_minute INTEGER, out_second INTEGER,
 break_seconds INTEGER DEFAULT 0, approved_ot_hours REAL DEFAULT 0,
 source_file TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(employee_id) REFERENCES employees(employee_id)
);
CREATE TABLE IF NOT EXISTS daily_attendance(
 id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id TEXT, work_date TEXT,
 net_seconds INTEGER, net_duration TEXT, general_seconds INTEGER, ot_seconds INTEGER,
 validation TEXT, UNIQUE(employee_id,work_date)
);
CREATE TABLE IF NOT EXISTS weekly_hours(
 id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id TEXT, week_start TEXT, week_end TEXT,
 total_seconds INTEGER, general_seconds INTEGER, ot_seconds INTEGER, status TEXT,
 UNIQUE(employee_id,week_start)
);
CREATE TABLE IF NOT EXISTS kpi_templates(
 id INTEGER PRIMARY KEY AUTOINCREMENT, department TEXT, designation TEXT, period_type TEXT,
 task_code TEXT, task_title TEXT, weight REAL DEFAULT 100, active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS task_responses(
 id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id TEXT, task_id INTEGER, period_type TEXT,
 period_start TEXT, answer TEXT, partial_reason TEXT, evidence_file TEXT, submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS evaluations(
 id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id TEXT, period_type TEXT, period_start TEXT, period_end TEXT,
 score REAL, rating TEXT, generated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS training_records(
 id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id TEXT, training_name TEXT, training_date TEXT,
 source_file TEXT, verified INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS complaints(
 id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id TEXT, type TEXT, subject TEXT, description TEXT,
 voice_file TEXT, document_file TEXT, image_file TEXT, video_file TEXT, status TEXT DEFAULT 'SUBMITTED',
 management_response TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS location_pings(
 id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id TEXT, latitude REAL, longitude REAL, accuracy REAL,
 captured_at TEXT DEFAULT CURRENT_TIMESTAMP, source TEXT DEFAULT 'GPS'
);
CREATE TABLE IF NOT EXISTS production_daily(
 id INTEGER PRIMARY KEY AUTOINCREMENT, work_date TEXT, line TEXT, style TEXT, target_qty REAL,
 actual_qty REAL, quality_pass_qty REAL, loss_qty REAL, recovery_plan TEXT
);
CREATE TABLE IF NOT EXISTS imports(
 id INTEGER PRIMARY KEY AUTOINCREMENT, import_type TEXT, filename TEXT, rows_received INTEGER,
 rows_accepted INTEGER, rows_rejected INTEGER, imported_at TEXT DEFAULT CURRENT_TIMESTAMP
);
