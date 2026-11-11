import asyncio
from app.database import SessionLocal
from app import models
from app.engines.sure_engine import sure_engine
from app.services.reconciliation import reconciliation_service
from app.services.dispute_service import dispute_service


async def test_all():
    db = SessionLocal()
    try:
        print("=== 1. TESTING TRANSACTION ANALYSIS ===")
        txs = db.query(models.Transaction).all()
        print(f"Total transactions found: {len(txs)}")
        
        test_refs = ["TX-1001-SUCCESS", "TX-1002-CARD-FAIL", "TX-1003-BANK-PENDING", "TX-1004-TIMEOUT", "TX-1005-DUPLICATE"]
        for ref in test_refs:
            tx = db.query(models.Transaction).filter(models.Transaction.transaction_ref == ref).first()
            if not tx:
                print(f"Skipping {ref} (not found)")
                continue
            analysis = await sure_engine.analyze_transaction(tx, db)
            print(f"\n[Analysis for {ref}]")
            print(f"  Current Status: {analysis.current_status}")
            print(f"  Verified State: {analysis.verified_state}")
            print(f"  Failure Code: {analysis.failure_code}")
            print(f"  Recommended Action: {analysis.recommended_action} - {analysis.action_title}")
            print(f"  Confidence: {analysis.confidence_score}%")
            print(f"  Steps Count: {len(analysis.pipeline_steps)}")
            assert analysis.transaction_ref == ref
            assert analysis.confidence_score > 0
            assert len(analysis.pipeline_steps) == 6
            print("  -> Passed verification!")

        print("\n=== 2. TESTING RECONCILIATION ALIGNED / NOT ALIGNED LOGIC ===")
        records = db.query(models.ReconciliationRecord).all()
        print(f"Total reconciliation records: {len(records)}")
        
        summary = reconciliation_service.get_reconciliation_summary(db)
        print(f"Summary: {summary}")
        
        # Test exact ALIGNED condition: Internal == COMPLETED and PayPal == COMPLETED
        for r in records:
            expected_aligned = (r.internal_status == "COMPLETED" and r.paypal_status == "COMPLETED")
            status_label = "ALIGNED" if expected_aligned else "NOT ALIGNED"
            print(f"  Ref: {r.transaction_ref} | Internal: {r.internal_status} | PayPal: {r.paypal_status} => {status_label}")
        
        aligned_count = sum(1 for r in records if r.internal_status == "COMPLETED" and r.paypal_status == "COMPLETED")
        assert summary["aligned_records"] == aligned_count
        assert summary["not_aligned_records"] == len(records) - aligned_count
        print(f"Reconciliation health: {summary['reconciliation_health_pct']}% - Passed verification!")

        print("\n=== 3. TESTING DISPUTE EVIDENCE SUBMISSION & HISTORY PERSISTENCE ===")
        disputes = db.query(models.Dispute).all()
        assert len(disputes) > 0, "No disputes found"
        d = disputes[0]
        print(f"Testing dispute: {d.paypal_dispute_id} (ID: {d.id})")
        
        statement = "We have submitted formal delivery proof and tracking USPS #940551189922319482. Goods delivered on time."
        submit_res = dispute_service.submit_defense(d.id, statement, db)
        print(f"Submission response: {submit_res}")
        assert submit_res["success"] is True
        assert "submission_reference" in submit_res
        
        # Fetch history for this dispute
        history = dispute_service.get_submission_history(d.id, db)
        print(f"Submission history count for {d.paypal_dispute_id}: {len(history)}")
        assert len(history) > 0
        latest = history[0]
        print(f"Latest submission: Ref={latest['submission_reference']}, Status={latest['submission_status']}, Docs={len(latest['evidence_documents'])}")
        assert latest["submission_status"] == "SUBMITTED"
        assert latest["is_simulated"] is True
        assert len(latest["evidence_documents"]) > 0

        # Close session and open new session to verify true DB persistence
        db.close()
        db2 = SessionLocal()
        all_hist = dispute_service.get_all_submission_history(db2)
        print(f"Persistent history across new DB session: {len(all_hist)} submissions found.")
        assert len(all_hist) >= 1
        db2.close()
        print("  -> Passed verification!")

        print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

    finally:
        pass


if __name__ == "__main__":
    asyncio.run(test_all())
