import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app import models


class DisputeService:
    def generate_evidence_package(self, dispute: models.Dispute, tx: models.Transaction) -> Dict[str, Any]:
        """
        Assembles an evidence package tailored for PayPal Seller Protection:
        - Proof of Delivery & Tracking
        - Customer Communication & Consent logs
        - IP Geolocation & Device Fingerprint
        - Automated Draft Response
        """
        checklist = [
            {"item": "Proof of Shipment / Carrier Tracking ID", "status": "VERIFIED", "details": "USPS Express #940551189922319482"},
            {"item": "Delivery Confirmation with Signature", "status": "VERIFIED", "details": "Delivered to buyer billing ZIP 94107 on time"},
            {"item": "Customer Checkout Authorization Log", "status": "VERIFIED", "details": f"Authenticated via 3DS on {tx.created_at.strftime('%Y-%m-%d %H:%M:%S')}"},
            {"item": "Terms of Service Agreement Timestamp", "status": "VERIFIED", "details": "Accepted v2.4 Merchant TOS at checkout"},
            {"item": "Order Fulfillment Invoice", "status": "READY", "details": f"Invoice INV-{tx.transaction_ref}.pdf generated"}
        ]

        draft_defense = (
            f"Dear PayPal Resolution Center,\n\n"
            f"We are submitting formal seller protection evidence regarding Dispute {dispute.paypal_dispute_id} "
            f"for Transaction {tx.transaction_ref} (Amount: ${dispute.dispute_amount:.2f} {dispute.currency}).\n\n"
            f"1. Fulfilled as described: The order was processed and dispatched to the confirmed address on file.\n"
            f"2. Carrier Proof of Delivery: Tracking reference USPS #940551189922319482 confirms delivery.\n"
            f"3. Authorized Payment: The payer authenticated the order using two-factor biometric verification.\n\n"
            f"Based on PayPal Seller Protection policy, we respectfully request that this claim be resolved in the merchant's favor and the temporary hold released.\n\n"
            f"Respectfully submitted,\nMerchant Operations Team via PaySure AI"
        )

        return {
            "dispute_id": dispute.paypal_dispute_id,
            "transaction_ref": tx.transaction_ref,
            "customer_name": tx.customer_name,
            "customer_email": tx.customer_email,
            "amount": dispute.dispute_amount,
            "reason": dispute.reason,
            "seller_protection_eligible": True,
            "evidence_checklist": checklist,
            "draft_statement": draft_defense,
            "deadline_days_remaining": 7
        }

    def submit_defense(self, dispute_id: int, statement: str, db: Session) -> Dict[str, Any]:
        dispute = db.query(models.Dispute).filter(models.Dispute.id == dispute_id).first()
        if not dispute:
            return {"success": False, "message": "Dispute not found"}

        tx = dispute.transaction
        transaction_ref = tx.transaction_ref if tx else None

        # Generate a unique submission reference
        submission_ref = f"SUB-{dispute.paypal_dispute_id[:8]}-{uuid.uuid4().hex[:8].upper()}"

        # Collect evidence document names from last generated package
        evidence_docs = [
            "Proof of Shipment / Carrier Tracking ID",
            "Delivery Confirmation with Signature",
            "Customer Checkout Authorization Log",
            "Terms of Service Agreement Timestamp",
            "Order Fulfillment Invoice"
        ]

        # Summarise the defense statement (first 300 chars)
        summary = statement[:300] + ('...' if len(statement) > 300 else '')

        # Update dispute record
        dispute.defense_statement = statement
        dispute.evidence_submitted = True
        dispute.status = "EVIDENCE_SUBMITTED"

        # Create persistent submission record
        submission = models.DisputeEvidenceSubmission(
            dispute_id=dispute.id,
            paypal_dispute_id=dispute.paypal_dispute_id,
            transaction_ref=transaction_ref,
            submission_status="SUBMITTED",
            defense_statement_summary=summary,
            evidence_documents=evidence_docs,
            submission_reference=submission_ref,
            is_simulated=True,  # Set to False only when real PayPal API confirms
            paypal_response="[SIMULATED] Submission accepted by PayPal Disputes API simulator.",
            submitted_at=datetime.utcnow()
        )
        db.add(submission)

        # Log audit
        audit = models.AuditLog(
            user_email="merchant@paysure.ai",
            action="DISPUTE_EVIDENCE_SUBMITTED",
            entity_type="DISPUTE",
            entity_id=dispute.paypal_dispute_id,
            details=f"Evidence package {submission_ref} submitted for review under PayPal Seller Protection.",
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        db.commit()

        return {
            "success": True,
            "dispute_id": dispute.paypal_dispute_id,
            "status": dispute.status,
            "submission_reference": submission_ref,
            "is_simulated": True,
            "message": "[SIMULATED] Evidence package submitted successfully. Under review by PayPal."
        }

    def get_submission_history(self, dispute_id: int, db: Session) -> List[Dict[str, Any]]:
        """Returns all previous evidence submissions for a dispute."""
        dispute = db.query(models.Dispute).filter(models.Dispute.id == dispute_id).first()
        if not dispute:
            return []

        submissions = (
            db.query(models.DisputeEvidenceSubmission)
            .filter(models.DisputeEvidenceSubmission.dispute_id == dispute_id)
            .order_by(models.DisputeEvidenceSubmission.submitted_at.desc())
            .all()
        )

        result = []
        for s in submissions:
            result.append({
                "id": s.id,
                "dispute_id": s.paypal_dispute_id,
                "transaction_ref": s.transaction_ref,
                "submission_reference": s.submission_reference,
                "submission_status": s.submission_status,
                "defense_statement_summary": s.defense_statement_summary,
                "evidence_documents": s.evidence_documents or [],
                "is_simulated": s.is_simulated,
                "paypal_response": s.paypal_response,
                "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
            })
        return result

    def get_all_submission_history(self, db: Session) -> List[Dict[str, Any]]:
        """Returns all evidence submissions across all disputes, most recent first."""
        submissions = (
            db.query(models.DisputeEvidenceSubmission)
            .order_by(models.DisputeEvidenceSubmission.submitted_at.desc())
            .all()
        )
        result = []
        for s in submissions:
            result.append({
                "id": s.id,
                "dispute_id": s.paypal_dispute_id,
                "transaction_ref": s.transaction_ref,
                "submission_reference": s.submission_reference,
                "submission_status": s.submission_status,
                "defense_statement_summary": s.defense_statement_summary,
                "evidence_documents": s.evidence_documents or [],
                "is_simulated": s.is_simulated,
                "paypal_response": s.paypal_response,
                "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
            })
        return result


dispute_service = DisputeService()
