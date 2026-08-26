# RIZVI 360° Integrated Workforce Platform v2

Production-oriented foundation for the supplied RIZVI-MANAGENT specification.

## Included
- PostgreSQL/SQLite compatible SQLAlchemy backend
- JWT employee/admin authentication
- Employee master CSV/XLSX import
- Punch/attendance import and working-hour calculation
- Salary import and storage
- Designation-based KPI templates
- YES/NO/PARTIAL evaluation; PARTIAL requires a note
- Evidence/file upload
- Employee complaint/suggestion/application workflow
- Training records and 6-month training-gap report
- Production and quality data APIs/imports
- Management dashboard metrics
- Consent-based location endpoint (GPS/network location from authorised device; no carrier-level tracking)
- React dashboard and import center
- Docker Compose deployment

## Run
1. Install Docker Desktop.
2. Change `POSTGRES_PASSWORD` and `JWT_SECRET` in `docker-compose.yml`.
3. Run `docker compose up --build`.
4. Open http://localhost:5173 and API docs at http://localhost:8000/docs.

## First admin
For security, bootstrap the first ADMIN through a controlled database migration/seed in your deployment environment rather than shipping a universal password.

## Important
The code is a real runnable application foundation, not a claim that every factory policy, payroll rule, buyer compliance rule, and local legal rule is already configured. Those must be validated and configured before production payroll/HR decisions.
