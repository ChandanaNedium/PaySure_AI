from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[schemas.TransactionResponse])
def get_transactions(
    status: Optional[str] = Query(None),
    payment_method: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction)

    if status and status != "ALL":
        query = query.filter(models.Transaction.status == status)
    
    if payment_method and payment_method != "ALL":
        query = query.filter(models.Transaction.payment_method == payment_method)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Transaction.transaction_ref.ilike(search_filter),
                models.Transaction.customer_name.ilike(search_filter),
                models.Transaction.customer_email.ilike(search_filter),
                models.Transaction.paypal_order_id.ilike(search_filter)
            )
        )

    transactions = query.order_by(models.Transaction.created_at.desc()).offset(offset).limit(limit).all()
    return transactions

@router.get("/{tx_ref_or_id}", response_model=schemas.TransactionResponse)
def get_transaction_by_ref_or_id(tx_ref_or_id: str, db: Session = Depends(get_db)):
    if tx_ref_or_id.isdigit():
        tx = db.query(models.Transaction).filter(models.Transaction.id == int(tx_ref_or_id)).first()
    else:
        tx = db.query(models.Transaction).filter(models.Transaction.transaction_ref == tx_ref_or_id).first()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx
