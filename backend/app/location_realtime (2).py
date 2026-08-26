"""Consent-based real-time employee location module for RIZVI 360.

This module intentionally uses device GPS/network location supplied by the employee's
browser/app. It does not and cannot query carrier/GSM subscriber location by phone number.
"""
import asyncio
import json
from datetime import datetime
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from .main import SECRET, ALGORITHM, SessionLocal, Employee, Location

router = APIRouter(tags=["Real-time Location"])

class LocationHub:
    def __init__(self):
        self.employee_sockets: Dict[str, Set[WebSocket]] = {}
        self.admin_sockets: Set[WebSocket] = set()
        self.lock = asyncio.Lock()

    async def add_employee(self, employee_id: str, ws: WebSocket):
        async with self.lock:
            self.employee_sockets.setdefault(employee_id, set()).add(ws)

    async def remove_employee(self, employee_id: str, ws: WebSocket):
        async with self.lock:
            self.employee_sockets.get(employee_id, set()).discard(ws)

    async def add_admin(self, ws: WebSocket):
        async with self.lock:
            self.admin_sockets.add(ws)

    async def remove_admin(self, ws: WebSocket):
        async with self.lock:
            self.admin_sockets.discard(ws)

    async def broadcast(self, payload: dict):
        async with self.lock:
            targets = list(self.admin_sockets)
        dead = []
        for ws in targets:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        if dead:
            async with self.lock:
                for ws in dead:
                    self.admin_sockets.discard(ws)

hub = LocationHub()

def authenticate(token: str):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        eid = payload.get("sub")
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")
    if not eid:
        raise HTTPException(401, "Invalid token")
    db: Session = SessionLocal()
    try:
        employee = db.query(Employee).filter(Employee.employee_id == eid).first()
        if not employee or employee.status != "ACTIVE":
            raise HTTPException(401, "Inactive or missing employee")
        return employee
    finally:
        db.close()

def validate_coordinates(lat: float, lon: float, accuracy: float | None):
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise HTTPException(422, "Invalid latitude/longitude")
    if accuracy is not None and (accuracy < 0 or accuracy > 10000):
        raise HTTPException(422, "Invalid accuracy")

async def persist_and_broadcast(employee_id: str, data: dict):
    lat = float(data["latitude"])
    lon = float(data["longitude"])
    accuracy = data.get("accuracy")
    consent = bool(data.get("consent", False))
    validate_coordinates(lat, lon, accuracy)
    if not consent:
        raise HTTPException(403, "Explicit location consent is required")

    db: Session = SessionLocal()
    try:
        row = Location(employee_id=employee_id, latitude=lat, longitude=lon,
                       accuracy=accuracy, consent=True)
        db.add(row)
        db.commit()
        captured_at = row.captured_at.isoformat()
    finally:
        db.close()

    payload = {
        "type": "location_update",
        "employee_id": employee_id,
        "latitude": lat,
        "longitude": lon,
        "accuracy": accuracy,
        "captured_at": captured_at,
    }
    await hub.broadcast(payload)
    return payload

@router.websocket("/ws/location/employee")
async def employee_location_socket(ws: WebSocket):
    token = ws.query_params.get("token")
    if not token:
        await ws.close(code=4401)
        return
    try:
        employee = authenticate(token)
    except HTTPException:
        await ws.close(code=4401)
        return

    await ws.accept()
    await hub.add_employee(employee.employee_id, ws)
    await ws.send_json({"type": "ready", "employee_id": employee.employee_id,
                        "message": "Send GPS coordinates only after the employee grants device location permission."})
    try:
        while True:
            message = await ws.receive_json()
            if message.get("type") != "location":
                continue
            payload = await persist_and_broadcast(employee.employee_id, message)
            await ws.send_json({"type": "ack", "captured_at": payload["captured_at"]})
    except WebSocketDisconnect:
        pass
    finally:
        await hub.remove_employee(employee.employee_id, ws)

@router.websocket("/ws/location/admin")
async def admin_location_socket(ws: WebSocket):
    token = ws.query_params.get("token")
    if not token:
        await ws.close(code=4401)
        return
    try:
        employee = authenticate(token)
    except HTTPException:
        await ws.close(code=4401)
        return
    if employee.role not in {"ADMIN", "DIRECTOR", "GM", "HR_ADMIN", "DEPT_HEAD"}:
        await ws.close(code=4403)
        return

    await ws.accept()
    await hub.add_admin(ws)
    db: Session = SessionLocal()
    try:
        # Send latest known location for every active employee on initial connection.
        latest = {}
        for e in db.query(Employee).filter(Employee.status == "ACTIVE").all():
            row = db.query(Location).filter(Location.employee_id == e.employee_id).order_by(Location.captured_at.desc()).first()
            if row:
                latest[e.employee_id] = {
                    "type": "location_update",
                    "employee_id": e.employee_id,
                    "name": e.name,
                    "department": e.department,
                    "section": e.section,
                    "latitude": row.latitude,
                    "longitude": row.longitude,
                    "accuracy": row.accuracy,
                    "captured_at": row.captured_at.isoformat(),
                }
        for item in latest.values():
            await ws.send_json(item)
    finally:
        db.close()

    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await hub.remove_admin(ws)

@router.get("/api/admin/location/latest")
def latest_locations(token: str):
    employee = authenticate(token)
    if employee.role not in {"ADMIN", "DIRECTOR", "GM", "HR_ADMIN", "DEPT_HEAD"}:
        raise HTTPException(403, "Admin permission required")
    db: Session = SessionLocal()
    try:
        result = []
        for e in db.query(Employee).filter(Employee.status == "ACTIVE").all():
            row = db.query(Location).filter(Location.employee_id == e.employee_id).order_by(Location.captured_at.desc()).first()
            if row:
                result.append({"employee_id": e.employee_id, "name": e.name,
                               "department": e.department, "section": e.section,
                               "latitude": row.latitude, "longitude": row.longitude,
                               "accuracy": row.accuracy, "captured_at": row.captured_at.isoformat()})
        return result
    finally:
        db.close()
