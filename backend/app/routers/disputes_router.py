from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.dispute_service import dispute_service

router = APIRouter(prefix="/disputes", tags=["Dispute Assistant"])

@router.get("", response_model=List[schemas.DisputeResponse])
def get_disputes(db: Session = Depends(get_db)):
    disputes = db.query(models.Dispute).order_by(models.Dispute.created_at.desc()).all()
    # Populate transaction_ref
    for d in disputes:
        if d.transaction:
            d.transaction_ref = d.transaction.transaction_ref
    return disputes

@router.get("/{dispute_id}/evidence-package")
def get_evidence_package(dispute_id: int, db: Session = Depends(get_db)):
    dispute = db.query(models.Dispute).filter(models.Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    tx = dispute.transaction
    if not tx:
        raise HTTPException(status_code=404, detail="Associated transaction not found")
        
    return dispute_service.generate_evidence_package(dispute, tx)

@router.post("/{dispute_id}/submit")
def submit_dispute_evidence(
    dispute_id: int,
    payload: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    statement = payload.get("defense_statement", "")
    return dispute_service.submit_defense(dispute_id, statement, db)
