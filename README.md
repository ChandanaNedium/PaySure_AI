# PaySure AI – Smart Payment Recovery

> **"Don't blindly retry a payment. Understand it, protect it, and recover it intelligently."**

[![PayPal Integration](https://img.shields.io/badge/PayPal-REST%20APIs%20%26%20Sandbox-003087?style=for-the-badge&logo=paypal&logoColor=white)](https://developer.paypal.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 1. Executive Summary & Product Vision

In the global payment ecosystem, payment failures result in over **$118 billion** in lost e-commerce revenue annually. Today's standard practice—*blind, automated retrying of failed transactions*—creates severe unintended consequences:

- **Customer Overcharges**: Retrying an uncertain or delayed payment often charges the buyer twice.
- **Card Network Penalties**: Issuing banks penalize merchants who repeatedly submit declined cards without addressing the underlying decline cause.
- **Lost Subscriptions & Churn**: 30%+ of SaaS churn stems from passive recurring payment failures (expired cards, temporary limits).
- **Merchant Chargeback Liability**: Unprepared merchants lose legitimate dispute claims due to disorganized evidence.

**PaySure AI** is an intelligent payment recovery and protection platform built specifically for the **PayPal payment ecosystem**. At its core is the proprietary **SURE Engine (Smart Unified Recovery Engine)**, which validates gateway truth, diagnoses root failure causes, eliminates duplicate charges, and executes safe, authorized recovery workflows.

---

## 2. The SURE Engine (Smart Unified Recovery Engine)

The SURE Engine follows a deterministic, 6-phase verification and recovery lifecycle:

```
┌─────────────────────────┐
│ 1. Transaction Received │  → Ingest transaction metadata, client headers, idempotency tokens
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ 2. State Verification   │  → Query PayPal REST API to verify true gateway status vs internal record
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ 3. Failure Diagnosis    │  → Classify failure code (Soft Decline, Hard Decline, Timeout, 3DS Expiry)
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ 4. Risk Assessment      │  → Evaluate duplicate risk score (0-100), idempotency collisions, churn impact
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ 5. AI Recommendation    │  → Formulate optimal recovery action with confidence rating & reasoning
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ 6. Safe Resolution      │  → Merchant-authorized execution with immutable audit trail & idempotency key
└─────────────────────────┘
```

---

## 3. Core Capabilities & Feature Modules

### 🛡️ Smart Payment Recovery (Core Engine)
- Deep analysis of failed, uncertain, and pending transactions.
- Never blindly retries without verified server state and explicit merchant authorization.
- Generates contextual recovery plans: `Reconcile Capture`, `Safe Retry with Idempotency`, `Switch Payment Method`, `Wait for ACH Clearance`, or `Compile Dispute Defense`.

### 👥 Duplicate Payment Guardian
- Intercepts rapid repeated checkout clicks (e.g. buyer double-clicking "Pay Now" on a slow mobile connection).
- Employs multi-factor heuristics (Time delta `< 15m`, exact amount, same customer email, idempotency collisions).
- Side-by-side transaction comparison with 1-click **"Void / Refund Duplicate"** or **"Confirm Legitimate Purchase"** actions.

### 🔍 AI Failure Detective
- Translates opaque PayPal error codes (`INSTRUMENT_DECLINED`, `PAYER_ACTION_REQUIRED`, `NETWORK_TIMEOUT`, `INSUFFICIENT_FUNDS`, `TRANSACTION_REFUSED`) into plain, transparent English.
- Outlines exact step-by-step guidance for **Customers** (e.g. check mobile banking app, switch to PayPal Wallet) and **Merchants** (e.g. send alternative instrument recovery link).

### ⚖️ Smart Ledger Reconciliation
- Compares internal merchant database records against asynchronous PayPal webhook notifications and Order Capture APIs.
- Detects **Status Mismatches**, **Orphaned Captures**, and **Timing Drifts**.
- 1-Click **"Align to PayPal"** resolves ledger discrepancies with an immutable audit log.

### 📄 Dispute Evidence Assistant
- Organizes payment references, tracking IDs, delivery confirmations, and customer consent logs into structured evidence dossiers.
- Generates formal, persuasive dispute defense statements optimized for **PayPal Seller Protection** compliance.
- Enforces mandatory merchant review before submission.

### 🔄 Subscription Rescue
- Recovers recurring SaaS and subscription billing disruptions.
- Predicts subscriber churn probability based on failure velocity.
- Triggers automated **72-hour Smart Dunning Grace Periods** allowing customers to update their expired payment cards without interrupting access.

### 📊 Merchant Analytics & ROI
- Dynamic recovery success rates, revenue saved metrics, and payment method performance charts built with Recharts.
- Calculates net positive merchant yield generated by the SURE Engine.

### 🤖 PaySure AI Assistant (Copilot)
- Conversational fintech copilot capable of answering questions such as:
  - *"Has my customer's money been deducted?"*
  - *"Is it safe to retry transaction TX-1004?"*
  - *"Why was my transaction flagged as a duplicate?"*
- Directly grounded in real transaction data without hallucinations.

---

## 4. Hackathon Judge Interactive Demo Guide

PaySure AI features a dedicated **Interactive Judge Demo Bar** anchored at the top of the interface, providing 1-click execution for **7 realistic payment scenarios**:

| # | Scenario Title | Initial Status | Issue Discovered | SURE Engine Recommended Action |
|---|----------------|----------------|------------------|--------------------------------|
| **1** | **Successful Checkout** | `COMPLETED` | Normal baseline transaction | Zero risk. Baseline audit log. |
| **2** | **Card Declined (Hard Decline)** | `FAILED` | Issuing bank declined debit card | **Switch Instrument**: Prompt customer for PayPal Balance or alternate card. Retrying same card blocked. |
| **3** | **Bank ACH In Transit** | `PENDING` | SEPA / ACH clearing delay | **Wait for Settlement**: Halt retry! In transit through clearing house (2 business days). |
| **4** | **Network Timeout / State Drift** | `UNCERTAIN` | Merchant timed out, but PayPal **captured** the order! | **Reconcile Capture (Do Not Retry)**: Order was already paid! Mark internal order as PAID without double-charging. |
| **5** | **Rapid Double-Click Duplicate** | `DUPLICATE` | Buyer clicked 'Pay' twice in 22 seconds | **Quarantine Duplicate**: Flag idempotency collision, void secondary request, protect buyer. |
| **6** | **SaaS Subscription Card Expired** | `PAST DUE` | Recurring billing failed due to expired credit card | **Smart Dunning**: 72-hour grace period with automated card update email. Prevent immediate cancellation. |
| **7** | **PayPal Chargeback Dispute** | `DISPUTED` | Buyer claimed Item Not Received | **Dispute Defense**: Compile proof of shipment, tracking ID, and TOS timestamp into formal response. |

Judges can click any scenario pill to load its live analysis into the SURE Engine, inspect the 6-step pipeline, and click **"Authorize & Execute Action"** to witness real-time status updates and ledger recovery.

---

## 5. Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS v4, Lucide React, Framer Motion, Recharts, Axios.
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn, Python-Jose (JWT Auth), Cryptography.
- **Database**: SQLite (out-of-the-box local development, seamless migration to PostgreSQL).
- **Payment Integration**: PayPal REST APIs v1/v2 (Orders, Captures, Disputes, Subscriptions, Webhooks) + High-Fidelity Sandbox Simulator.
- **AI Intelligence**: Configurable AI layer (OpenAI, Gemini, Groq, or built-in Expert Knowledge Engine).

---

## 6. Getting Started & Local Setup

### Prerequisites
- Node.js v18+ and npm v9+
- Python 3.10+

### Step 1: Clone Repository
```bash
git clone https://github.com/ChandanaNedium/PaySure_AI.git
cd PaySure_AI
```

### Step 2: Start Backend (FastAPI)
```bash
# In project root:
# Activate existing virtual environment or create new:
python -m venv backend/venv
.\backend\venv\Scripts\activate   # Windows
# source backend/venv/bin/activate # macOS/Linux

pip install -r backend/requirements.txt

# Run backend server:
$env:PYTHONPATH="backend"         # Windows PowerShell
python backend/run.py
```
*Backend will start on `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.*
*The database automatically creates and seeds with all 52 realistic transactions and 7 judge scenarios on first launch.*

### Step 3: Start Frontend (React + Vite)
```bash
# In a separate terminal:
cd frontend
npm install
npm run dev
```
*Frontend will launch on `http://localhost:5173`.*

---

## 7. PayPal Sandbox Configuration

PaySure AI works out-of-the-box in **High-Fidelity Simulator Mode** without requiring live API keys. 

To connect your live PayPal Sandbox account:
1. Navigate to **PayPal & Settings** in the PaySure sidebar.
2. Enter your PayPal Sandbox `Client ID`, `Client Secret`, and `Webhook ID` obtained from [developer.paypal.com](https://developer.paypal.com).
3. Click **"Test Connection"** to verify OAuth2 token generation.
4. Toggle environment mode to **PayPal Sandbox**.

---

## 8. Security & Compliance
- **No Blind Retries**: System enforces state verification before any retry command.
- **Idempotency Guarantee**: All payment actions include a unique UUID `PayPal-Request-Id` preventing network duplicates.
- **Role-Based Access Control**: Distinct capabilities for Merchants, Buyers, and Platform Admins.
- **Zero Sensitive Storage**: Card CVV and raw credentials are never stored.
- **Cryptographic Audit Trail**: Every recovery and refund action creates an immutable log.

---

## 9. License

Developed for the **PayPal Global Hackathon 2026**.
All rights reserved.
