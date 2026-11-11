from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "merchant"
    company_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Transaction Schemas
class TransactionBase(BaseModel):
    transaction_ref: str
    paypal_order_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None
    customer_name: str
    customer_email: EmailStr
    amount: float
    currency: str = "USD"
    status: str
    failure_code: Optional[str] = None
    failure_reason: Optional[str] = None
    payment_method: str = "PAYPAL_WALLET"
    risk_score: float = 0.0
    duplicate_flag: bool = False
    duplicate_of_ref: Optional[str] = None
    is_recurring: bool = False

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# SURE Engine Schemas
class SureWorkflowStep(BaseModel):
    step_number: int
    name: str
    status: str  # PENDING, RUNNING, COMPLETED, WARNING, FAILED
    title: str
    details: str
    technical_data: Optional[Dict[str, Any]] = None

class SureAnalysisResponse(BaseModel):
    transaction_id: int
    transaction_ref: str
    current_status: str
    verified_state: str
    failure_code: Optional[str]
    failure_explanation: str
    duplicate_risk: Dict[str, Any]
    recommended_action: str
    action_title: str
    action_description: str
    action_type: str  # SAFE_RETRY, VERIFY_CAPTURE, WAIT, SWITCH_METHOD, DISPUTE, MANUAL_REVIEW
    requires_authorization: bool
    confidence_score: float
    pipeline_steps: List[SureWorkflowStep]
    created_at: datetime

class RecoveryExecuteRequest(BaseModel):
    transaction_ref: str
    strategy: str
    authorized_by: str = "Merchant Admin"
    notes: Optional[str] = None

# Duplicate Alert Schemas
class DuplicateAlertResponse(BaseModel):
    id: int
    original_tx_ref: str
    duplicate_tx_ref: str
    similarity_score: float
    time_delta_seconds: int
    amount: float
    customer_email: str
    reason: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# Dispute Schemas
class DisputeResponse(BaseModel):
    id: int
    transaction_id: int
    transaction_ref: Optional[str] = None
    paypal_dispute_id: str
    reason: str
    status: str
    dispute_amount: float
    currency: str
    evidence_pack_json: Optional[Dict[str, Any]] = None
    defense_statement: Optional[str] = None
    evidence_submitted: bool
    deadline: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

class DisputeEvidenceSubmit(BaseModel):
    dispute_id: int
    defense_statement: str
    additional_notes: Optional[str] = None

# Subscription Schemas
class SubscriptionResponse(BaseModel):
    id: int
    paypal_sub_id: str
    plan_name: str
    customer_name: str
    customer_email: str
    amount: float
    currency: str
    status: str
    failure_count: int
    last_failure_date: Optional[datetime] = None
    churn_risk: float
    recovery_strategy: str
    next_retry_date: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Reconciliation Schemas
class ReconciliationRecordResponse(BaseModel):
    id: int
    transaction_ref: str
    paypal_order_id: Optional[str] = None
    internal_status: str
    paypal_status: str
    discrepancy_type: str
    amount: float
    matched: bool
    resolution_status: str
    resolved_action: Optional[str] = None
    matched_at: datetime
    class Config:
        from_attributes = True

# Dashboard Metrics Schemas
class DashboardMetrics(BaseModel):
    total_transactions: int
    completed_transactions: int
    failed_transactions: int
    pending_transactions: int
    recovered_transactions: int
    duplicate_alerts_count: int
    total_volume: float
    total_recovered_amount: float
    recovery_success_rate: float
    avg_resolution_time_min: float
    recent_transactions: List[TransactionResponse]
    recent_alerts: List[DuplicateAlertResponse]
    volume_by_day: List[Dict[str, Any]]
    failure_distribution: List[Dict[str, Any]]
    ai_insights: List[Dict[str, Any]]

# AI Assistant Chat
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str
    transaction_context: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    referenced_tx: Optional[str] = None
