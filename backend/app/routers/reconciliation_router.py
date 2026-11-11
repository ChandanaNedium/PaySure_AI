from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.reconciliation import reconciliation_service

router = APIRouter(prefix="/reconciliation", tags=["Reconciliation"])

@router.get("/records", response_model=List[schemas.ReconciliationRecordResponse])
def get_records(db: Session = Depends(get_db)):
    return db.query(models.ReconciliationRecord).order_by(models.ReconciliationRecord.matched_at.desc()).all()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    return reconciliation_service.get_reconciliation_summary(db)

@router.post("/reconcile/{record_id}")
def reconcile_record(
    record_id: int,
    payload: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    action = payload.get("action", "ALIGN_TO_PAYPAL")
    return reconciliation_service.reconcile_record(record_id, action, db)
