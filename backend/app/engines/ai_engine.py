import os
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings

class AIEngine:
    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL

    async def generate_explanation(self, failure_code: str, payment_method: str, amount: float, current_status: str) -> str:
        """Generates clear, human-understandable explanation for payment failures"""
        if self.api_key and self.provider != "local_expert":
            try:
                prompt = (
                    f"Explain this PayPal payment failure to a merchant and customer in plain, helpful language without technical jargon.\n"
                    f"Failure Code: {failure_code}\n"
                    f"Payment Method: {payment_method}\n"
                    f"Amount: ${amount}\n"
                    f"Status: {current_status}\n"
                    f"Highlight why it happened and what is the safest next action."
                )
                return await self._call_llm(prompt)
            except Exception as e:
                print(f"[AIEngine] LLM call failed, falling back to local expert: {e}")

        # Local Domain-Specific Expert Synthesis
        knowledge_base = {
            "INSTRUMENT_DECLINED": (
                f"The buyer's {payment_method.replace('_', ' ')} was declined by their issuing bank. "
                "This typically occurs due to security hold, daily spend limits, or insufficient available balance. "
                "The money has NOT been deducted. Blindly retrying will cause repeated card penalties. "
                "Recommended: Prompt the customer to authorize the charge in their bank app or switch to PayPal Balance or an alternate card."
            ),
            "PAYER_ACTION_REQUIRED": (
                "The transaction requires 3D-Secure biometric or SMS two-factor authentication from the buyer. "
                "The authentication window likely expired or was dismissed by the customer before completion. "
                "No funds were moved. Resend a fresh authentication link rather than creating a duplicate charge."
            ),
            "NETWORK_TIMEOUT": (
                "A communication drop occurred between PayPal's payment gateway and the merchant backend after checkout submission. "
                "CRITICAL WARNING: The customer's funds may ALREADY have been authorized or captured by PayPal! "
                "Do NOT retry this transaction immediately. Run State Verification to inspect PayPal Order status first."
            ),
            "INSUFFICIENT_FUNDS": (
                f"The customer's linked balance or bank account has insufficient funds to complete the ${amount:.2f} payment. "
                "PayPal automatically prevented an overdraft. "
                "Recommended: Offer PayPal Pay in 4 (Buy Now Pay Later) or an alternate payment method."
            ),
            "DUPLICATE_IDEMPOTENCY_CONFLICT": (
                "PaySure Duplicate Guardian detected a nearly identical transaction initiated within a short time interval. "
                "The second attempt was quarantined to protect the buyer from being billed twice. "
                "Verify the first transaction before releasing the hold."
            ),
            "TRANSACTION_REFUSED": (
                "PayPal's internal risk and fraud scoring filters refused this transaction due to mismatched billing information, "
                "unusual geographical IP location, or velocity flags. "
                "Manual review or alternate verification is advised."
            ),
            "CURRENCY_CONVERSION_UNSUPPORTED": (
                "The buyer's funding instrument does not support automatic currency exchange for the requested currency. "
                "Merchant should enable PayPal multi-currency auto-settlement."
            ),
            "SUBSCRIPTION_EXPIRED_PAYMENT_METHOD": (
                "The recurring billing cycle failed because the buyer's credit card linked to this PayPal subscription has expired. "
                "Do not cancel the subscription. Trigger the PaySure Smart Dunning Grace Period to notify the subscriber."
            )
        }
        return knowledge_base.get(
            failure_code,
            f"Transaction failed with code '{failure_code}'. PaySure SURE Engine has quarantined the transaction "
            "to prevent duplicate charges while state verification is underway."
        )

    async def generate_chat_response(self, user_message: str, transaction_context: Optional[str] = None) -> Dict[str, Any]:
        """Provides context-aware conversational assistance for customers and merchants"""
        user_msg_lower = user_message.lower()

        if "deducted" in user_msg_lower or "charged" in user_msg_lower:
            return {
                "reply": (
                    "**Has your money been deducted?**\n\n"
                    "• If your transaction shows **FAILED** or **DECLINED**, PayPal releases the authorization hold immediately. No funds are transferred to the merchant.\n"
                    "• If your transaction shows **PENDING (ACH / eCheck)**, your bank is processing clearing (typically 2-3 business days). Do NOT pay again.\n"
                    "• If you experienced a **NETWORK TIMEOUT**, check your PaySure dashboard for the 'Verified State'. Our SURE Engine confirms whether PayPal captured the order before you take any action."
                ),
                "suggested_actions": ["Verify Transaction State", "Inspect Bank Activity", "Contact PaySure Support"],
                "referenced_tx": transaction_context
            }

        if "safe to retry" in user_msg_lower or "retry" in user_msg_lower:
            return {
                "reply": (
                    "**Is it safe to retry this payment?**\n\n"
                    "⚠️ **PaySure Rule #1**: Never blindly click retry.\n\n"
                    "1. If PaySure shows **Risk Score < 20** and verified state is **NOT_CHARGED**, it is 100% safe to retry using an **Idempotency Key**.\n"
                    "2. If the failure was **INSTRUMENT_DECLINED**, retrying the same card will fail again. Switch payment method to PayPal Wallet or another card.\n"
                    "3. If the payment is **UNCERTAIN**, let the SURE Engine verify the PayPal capture status first."
                ),
                "suggested_actions": ["Run SURE Verification", "Switch Payment Method", "Check Duplicate Guardian"],
                "referenced_tx": transaction_context
            }

        if "duplicate" in user_msg_lower or "twice" in user_msg_lower:
            return {
                "reply": (
                    "**Duplicate Payment Protection**:\n\n"
                    "PaySure's Duplicate Payment Guardian monitors transactions in real-time. If multiple checkout clicks occur within 3 minutes for identical amounts:\n\n"
                    "• The second request is automatically assigned an idempotency lock.\n"
                    "• If the first succeeded, the duplicate is cancelled or automatically refunded.\n"
                    "• Check the **Duplicate Guardian** page to view and resolve any pending alerts."
                ),
                "suggested_actions": ["Open Duplicate Guardian", "View Pending Alerts", "Request Refund"],
                "referenced_tx": transaction_context
            }

        if "dispute" in user_msg_lower or "chargeback" in user_msg_lower:
            return {
                "reply": (
                    "**Dispute Evidence Assistant**:\n\n"
                    "When a buyer files an 'Item Not Received' or 'Unauthorized Transaction' dispute on PayPal:\n\n"
                    "• PaySure automatically gathers delivery tracking, order history, IP logs, and customer communication.\n"
                    "• The AI generates a structured, formal defense package complying with PayPal Seller Protection guidelines.\n"
                    "• You can review and submit this directly from the **Disputes** tab."
                ),
                "suggested_actions": ["Open Dispute Assistant", "Generate Evidence Packet", "Review Seller Protection"],
                "referenced_tx": transaction_context
            }

        # Default helpful assistant response
        return {
            "reply": (
                f"Hello! I am **PaySure AI Assistant**, your intelligent payment recovery copilot. "
                f"{f'I see you are inquiring about transaction {transaction_context}. ' if transaction_context else ''}"
                "I can help you understand why payments fail, check whether money was debited, prevent duplicate charges, "
                "or guide you through the SURE Engine recovery workflow. What would you like to check?"
            ),
            "suggested_actions": ["Analyze Failed Payment", "Run Duplicate Scan", "Check Subscription Health"],
            "referenced_tx": transaction_context
        }

    async def _call_llm(self, prompt: str) -> str:
        """Call external LLM API if key is present"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are PaySure AI, a senior payment systems architect and fintech specialist for PayPal."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=body)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
            else:
                raise RuntimeError(f"LLM API returned status {res.status_code}")

ai_engine = AIEngine()
