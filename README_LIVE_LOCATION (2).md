# RIZVI 360° Live Location — V3

This module adds **consent-based, real-time device location tracking** to RIZVI 360.

## What it does

- Employee explicitly enables location sharing.
- Browser/PWA uses `navigator.geolocation`.
- Android module uses Google Fused Location Provider.
- Coordinates are sent every ~10 seconds over an authenticated WebSocket.
- FastAPI stores timestamp, latitude, longitude and accuracy.
- Authorized Director/GM/Admin/HR roles receive live updates over WebSocket.
- Live Map renders markers using Leaflet + OpenStreetMap tiles.
- Latest known positions are sent when management opens the map.
- Location records are auditable in the database.

## What it does NOT do

A phone number alone is **not** used to query GSM/4G/5G carrier subscriber location. A normal application cannot lawfully or technically obtain operator-network location merely from an employee's mobile number. Carrier-level location requires an authorized telecom/operator interface and legal authority. This implementation therefore uses the employee's authorized device location permission.

## Web live tracking

1. Start the backend.
2. Start the frontend.
3. Employee logs in.
4. Open `location`.
5. Read the consent statement and enable the checkbox.
6. Press `Start Live Tracking`.
7. Allow browser location permission.
8. Authorized management opens `live-map`.

Production must use HTTPS/WSS; browsers generally block geolocation on insecure origins except localhost.

## Android live tracking

`android-tracker/` is a native Android foreground-service implementation.

- It requests location permission.
- It keeps a visible foreground notification while tracking is active.
- It sends location through the same authenticated WebSocket.
- The server URL and JWT are entered into the demo activity; in the production app these should come from the normal RIZVI login flow and secure token storage.

For Android 10+ background location policy and Android 14 foreground-service rules, request only the permissions required by the approved business workflow.

## WebSocket endpoints

Employee sender:
`/ws/location/employee?token=JWT`

Management receiver:
`/ws/location/admin?token=JWT`

Fallback latest endpoint:
`GET /api/admin/location/latest?token=JWT`

## Database

The existing `locations` table is used:

- employee_id
- captured_at
- latitude
- longitude
- accuracy
- consent

## Security requirements before production

- Set a strong `JWT_SECRET`.
- Use HTTPS/WSS.
- Restrict CORS to the real domains.
- Encrypt sensitive data at rest where required.
- Add retention/deletion policy for location history.
- Restrict location access to authorized roles.
- Log access to location records.
- Do not expose employee locations to other employees.
- Obtain and document employee consent and the applicable workplace/privacy policy.
