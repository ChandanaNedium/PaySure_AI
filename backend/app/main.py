from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.routers import (
    auth_router,
    transactions_router,
    sure_engine_router,
    duplicates_router,
    failure_router,
    reconciliation_router,
    disputes_router,
    subscriptions_router,
    analytics_router,
    assistant_router,
    demo_router
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Auto-seed initial demo data
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Payment Recovery & Protection Engine for PayPal"
)

# CORS setup for React Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(transactions_router.router, prefix=settings.API_V1_STR)
app.include_router(sure_engine_router.router, prefix=settings.API_V1_STR)
app.include_router(duplicates_router.router, prefix=settings.API_V1_STR)
app.include_router(failure_router.router, prefix=settings.API_V1_STR)
app.include_router(reconciliation_router.router, prefix=settings.API_V1_STR)
app.include_router(disputes_router.router, prefix=settings.API_V1_STR)
app.include_router(subscriptions_router.router, prefix=settings.API_V1_STR)
app.include_router(analytics_router.router, prefix=settings.API_V1_STR)
app.include_router(assistant_router.router, prefix=settings.API_V1_STR)
app.include_router(demo_router.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": settings.PAYPAL_MODE
    }

@app.post("/api/webhooks/paypal")
async def paypal_webhook_receiver(request: Request):
    payload = await request.json()
    event_type = payload.get("event_type", "UNKNOWN_EVENT")
    print(f"[PayPal Webhook Received] {event_type}")
    return {"received": True, "event_type": event_type}
