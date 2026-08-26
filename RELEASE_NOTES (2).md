# RIZVIWORLD / RIZVI FOMS — Command Build

## Included
- 45-item Main Operational Sidebar (01–45)
- 32 Section Sidebar items
- 180+ supplied Designation master entries with searchable navigation
- Executive high-fidelity dashboard
- Section-level dashboard
- Designation-level responsibility dashboard
- Section 39 Task & Workflow Command
- Smart Checklist Center on operational modules
- Attendance live-control form and payroll reconciliation control
- Salary-sheet import control
- API authentication hook
- Automatic cross-tab synchronization via BroadcastChannel
- Automatic backend synchronization via `/api/ops/snapshot` and `/api/ops/sync`
- Backend task endpoints `/api/ops/tasks`
- Responsive mobile/desktop layout

## Deployment
1. Deploy the bundled backend to a secure HTTPS host.
2. Set API Base in RIZVI Settings or open the UI with `?api=https://YOUR-API-HOST`.
3. Use backend credentials for production sign-in.
4. Configure production CORS, JWT secret, database backups, HTTPS, storage, rate limiting and Firebase/hosting rules.

## Important
This package is a code-level integration build. It is not a claim of 100% production-scale certification. Real multi-user synchronization occurs only when the backend/Firebase endpoint is deployed and configured.
