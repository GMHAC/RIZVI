# RIZVI Dynamic Dashboard API Contract

## Purpose
The Flutter application does not hard-code department pages. The backend returns dashboard configuration and live KPI data.

## Endpoint
`GET /api/v1/dashboard/config`

Optional:
`GET /api/v1/dashboard/{dashboard_id}/data`

## Example response
```json
{
  "version": "2.0",
  "organization": "RIZVI FASHIONS LTD",
  "sync_mode": "api_config_driven",
  "dashboards": []
}
```

## Production architecture

Flutter App
→ FastAPI
→ RBAC / Permission Engine
→ Dashboard Configuration
→ KPI Service
→ MySQL
→ Department modules

When a department adds/removes a widget or changes a KPI formula, the server configuration changes and the app renderer consumes the new configuration without rebuilding the whole UI.

## Recommended security
- JWT authentication
- Role-based dashboard permissions
- Audit log for configuration changes
- HTTPS only
- Server-side validation of KPI formulas
- No secrets in Flutter source
