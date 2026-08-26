# RIZVI-MANAGEMENT — FINAL Dashboard Package V2.1

**RIZVI-MANAGEMENT**  
Integrated Management & Business Intelligence System  
**RIZVI FASHIONS LTD.**

## This is the final upload-ready package

This package is based on the supplied `RIZVI_DYNAMIC_MANAGEMENT_SYSTEM_V2.zip` and keeps its configuration-driven dashboard architecture, API synchronization layer, database/backend files and department dashboard definitions.

### Official dashboard identities
- **Executive:** `RIZVI-MANAGEMENT | EXECUTIVE COMMAND CENTER` — Red Rose theme.
- **HR:** `RIZVI-MANAGEMENT | HR COMMAND CENTER` — Yellow Rose theme.

### Watermark implementation
The Executive and HR dashboards render a **flower/rose watermark behind the dashboard content**,
rather than placing it over the KPI cards. The watermark is implemented with Flutter `CustomPainter`,
so it scales with the available screen size and does not require an image-decoding step.

⚠️ **Finalization note:** the two `assets/watermark/*.png` files supplied in the previous package were
poorly cropped from a mockup screenshot — visible blocky transparency edges, and leftover text/icons/
avatar fragments bleeding through from the original screenshot. The app's Dart code never actually
referenced these files (only the clean vector `RoseWatermark` painter is used), so nothing broke, but
they've now been removed from `pubspec.yaml`'s asset bundle so a broken image can't accidentally ship.
The original files are still kept under `assets/watermark/` for reference — replace them with a
properly-masked, licensed rose photo if a photographic (rather than illustrated) rose is wanted later.
The reference mockup (`assets/reference/`) is likewise kept for reference only and is not bundled.

The vector watermark's background opacity was also raised slightly (0.105 → 0.16) for a bit more
presence, closer to the intent shown in the reference mockup.

### Dynamic architecture retained
- `lib/config/dashboard_config.json` remains the dashboard source of truth.
- FastAPI synchronization remains available through `RIZVI_API_BASE_URL`.
- Department dashboards remain configuration-driven.
- KPI, progress, list, bar, alert and timeline widgets remain dynamically rendered.
- Existing backend, database and API contract files are retained.

## Run
```bash
flutter pub get
flutter run
```

For API synchronization:
```bash
flutter run --dart-define=RIZVI_API_BASE_URL=https://YOUR-DOMAIN
```

For Android release:
```bash
flutter build apk --release
```

## Important production note
The KPI values in the local JSON are demonstration/configuration values. For production, connect the FastAPI endpoints to the real MySQL/ERP modules and enable JWT, RBAC and audit logging before deployment.
