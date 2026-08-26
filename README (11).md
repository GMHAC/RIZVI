# RIZVI Heavy Root HTML Build

- `index.html` is the ZIP root entry.
- Uses IndexedDB instead of localStorage for larger local datasets and file blobs.
- Supports resumable/chunked uploads when `RIZVI_CONFIG.API_BASE` points to a production HTTPS API exposing `/uploads/chunk` and `/uploads/complete`.
- Offline upload queue is retained locally until a backend is configured/reachable.
- Service worker is included for installed/PWA-style use over HTTPS.

## Production requirement
For 7,000 users and very large upload/review volumes, deploy the frontend behind a real API, PostgreSQL-compatible database, object storage, CDN, queue/workers, rate limiting, antivirus scanning, audit logs and server-side RBAC. Do not use client-side Admin credentials as the production authentication authority.

## RIZVI FOMS 45-MODULE COMMAND BUILD
This build upgrades the root UI to a 45-item Operational Management command center, section and designation navigation, Section 39 Task & Workflow, Smart Checklist, attendance/payroll controls, and automatic synchronization hooks.

### Live API
Set `API_BASE` in Settings or use `?api=https://YOUR-API-HOST`. The bundled Node backend includes `/api/ops/snapshot` and `/api/ops/sync` for shared workflow/checklist synchronization.

### Important
A web ZIP cannot certify a production Firebase/Cloud deployment by itself. Real cross-user synchronization requires the API/Firebase endpoint to be deployed and configured, plus authentication/authorization and production security rules.
