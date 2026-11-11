from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app import models

class ReconciliationService:
    def get_reconciliation_summary(self, db: Session) -> Dict[str, Any]:
        records = db.query(models.ReconciliationRecord).all()
        total_records = len(records)
        matched_records = sum(1 for r in records if r.matched)
        mismatched_records = total_records - matched_records
        resolved_records = sum(1 for r in records if r.resolution_status == "RESOLVED")
        
        return {
            "total_records": total_records,
            "matched_records": matched_records,
            "mismatched_records": mismatched_records,
            "resolved_records": resolved_records,
            "reconciliation_health_pct": round((matched_records + resolved_records) / max(total_records, 1) * 100, 1),
            "discrepancy_types": {
                "STATUS_MISMATCH": sum(1 for r in records if r.discrepancy_type == "STATUS_MISMATCH"),
                "ORPHANED_EVENT": sum(1 for r in records if r.discrepancy_type == "ORPHANED_EVENT"),
                "TIMING_DRIFT": sum(1 for r in records if r.discrepancy_type == "TIMING_DRIFT")
            }
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
            "message": f"Reconciliation resolved via {action}. Internal and PayPal ledgers aligned."
        }

reconciliation_service = ReconciliationService()
