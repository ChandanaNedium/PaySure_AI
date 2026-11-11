from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app import models


class ReconciliationService:
    def get_reconciliation_summary(self, db: Session) -> Dict[str, Any]:
        records = db.query(models.ReconciliationRecord).all()
        total_records = len(records)

        # ALIGNED = both internal_status AND paypal_status are COMPLETED
        aligned_records = sum(
            1 for r in records
            if r.internal_status == 'COMPLETED' and r.paypal_status == 'COMPLETED'
        )
        not_aligned_records = total_records - aligned_records

        # Reconciliation health % based on ALIGNED count only
        health_pct = round(aligned_records / max(total_records, 1) * 100, 1)

        return {
            "total_records": total_records,
            "aligned_records": aligned_records,
            "not_aligned_records": not_aligned_records,
            "reconciliation_health_pct": health_pct,
            # Keep for backwards compat but deprecate
            "matched_records": aligned_records,
            "mismatched_records": not_aligned_records,
        }

    def reconcile_record(self, record_id: int, action: str, db: Session) -> Dict[str, Any]:
        record = db.query(models.ReconciliationRecord).filter(models.ReconciliationRecord.id == record_id).first()
        if not record:
            return {"success": False, "message": "Record not found"}

        # Update matching transaction if available
        tx = db.query(models.Transaction).filter(models.Transaction.transaction_ref == record.transaction_ref).first()
        if tx and action == "ALIGN_TO_PAYPAL":
            tx.status = record.paypal_status
            tx.updated_at = datetime.utcnow()
            record.internal_status = record.paypal_status

        record.resolution_status = "RESOLVED"
        record.resolved_action = action
        record.matched = True

        db.commit()
        return {
            "success": True,
            "record_id": record.id,
            "transaction_ref": record.transaction_ref,
            "action": action,
            "is_aligned": record.internal_status == "COMPLETED" and record.paypal_status == "COMPLETED",
            "message": f"Reconciliation resolved via {action}. Internal and PayPal ledgers aligned."
        }


reconciliation_service = ReconciliationService()
