from fastapi import FastAPI

app = FastAPI(title="RIZVI Dynamic Dashboard API", version="2.0.0")

@app.get("/api/v1/dashboard/config")
def dashboard_config():
    # Replace this with MySQL-backed configuration.
    # Return the same JSON shape as lib/config/dashboard_config.json.
    return {
        "version": "2.0",
        "organization": "RIZVI FASHIONS LTD",
        "sync_mode": "api_config_driven",
        "dashboards": []
    }

@app.get("/health")
def health():
    return {"status": "ok"}
