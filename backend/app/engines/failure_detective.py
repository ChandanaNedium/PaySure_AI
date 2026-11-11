from typing import Dict, Any, List

class FailureDetective:
    """
    AI Failure Detective: Translates opaque PayPal API and gateway error codes
    into transparent, actionable insights for non-technical users and merchants.
    """

    ERROR_CATALOG = {
        "INSTRUMENT_DECLINED": {
            "title": "Payment Method Declined by Issuer",
            "category": "BUYER_INSTRUMENT",
            "risk_level": "LOW",
            "plain_english": "The buyer's bank or card company rejected the charge authorization.",
            "common_causes": [
                "Temporary bank security block on online international merchant transactions",
                "Daily spend or card withdrawal ceiling exceeded",
                "Insufficient funds or line of credit in bank account",
                "Card expired or updated CVV required"
            ],
            "customer_action": "Log in to your mobile banking app to authorize the transaction, or switch to your PayPal wallet balance.",
            "merchant_action": "Do NOT re-submit the same card. Trigger PaySure's 'Switch Payment Method' prompt to send the buyer an alternative payment link."
        },
        "PAYER_ACTION_REQUIRED": {
            "title": "3D-Secure / Multi-Factor Authentication Incomplete",
            "category": "AUTHENTICATION_CHALLENGE",
            "risk_level": "LOW",
            "plain_english": "The buyer needed to confirm their identity via SMS OTP or banking app biometric prompt, but the session closed before completion.",
            "common_causes": [
                "Buyer navigated away from popup modal before entering SMS verification code",
                "SMS delivery latency caused authentication window timeout",
                "Ad-blocker prevented the 3D-Secure iframe from loading"
            ],
            "customer_action": "Click the payment link again and keep the banking verification tab open until you see the confirmation checkmark.",
            "merchant_action": "Generate an active 3DS recovery link. No authorization hold was placed on buyer's card."
        },
        "NETWORK_TIMEOUT": {
            "title": "Gateway Communication Dropout (High Risk State)",
            "category": "NETWORK_INFRASTRUCTURE",
            "risk_level": "CRITICAL",
            "plain_english": "The merchant system lost connection with PayPal while waiting for the capture response. The money may already be deducted!",
            "common_causes": [
                "Cloud server timeout during peak traffic",
                "Buyer closed mobile browser immediately after clicking 'Complete Order'",
                "PayPal webhook notification delivery delayed by queuing"
            ],
            "customer_action": "Do NOT place a new order right now. Check your PayPal activity feed or email receipt to confirm if the payment went through.",
            "merchant_action": "CRITICAL: Do NOT execute an automated retry. Run SURE Engine State Verification to poll the PayPal Order capture endpoint directly."
        },
        "INSUFFICIENT_FUNDS": {
            "title": "Insufficient Funds in Account",
            "category": "BALANCE_DEFICIT",
            "risk_level": "LOW",
            "plain_english": "The linked bank account or debit card does not possess enough balance to cover the total order amount.",
            "common_causes": [
                "Available checking balance is below cart value",
                "Pending holds from other merchants temporarily reduced available funds"
            ],
            "customer_action": "Top up your PayPal balance or choose PayPal Pay in 4 to split the purchase into four interest-free installments.",
            "merchant_action": "Display Pay in 4 (BNPL) options at checkout to boost conversion on higher-ticket cart totals."
        },
        "DUPLICATE_IDEMPOTENCY_CONFLICT": {
            "title": "Duplicate Submission Blocked by Guardian",
            "category": "IDEMPOTENCY_PROTECTION",
            "risk_level": "HIGH",
            "plain_english": "The buyer submitted multiple requests within a few seconds, or refreshed the confirmation page.",
            "common_causes": [
                "Buyer double-clicked 'Pay Now' button rapidly",
                "Slow network response led buyer to hit refresh"
            ],
            "customer_action": "You have only been charged once. Your receipt was generated for the primary transaction.",
            "merchant_action": "Verify primary transaction reference. The secondary submission has been quarantined safely."
        },
        "TRANSACTION_REFUSED": {
            "title": "Transaction Refused by PayPal Risk Filter",
            "category": "RISK_AND_COMPLIANCE",
            "risk_level": "MEDIUM",
            "plain_english": "PayPal's internal automated security algorithms flagged this transaction as potentially anomalous.",
            "common_causes": [
                "IP geolocation mismatch with shipping address",
                "High-velocity card attempts across different merchants",
                "New PayPal account attempting high-value transaction"
            ],
            "customer_action": "Ensure VPN is disabled and billing address matches your registered card address exactly.",
            "merchant_action": "Review order details and verify customer email before manually requesting an alternative payment method."
        }
    }

    def diagnose(self, code: str) -> Dict[str, Any]:
        cleaned_code = code.strip().upper() if code else "INSTRUMENT_DECLINED"
        info = self.ERROR_CATALOG.get(cleaned_code, {
            "title": f"Payment Exception ({cleaned_code})",
            "category": "GENERAL_PAYMENT_ERROR",
            "risk_level": "MEDIUM",
            "plain_english": f"Transaction encountered an error: {cleaned_code}. PaySure SURE Engine has quarantined it for safety.",
            "common_causes": ["System processing delay", "Card verification timeout", "Gateway communication glitch"],
            "customer_action": "Verify your PayPal transaction history or try an alternative payment method.",
            "merchant_action": "Run SURE Engine State Verification to verify gateway truth."
        })
        return {
            "code": cleaned_code,
            **info
        }

    def list_all_diagnostics(self) -> List[Dict[str, Any]]:
        return [self.diagnose(code) for code in self.ERROR_CATALOG.keys()]

failure_detective = FailureDetective()
