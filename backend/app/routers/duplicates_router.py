from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.engines.duplicate_guardian import duplicate_guardian

router = APIRouter(prefix="/duplicates", tags=["Duplicate Guardian"])

@router.get("/alerts", response_model=List[schemas.DuplicateAlertResponse])
def get_duplicate_alerts(db: Session = Depends(get_db)):
    alerts = db.query(models.DuplicateAlert).order_by(models.DuplicateAlert.created_at.desc()).all()
    return alerts

@router.post("/scan")
def trigger_duplicate_scan(db: Session = Depends(get_db)):
    new_alerts = duplicate_guardian.scan_for_duplicates(db)
    added_count = 0
    for a in new_alerts:
        existing = db.query(models.DuplicateAlert).filter(
            models.DuplicateAlert.duplicate_tx_ref == a["duplicate_tx_ref"]
        ).first()
        if not existing:
            alert = models.DuplicateAlert(**a)
            db.add(alert)
            added_count += 1
    db.commit()
    return {"message": f"Scan completed. {added_count} new potential duplicate alerts flagged."}

@router.post("/resolve/{alert_id}")
def resolve_duplicate_alert(
    alert_id: int,
    payload: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    action = payload.get("action", "REFUND_DUPLICATE")
    res = duplicate_guardian.resolve_duplicate(alert_id, action, db)
    return res
