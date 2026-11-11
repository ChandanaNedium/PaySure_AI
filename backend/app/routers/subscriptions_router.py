from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services.subscription_service import subscription_service

router = APIRouter(prefix="/subscriptions", tags=["Subscription Rescue"])

@router.get("", response_model=List[schemas.SubscriptionResponse])
def get_subscriptions(db: Session = Depends(get_db)):
    return db.query(models.Subscription).order_by(models.Subscription.created_at.desc()).all()

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    return subscription_service.get_subscription_metrics(db)

@router.post("/rescue/{sub_id}")
def rescue_subscription(
    sub_id: int,
    payload: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    action = payload.get("action", "TRIGGER_SMART_DUNNING")
    return subscription_service.rescue_subscription(sub_id, action, db)
