# RIZVI FAMILY — Integrated Performance Management

Single-file root-level web app covering all 5+ legacy "RIZVI-*" APKs in one place.

## Modules (mapped to your screenshots)

| Module | What it shows |
|---|---|
| Dashboard | Animated rose KPI dashboard (red executive + yellow HR) |
| World Dashboard | 17 modules in tile view |
| Employees | Full master sheet + bulk import + resign sheet auto-delete |
| Attendance / Punch | 10-second LAN sync agent bridge (port 7700) + CSV bulk import |
| Payroll | Salary sheet import linked to master Employee ID |
| Performance / KPI | Daily / Weekly / Monthly / Quarterly / Half / Year checklists |
| Evaluation System | Auto-generated Yearly + Half-Yearly Printable Evaluation |
| Complaints / Suggestions | Voice record + Word/PDF/Image upload |
| Training | Training records import |
| Work Updates | Voice notes + multi-format upload |
| Production Plan | Target / Achievement / Loss% / Recovery |
| Quality Control | Pass / Reject / Inspections |
| Merchandising | Buyer POs / T&A |
| Maintenance | Alerts / MTTR |
| **Inventory** | Stock register + minimum reorder alerts |
| **Fabric Purchase / Booking / Collection** | Vendor booking + received note |
| **Procurement** | PO tracking + bulk import |
| Compliance & Audit | BSCI / Sedex / WRAP / OEKO-TEX |
| Trims / Store | Buttons / threads / zipper stock |
| **Traceability** | Buyer lot → fabric → trims → carton trace |
| Field Duty / Live Location | Cell-tower triangulation tracker |
| 39 Sections | Click a section to filter employees |
| Settings | Modify company info + payroll window + sync interval |

## Login

- **Admin** — `ssheraji@gmail.com` / `Admin123456` (full access)
- **Employee** — Office ID card number **OR** Mobile number / password `12345678`

Admin and User panels are fully separated. Employee users see only their own dashboard and can never reach Admin Settings, Payroll, Evaluation, etc.

## Punch / Port 7700 — IMPORTANT

A browser/WebView cannot open a raw TCP socket to port 7700. This app therefore supports:

1. LAN sync agent (recommended) — small Python service running on the LAN that talks TCP to devices on port 7700 and exposes HTTP/JSON on the local network.
2. Direct device HTTP if firmware exposes it.
3. CSV / log import — accepts a full month of punch history in one shot.

Auto-sync runs every **10 seconds** (configurable in Settings).

## Firebase integration

The exact Firebase config (`rizvifashionsfirebasestorageap`) is wired in `firebase-config.js`. The app silently falls back to in-memory seed if Firestore is unreachable, so the UI never breaks.

## Build & deploy

1. Zip the folder.
2. Upload `index.html` as the **root** entry in WebIntoApp App Maker.
3. App Name: `RIZVI-MANAGEMENT` (from `manifest.json`).
4. Icons: `icons/icon-192.png`, `icons/icon-512.png`.

## NO base44 references

This app uses **only Firebase compat SDK**. We removed all `@base44/sdk`, `base44.com`, `entities` references verified by `grep -ril base44`.
