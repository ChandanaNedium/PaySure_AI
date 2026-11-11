from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="merchant")  # merchant, customer, admin
    company_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    merchants = relationship("Merchant", back_populates="user")

class Merchant(Base):
    __tablename__ = "merchants"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    business_name = Column(String(255), nullable=False)
    paypal_merchant_id = Column(String(100), default="PAYPAL-MERCHANT-DEMO-01")
    currency = Column(String(10), default="USD")
    webhook_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="merchants")
    transactions = relationship("Transaction", back_populates="merchant")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_ref = Column(String(64), unique=True, index=True, nullable=False)  # e.g., TX-84920
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=True)
    paypal_order_id = Column(String(128), index=True, nullable=True)  # e.g., 5C2849182390
    paypal_capture_id = Column(String(128), index=True, nullable=True)
    idempotency_key = Column(String(128), index=True, nullable=True)
    
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    
    # Statuses: COMPLETED, FAILED, PENDING, UNCERTAIN, RECOVERED, DISPUTED, REFUNDED
    status = Column(String(50), default="PENDING", index=True)
    
    # Failure diagnostics
    failure_code = Column(String(100), nullable=True)  # e.g., INSTRUMENT_DECLINED, PAYER_ACTION_REQUIRED
    failure_reason = Column(Text, nullable=True)
    payment_method = Column(String(50), default="PAYPAL_WALLET")  # PAYPAL_WALLET, CARD, PAY_IN_4, SEPA, VENMO
    
    # Intelligence attributes
    risk_score = Column(Float, default=0.0)  # 0.0 to 100.0
    duplicate_flag = Column(Boolean, default=False)
    duplicate_of_ref = Column(String(64), nullable=True)
    is_recurring = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    merchant = relationship("Merchant", back_populates="transactions")
    events = relationship("PaymentEvent", back_populates="transaction", cascade="all, delete-orphan")
    recovery_attempts = relationship("RecoveryAttempt", back_populates="transaction", cascade="all, delete-orphan")
    disputes = relationship("Dispute", back_populates="transaction")

class PaymentEvent(Base):
    __tablename__ = "payment_events"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    event_type = Column(String(100), nullable=False)  # e.g. PAYMENT.CAPTURE.DENIED, CHECKOUT.ORDER.APPROVED
    source = Column(String(50), default="PAYPAL_WEBHOOK")  # PAYPAL_WEBHOOK, CLIENT_SDK, RECONCILIATION
    payload_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    transaction = relationship("Transaction", back_populates="events")

class RecoveryAttempt(Base):
    __tablename__ = "recovery_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    strategy = Column(String(100), nullable=False)  # VERIFY_STATE, RETRY_SAFE_IDEMPOTENCY, ALTERNATIVE_METHOD, WAIT_CLEARING
    status = Column(String(50), default="INITIATED")  # INITIATED, SUCCEEDED, FAILED, CANCELLED
    recommended_by = Column(String(50), default="SURE_ENGINE")
    
    explanation = Column(Text, nullable=True)
    outcome_note = Column(Text, nullable=True)
    amount_recovered = Column(Float, default=0.0)
    
    authorization_required = Column(Boolean, default=True)
    authorized_by = Column(String(100), nullable=True)
    executed_at = Column(DateTime, default=datetime.utcnow)
    
    transaction = relationship("Transaction", back_populates="recovery_attempts")

class DuplicateAlert(Base):
    __tablename__ = "duplicate_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    original_tx_id = Column(Integer, nullable=False)
    original_tx_ref = Column(String(64), nullable=False)
    duplicate_tx_id = Column(Integer, nullable=False)
    duplicate_tx_ref = Column(String(64), nullable=False)
    
    similarity_score = Column(Float, default=95.0)
    time_delta_seconds = Column(Integer, default=0)
    amount = Column(Float, nullable=False)
    customer_email = Column(String(255), nullable=False)
    
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="DETECTED")  # DETECTED, BLOCKED, RESOLVED_REFUNDED, DISMISSED
    created_at = Column(DateTime, default=datetime.utcnow)

class Dispute(Base):
    __tablename__ = "disputes"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    paypal_dispute_id = Column(String(128), unique=True, index=True, nullable=False)
    
    reason = Column(String(100), nullable=False)  # UNAUTHORIZED, MERCHANDISE_OR_SERVICE_NOT_RECEIVED
    status = Column(String(50), default="UNDER_REVIEW")  # UNDER_REVIEW, EVIDENCE_REQUIRED, RESOLVED_MERCHANT, RESOLVED_BUYER
    dispute_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    
    evidence_pack_json = Column(JSON, nullable=True)
    defense_statement = Column(Text, nullable=True)
    evidence_submitted = Column(Boolean, default=False)
    
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    transaction = relationship("Transaction", back_populates="disputes")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    paypal_sub_id = Column(String(128), unique=True, index=True, nullable=False)
    plan_name = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    billing_cycle = Column(String(50), default="MONTHLY")
    
    status = Column(String(50), default="ACTIVE")  # ACTIVE, PAST_DUE, CANCELLED, RECOVERED
    failure_count = Column(Integer, default=0)
    last_failure_date = Column(DateTime, nullable=True)
    churn_risk = Column(Float, default=15.0)  # Percentage 0-100
    
    recovery_strategy = Column(String(100), default="SMART_DUNNING")
    next_retry_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ReconciliationRecord(Base):
    __tablename__ = "reconciliation_records"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_ref = Column(String(64), index=True, nullable=False)
    paypal_order_id = Column(String(128), nullable=True)
    
    internal_status = Column(String(50), nullable=False)
    paypal_status = Column(String(50), nullable=False)
    discrepancy_type = Column(String(100), nullable=False)  # STATUS_MISMATCH, ORPHANED_EVENT, TIMING_DRIFT
    
    amount = Column(Float, nullable=False)
    matched = Column(Boolean, default=False)
    resolution_status = Column(String(50), default="PENDING")  # PENDING, RESOLVED, IGNORED
    resolved_action = Column(String(100), nullable=True)
    matched_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), default="system")
    action = Column(String(100), nullable=False)  # RECOVERY_EXECUTED, DUPLICATE_BLOCKED, EVIDENCE_SUBMITTED
    entity_type = Column(String(50), nullable=False)  # TRANSACTION, DISPUTE, SUBSCRIPTION
    entity_id = Column(String(64), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
