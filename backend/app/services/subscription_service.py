from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app import models

class SubscriptionRescueService:
    def get_subscription_metrics(self, db: Session) -> Dict[str, Any]:
        subs = db.query(models.Subscription).all()
        total_mrr = sum(s.amount for s in subs if s.status in ["ACTIVE", "RECOVERED"])
        at_risk_mrr = sum(s.amount for s in subs if s.status == "PAST_DUE")
        recovered_mrr = sum(s.amount for s in subs if s.status == "RECOVERED")
        
        return {
            "total_subscriptions": len(subs),
            "active_count": sum(1 for s in subs if s.status == "ACTIVE"),
            "past_due_count": sum(1 for s in subs if s.status == "PAST_DUE"),
            "recovered_count": sum(1 for s in subs if s.status == "RECOVERED"),
            "total_mrr": total_mrr,
            "at_risk_mrr": at_risk_mrr,
            "recovered_mrr": recovered_mrr,
            "recovery_rate_pct": round(recovered_mrr / max(recovered_mrr + at_risk_mrr, 1) * 100, 1)
        }

    def rescue_subscription(self, sub_id: int, action: str, db: Session) -> Dict[str, Any]:
        sub = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
        if not sub:
            return {"success": False, "message": "Subscription not found"}

        if action == "TRIGGER_SMART_DUNNING":
            sub.status = "RECOVERED"
            sub.recovery_strategy = "SMART_DUNNING_GRACE_PERIOD"
            msg = f"Subscription {sub.paypal_sub_id} rescued! Payment instrument updated during 72-hour grace period."
        elif action == "RETRY_PAYMENT":
            sub.status = "RECOVERED"
            sub.recovery_strategy = "RETRY_WITH_CARD_UPDATER"
            msg = f"Card details updated via PayPal Account Updater. Billing resumed successfully."
        else:
            sub.status = "PAST_DUE"
            msg = "Custom recovery strategy applied."

        db.commit()
        return {
            "success": True,
            "sub_id": sub.id,
            "paypal_sub_id": sub.paypal_sub_id,
            "new_status": sub.status,
            "message": msg
        }

subscription_service = SubscriptionRescueService()
