# Android / APK delivery
This package is a production-oriented web/PWA source plus backend. It is intentionally not labeled as a prebuilt APK.
To produce a signed Android APK/AAB, host `frontend/` over HTTPS and wrap it with a trusted WebView/TWA project, or use Android Studio.
The app requests GPS permission only when the user starts location capture.
Mobile-number-only carrier/RF location is NOT implemented because a normal app cannot obtain operator-network location from a phone number alone. That requires authorized telecom/operator integration and applicable legal permissions.
