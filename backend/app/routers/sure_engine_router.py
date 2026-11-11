from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.engines.sure_engine import sure_engine

router = APIRouter(prefix="/sure-engine", tags=["SURE Engine"])

@router.post("/analyze/{tx_ref_or_id}", response_model=schemas.SureAnalysisResponse)
async def analyze_transaction(tx_ref_or_id: str, db: Session = Depends(get_db)):
    if tx_ref_or_id.isdigit():
        tx = db.query(models.Transaction).filter(models.Transaction.id == int(tx_ref_or_id)).first()
    else:
        tx = db.query(models.Transaction).filter(models.Transaction.transaction_ref == tx_ref_or_id).first()

    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    analysis = await sure_engine.analyze_transaction(tx, db)
    return analysis

@router.post("/execute-recovery")
async def execute_recovery(req: schemas.RecoveryExecuteRequest, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.transaction_ref == req.transaction_ref).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    res = await sure_engine.execute_recovery(
        tx=tx,
        strategy=req.strategy,
        authorized_by=req.authorized_by,
        notes=req.notes,
        db=db
    )
    return res
