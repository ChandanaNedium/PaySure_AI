from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash

def seed_database(db: Session):
    # Check if data already exists
    if db.query(models.User).filter(models.User.email == "merchant@paysure.ai").first():
        print("[Seed] Database already seeded.")
        return

    print("[Seed] Seeding PaySure AI realistic demo data...")

    # 1. Users
    merchant_user = models.User(
        email="merchant@paysure.ai",
        full_name="Merchant Account",
        role="merchant",
        company_name="Apex Global Commerce",
        hashed_password=get_password_hash("password123")
    )
    customer_user = models.User(
        email="customer@paysure.ai",
        full_name="Customer Account",
        role="customer",
        company_name=None,
        hashed_password=get_password_hash("password123")
    )
    db.add_all([merchant_user, customer_user])
    db.flush()

    # 2. Merchant Profile
    merchant = models.Merchant(
        user_id=merchant_user.id,
        business_name="Apex Global Commerce",
        paypal_merchant_id="PP-MERCHANT-882194",
        currency="USD",
        webhook_url="https://api.paysure.ai/api/webhooks/paypal"
    )
    db.add(merchant)
    db.flush()

    # 3. Dedicated 7 Judge Demo Scenarios
    now = datetime.utcnow()

    # Scenario 1: Successful Payment
    tx_success = models.Transaction(
        transaction_ref="TX-1001-SUCCESS",
        merchant_id=merchant.id,
        paypal_order_id="5C28491823901",
        paypal_capture_id="CAP-991204812",
        customer_name="Emma Watson",
        customer_email="emma.watson@example.com",
        amount=189.50,
        currency="USD",
        status="COMPLETED",
        failure_code=None,
        failure_reason=None,
        payment_method="PAYPAL_WALLET",
        risk_score=2.0,
        duplicate_flag=False,
        idempotency_key="IDEMP-TX-1001",
        created_at=now - timedelta(hours=3),
        updated_at=now - timedelta(hours=3)
    )

    # Scenario 2: Hard Failure (Card Declined by Issuer)
    tx_decline = models.Transaction(
        transaction_ref="TX-1002-DECLINE",
        merchant_id=merchant.id,
        paypal_order_id="5C8492019482-DECLINED",
        customer_name="Michael Chang",
        customer_email="m.chang@example.com",
        amount=249.00,
        currency="USD",
        status="FAILED",
        failure_code="INSTRUMENT_DECLINED",
        failure_reason="The buyer's card issuing bank rejected the authorization request due to daily spending limit.",
        payment_method="CREDIT_CARD",
        risk_score=22.0,
        duplicate_flag=False,
        idempotency_key="IDEMP-TX-1002",
        created_at=now - timedelta(minutes=45),
        updated_at=now - timedelta(minutes=45)
    )

    # Scenario 3: Pending Bank ACH Transfer (Do NOT retry!)
    tx_ach_pending = models.Transaction(
        transaction_ref="TX-1003-ACH-PENDING",
        merchant_id=merchant.id,
        paypal_order_id="5C773829104-ACH",
        customer_name="Robert Vance",
        customer_email="rvance@vancerefrig.com",
        amount=1250.00,
        currency="USD",
        status="PENDING",
        failure_code="PAYER_ACTION_REQUIRED",
        failure_reason="Payment capture is pending bank ACH clearance. In transit through the Automated Clearing House.",
        payment_method="SEPA",
        risk_score=15.0,
        duplicate_flag=False,
        idempotency_key="IDEMP-TX-1003",
        created_at=now - timedelta(hours=8),
        updated_at=now - timedelta(hours=8)
    )

    # Scenario 4: Uncertain Status / Network Timeout (Capture Succeeded on PayPal!)
    tx_timeout = models.Transaction(
        transaction_ref="TX-1004-TIMEOUT",
        merchant_id=merchant.id,
        paypal_order_id="5C399281048-TIMEOUT",
        customer_name="Sophia Martinez",
        customer_email="smartinez@techcorp.io",
        amount=389.00,
        currency="USD",
        status="UNCERTAIN",
        failure_code="NETWORK_TIMEOUT",
        failure_reason="Communication timeout between merchant server and PayPal during capture handshake. Local state uncertain.",
        payment_method="PAYPAL_WALLET",
        risk_score=78.0,
        duplicate_flag=False,
        idempotency_key="IDEMP-TX-1004",
        created_at=now - timedelta(minutes=25),
        updated_at=now - timedelta(minutes=25)
    )

    # Scenario 5: Duplicate Payment Attempt (Clicked twice within 25 seconds!)
    tx_dup_orig = models.Transaction(
        transaction_ref="TX-1005-ORIG",
        merchant_id=merchant.id,
        paypal_order_id="5C992817263-ORIG",
        customer_name="Alexander Hayes",
        customer_email="ahayes@creativeagency.com",
        amount=79.99,
        currency="USD",
        status="COMPLETED",
        failure_code=None,
        payment_method="PAYPAL_WALLET",
        risk_score=8.0,
        duplicate_flag=False,
        idempotency_key="IDEMP-TX-1005A",
        created_at=now - timedelta(minutes=15),
        updated_at=now - timedelta(minutes=15)
    )
    tx_dup_second = models.Transaction(
        transaction_ref="TX-1005-DUPLICATE",
        merchant_id=merchant.id,
        paypal_order_id="5C992817264-DUP",
        customer_name="Alexander Hayes",
        customer_email="ahayes@creativeagency.com",
        amount=79.99,
        currency="USD",
        status="FAILED",
        failure_code="DUPLICATE_IDEMPOTENCY_CONFLICT",
        failure_reason="Identical customer and amount submitted 22 seconds after prior payment. Quarantined by Duplicate Guardian.",
        payment_method="PAYPAL_WALLET",
        risk_score=94.0,
        duplicate_flag=True,
        duplicate_of_ref="TX-1005-ORIG",
        idempotency_key="IDEMP-TX-1005A",  # identical key!
        created_at=now - timedelta(minutes=14, seconds=38),
        updated_at=now - timedelta(minutes=14, seconds=38)
    )

    # Scenario 6: Recurring Subscription Failure (Expired Card)
    tx_sub_fail = models.Transaction(
        transaction_ref="TX-1006-SUB-FAIL",
        merchant_id=merchant.id,
        paypal_order_id="5C118273645-SUB",
        customer_name="Clara Oswald",
        customer_email="clara@tardis-media.co.uk",
        amount=49.00,
        currency="USD",
        status="FAILED",
        failure_code="SUBSCRIPTION_EXPIRED_PAYMENT_METHOD",
        failure_reason="Monthly recurring subscription billing cycle failed. Primary payment card expired last month.",
        payment_method="CREDIT_CARD",
        risk_score=35.0,
        is_recurring=True,
        idempotency_key="IDEMP-TX-1006",
        created_at=now - timedelta(hours=12),
        updated_at=now - timedelta(hours=12)
    )

    # Scenario 7: Disputed Transaction (Chargeback claimed by buyer)
    tx_dispute = models.Transaction(
        transaction_ref="TX-1007-DISPUTE",
        merchant_id=merchant.id,
        paypal_order_id="5C448192038-DISP",
        customer_name="Lucas Sterling",
        customer_email="lsterling@investments.org",
        amount=540.00,
        currency="USD",
        status="DISPUTED",
        failure_code="TRANSACTION_REFUSED",
        failure_reason="Buyer filed claim: MERCHANDISE_OR_SERVICE_NOT_RECEIVED through PayPal Resolution Center.",
        payment_method="PAYPAL_WALLET",
        risk_score=85.0,
        duplicate_flag=False,
        idempotency_key="IDEMP-TX-1007",
        created_at=now - timedelta(days=2),
        updated_at=now - timedelta(days=2)
    )

    demo_txs = [
        tx_success, tx_decline, tx_ach_pending, tx_timeout,
        tx_dup_orig, tx_dup_second, tx_sub_fail, tx_dispute
    ]
    db.add_all(demo_txs)
    db.flush()

    # 4. Additional historical transactions for realistic metrics
    additional_txs = [
        models.Transaction(
            transaction_ref=f"TX-HIST-{i:04d}",
            merchant_id=merchant.id,
            paypal_order_id=f"5C9900{i:05d}",
            customer_name=f"Customer {i}",
            customer_email=f"user{i}@globalretail.com",
            amount=round(45.0 + (i * 17.5) % 350, 2),
            currency="USD",
            status="COMPLETED" if i % 5 != 0 else ("RECOVERED" if i % 10 == 0 else "FAILED"),
            failure_code="INSTRUMENT_DECLINED" if i % 5 == 0 else None,
            payment_method="PAYPAL_WALLET" if i % 2 == 0 else "CREDIT_CARD",
            risk_score=round((i * 7.3) % 40, 1),
            created_at=now - timedelta(days=(i % 14), hours=(i % 24))
        )
        for i in range(1, 45)
    ]
    db.add_all(additional_txs)

    # 5. Duplicate Alert Record
    dup_alert = models.DuplicateAlert(
        original_tx_id=tx_dup_orig.id,
        original_tx_ref=tx_dup_orig.transaction_ref,
        duplicate_tx_id=tx_dup_second.id,
        duplicate_tx_ref=tx_dup_second.transaction_ref,
        similarity_score=98.5,
        time_delta_seconds=22,
        amount=79.99,
        customer_email="ahayes@creativeagency.com",
        reason="Rapid double-click checkout: Identical amount and email within 22 seconds.",
        status="DETECTED"
    )
    db.add(dup_alert)

    # 6. Dispute Record
    dispute = models.Dispute(
        transaction_id=tx_dispute.id,
        paypal_dispute_id="PP-D-99827162",
        reason="MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
        status="EVIDENCE_REQUIRED",
        dispute_amount=540.00,
        currency="USD",
        deadline=now + timedelta(days=6),
        created_at=now - timedelta(days=2)
    )
    db.add(dispute)

    # 7. Subscriptions
    subs = [
        models.Subscription(
            paypal_sub_id="I-SUB-ALPHA-01",
            plan_name="Enterprise Cloud SaaS Annual",
            customer_name="Clara Oswald",
            customer_email="clara@tardis-media.co.uk",
            amount=49.00,
            currency="USD",
            billing_cycle="MONTHLY",
            status="PAST_DUE",
            failure_count=2,
            last_failure_date=now - timedelta(days=1),
            churn_risk=68.5,
            recovery_strategy="SMART_DUNNING"
        ),
        models.Subscription(
            paypal_sub_id="I-SUB-BETA-02",
            plan_name="Pro Developer Tier",
            customer_name="Marcus Aurelius",
            customer_email="marcus@stoiclabs.io",
            amount=29.00,
            currency="USD",
            billing_cycle="MONTHLY",
            status="ACTIVE",
            failure_count=0,
            churn_risk=8.0,
            recovery_strategy="STANDARD"
        ),
        models.Subscription(
            paypal_sub_id="I-SUB-GAMMA-03",
            plan_name="Fintech Analytics Pro",
            customer_name="Elena Rostova",
            customer_email="elena@rostovacapital.com",
            amount=199.00,
            currency="USD",
            billing_cycle="MONTHLY",
            status="RECOVERED",
            failure_count=1,
            last_failure_date=now - timedelta(days=5),
            churn_risk=18.0,
            recovery_strategy="SMART_DUNNING"
        )
    ]
    db.add_all(subs)

    # 8. Reconciliation Records
    reconciliations = [
        models.ReconciliationRecord(
            transaction_ref=tx_timeout.transaction_ref,
            paypal_order_id=tx_timeout.paypal_order_id,
            internal_status="UNCERTAIN",
            paypal_status="COMPLETED",
            discrepancy_type="STATUS_MISMATCH",
            amount=389.00,
            matched=False,
            resolution_status="PENDING"
        ),
        models.ReconciliationRecord(
            transaction_ref="TX-RECON-8812",
            paypal_order_id="5C8819203941",
            internal_status="PENDING",
            paypal_status="COMPLETED",
            discrepancy_type="TIMING_DRIFT",
            amount=115.00,
            matched=False,
            resolution_status="PENDING"
        ),
        models.ReconciliationRecord(
            transaction_ref="TX-RECON-7721",
            paypal_order_id="5C7721094821",
            internal_status="COMPLETED",
            paypal_status="COMPLETED",
            discrepancy_type="NONE",
            amount=420.00,
            matched=True,
            resolution_status="RESOLVED"
        )
    ]
    db.add_all(reconciliations)

    # 9. Audit Logs
    audit1 = models.AuditLog(
        user_email="merchant@paysure.ai",
        action="SYSTEM_INITIALIZED",
        entity_type="SYSTEM",
        entity_id="PAYSURE-CORE",
        details="PaySure AI SURE Engine and Duplicate Guardian initialized successfully.",
        timestamp=now - timedelta(hours=24)
    )
    audit2 = models.AuditLog(
        user_email="system@paysure.ai",
        action="DUPLICATE_QUARANTINED",
        entity_type="TRANSACTION",
        entity_id=tx_dup_second.transaction_ref,
        details="Quarantined duplicate payment attempt 22s after prior checkout.",
        timestamp=now - timedelta(minutes=14)
    )
    db.add_all([audit1, audit2])

    db.commit()
    print("[Seed] PaySure AI successfully seeded with 7 judge demo scenarios and historical data!")
