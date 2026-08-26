# RIZVI FAMILY — Integrated Performance Management & Evaluation System (IMPMS)

## Source organization baseline
The supplied organization mapping contains **6,339 employees, 10 departments, 29 sections, 8 floor/location buckets, 197 designations and 4 categories**. The mapping chain is:
Department → Section → Floor → Designation → Employee → Daily Job → KPI → Competency → Evaluation.

## Performance engine
- Daily task score: 100 marks.
- Daily response options: YES / NO / PARTIAL.
- PARTIAL requires a reason/note and can attach evidence.
- Weekly: six working days (Saturday–Thursday), 6 × 100 = 600, then converted to a 100-point weekly score.
- Weekly period-specific tasks are scored separately and can be configured as a weighted component.
- Monthly, quarterly, half-yearly and annual scores are derived from preceding period scores plus their own period-specific KPI tasks.
- Half-yearly and annual evaluations are mandatory.
- Annual evaluation year is anchored to employee joining date from the Employee Master.
- Color bands are configurable. The 72-hour control is fixed as requested: yellow at exactly 72:00:00 and red above 72:00:00.

## Attendance / overtime
- General duty: 08:00–17:00, Saturday–Thursday, Friday weekly holiday.
- Weekly general-duty baseline: 48 hours.
- Total working time limit: 72 hours/week.
- H:M:S is converted to seconds for calculation and displayed as [h]:mm:ss.
- OT is time after the applicable general-duty baseline, subject to approved/payable rules.
- The system must distinguish actual worked time, general time, approved OT and exceptions.

## Import synchronization
Employee Master is the canonical identity source. Salary, punch, KPI/job list, training, compliance, production, quality and other datasets map through Employee ID and configurable secondary keys.
New employee imports upsert into Master.
Resigned/Left imports should change status and effective date rather than hard-delete historical records; payroll/reporting scope excludes them after the effective date. This preserves audit history.

## Employee portal
Employee dashboard shows own profile, attendance, weekly hours, salary/OT, KPI tasks, evaluation history, complaints/suggestions and management responses. Evidence uploads support documents, images, audio and video.

## Management dashboards
Director/GM/Admin/HR/Department dashboards aggregate organization, performance, attendance, 72-hour risk, training compliance, complaints, production and exceptions. Dashboard refresh target is 10 seconds.

## Location
GPS location is supported through the device/browser permission model. A phone number alone cannot be used by a normal app to retrieve carrier RF/GSM/LTE network location. Such a feature requires authorized telecom/network integration and legal controls. Offline devices can queue GPS events locally and sync when connectivity returns; true live remote tracking requires a data path.

## Security
Production deployment should add SSO/OTP or password, RBAC, MFA for privileged users, audit logs, encryption in transit/at rest, signed upload URLs, malware scanning, retention rules and least-privilege access.
