from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.database import get_db, Base, engine
from app import models, schemas
from app.seed_data import seed_database
from app.services.paypal_service import paypal_service

router = APIRouter(prefix="/demo", tags=["Judge Demo Center"])

DEMO_SCENARIOS = [
    {
        "id": "scenario_1",
        "number": 1,
        "title": "Successful PayPal Checkout",
        "badge": "COMPLETED",
        "badge_color": "green",
        "transaction_ref": "TX-1001-SUCCESS",
        "amount": 189.50,
        "customer": "Emma Watson",
        "description": "Standard authorized payment captured smoothly via PayPal Wallet.",
        "failure_code": None,
        "learning": "Baseline healthy transaction with near-zero risk score (2/100)."
    },
    {
        "id": "scenario_2",
        "number": 2,
        "title": "Card Declined (Hard Decline)",
        "badge": "FAILED",
        "badge_color": "red",
        "transaction_ref": "TX-1002-DECLINE",
        "amount": 249.00,
        "customer": "Michael Chang",
        "description": "Issuing bank declined debit card. Retrying the same card would fail and incur fees.",
        "failure_code": "INSTRUMENT_DECLINED",
        "learning": "SURE Engine recommends switching instrument to PayPal balance or Pay in 4."
    },
    {
        "id": "scenario_3",
        "number": 3,
        "title": "Bank ACH Clearing in Progress",
        "badge": "PENDING",
        "badge_color": "amber",
        "transaction_ref": "TX-1003-ACH-PENDING",
        "amount": 1250.00,
        "customer": "Robert Vance",
        "description": "SEPA / ACH eCheck is clearing. Money is in flight. Retrying would cause duplicate debit!",
        "failure_code": "PAYER_ACTION_REQUIRED",
        "learning": "SURE Engine halts retry and informs merchant to wait 48 hours for settlement."
    },
    {
        "id": "scenario_4",
        "number": 4,
        "title": "Network Timeout / State Drift",
        "badge": "UNCERTAIN",
        "badge_color": "purple",
        "transaction_ref": "TX-1004-TIMEOUT",
        "amount": 389.00,
        "customer": "Sophia Martinez",
        "description": "Network dropped during capture. Local record is UNCERTAIN, but PayPal actually CAPTURED it!",
        "failure_code": "NETWORK_TIMEOUT",
        "learning": "State verification discovers true PayPal state, preventing an unauthorized double charge."
    },
    {
        "id": "scenario_5",
        "number": 5,
        "title": "Rapid Double-Click Duplicate",
        "badge": "DUPLICATE",
        "badge_color": "orange",
        "transaction_ref": "TX-1005-DUPLICATE",
        "amount": 79.99,
        "customer": "Alexander Hayes",
        "description": "Buyer clicked 'Pay' twice in 22 seconds on mobile. Second attempt detected and blocked.",
        "failure_code": "DUPLICATE_IDEMPOTENCY_CONFLICT",
        "learning": "Duplicate Guardian flags idempotency collision, protecting customer from double billing."
    },
    {
        "id": "scenario_6",
        "number": 6,
        "title": "SaaS Subscription Card Expired",
        "badge": "PAST DUE",
        "badge_color": "rose",
        "transaction_ref": "TX-1006-SUB-FAIL",
        "amount": 49.00,
        "customer": "Clara Oswald",
        "description": "Recurring billing failed due to an expired card. High risk of subscriber churn.",
        "failure_code": "SUBSCRIPTION_EXPIRED_PAYMENT_METHOD",
        "learning": "Triggers 72h Smart Dunning Grace Period rather than instantly cutting off SaaS access."
    },
    {
        "id": "scenario_7",
        "number": 7,
        "title": "PayPal Dispute / Chargeback",
        "badge": "DISPUTED",
        "badge_color": "blue",
        "transaction_ref": "TX-1007-DISPUTE",
        "amount": 540.00,
        "customer": "Lucas Sterling",
        "description": "Customer filed 'Item Not Received'. Merchant must respond with delivery evidence.",
        "failure_code": "TRANSACTION_REFUSED",
        "learning": "Dispute Assistant automatically drafts an evidence package conforming to Seller Protection."
    }
]

@router.get("/scenarios")
def get_scenarios():
    return DEMO_SCENARIOS

@router.post("/reset")
def reset_demo_database(db: Session = Depends(get_db)):
    """Resets demo database to initial pristine state for judges"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database(db)
    return {"message": "Demo data reset successfully to initial state."}

@router.get("/status")
async def check_paypal_status():
    configured = paypal_service.is_configured()
    token = await paypal_service.get_access_token()
    return {
        "is_sandbox_configured": configured,
        "mode": paypal_service.mode,
        "base_url": paypal_service.base_url,
        "client_id_preview": paypal_service.client_id[:8] + "..." if paypal_service.client_id else "None",
        "has_valid_token": bool(token),
        "status": "LIVE_SANDBOX" if configured else "HIGH_FIDELITY_SIMULATOR"
    }
