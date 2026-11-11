import os

class Settings:
    PROJECT_NAME: str = "PaySure AI – Smart Payment Recovery"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "paysure_secret_super_secure_key_2026_fintech_hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./paysure.db")
    
    # PayPal Configuration
    PAYPAL_MODE: str = os.getenv("PAYPAL_MODE", "sandbox")  # sandbox or live
    PAYPAL_CLIENT_ID: str = os.getenv("PAYPAL_CLIENT_ID", "demo_sandbox_client_id_paysure")
    PAYPAL_CLIENT_SECRET: str = os.getenv("PAYPAL_CLIENT_SECRET", "demo_sandbox_client_secret_paysure")
    PAYPAL_SANDBOX_BASE_URL: str = "https://api-m.sandbox.paypal.com"
    PAYPAL_LIVE_BASE_URL: str = "https://api-m.paypal.com"
    PAYPAL_WEBHOOK_ID: str = os.getenv("PAYPAL_WEBHOOK_ID", "DEMO_WEBHOOK_ID_PAYSURE_99")
    
    # AI Engine Provider (Configurable for OpenAI, Gemini, Groq, or Local Expert)
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "local_expert")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")

settings = Settings()
