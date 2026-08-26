RIZVIWORLD ROOT FINAL DISTRIBUTION
===================================

ROOT ENTRY:
  index.html

Included:
- 44 Operational Management sidebar items + Settings
- Master Monitoring Dashboard
- Management command / opinion / instruction panel
- Employee / Department / Section update center
- No-delete UI rule; edits create revision numbers
- >1 hour no-update status detection and red alert state
- 200+ designation catalog
- Department/Section catalog
- Bengali browser SpeechSynthesis voice announcement
- 15-minute flower-cycle presentation
- Animated underwater bubbles and red alert bubbles
- Local browser persistence for this standalone distribution

PRODUCTION INTEGRATION:
This is a standalone ROOT HTML distribution. It does not embed Firebase service-account keys
or real backend secrets. For live 7,000-user synchronization, connect Firebase Authentication,
Firestore, Storage, Cloud Functions/Cloud Scheduler, FCM notifications, server-side audit logs,
Employee Master, Department/Section Master, and Role/Permission policies.

SECURITY:
Do not store real passwords in frontend code. The supplied management credential must be moved
to Firebase Authentication / secure identity management before production. Employee ID-only login
should use a secure verified authentication layer (OTP/PIN/device verification) in production.

VOICE:
The package uses Bengali browser SpeechSynthesis as a fallback. A browser cannot guarantee a
specific 18/20-year-old human/radio/broadcast voice. For the requested broadcast-quality voice,
use an approved Bengali TTS voice on a secure backend and play the generated audio.
