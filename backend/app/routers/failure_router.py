from typing import List, Dict, Any
from fastapi import APIRouter, Query
from app.engines.failure_detective import failure_detective

router = APIRouter(prefix="/failure-detective", tags=["Failure Detective"])

@router.get("/diagnose")
def diagnose_error(code: str = Query(..., description="PayPal error code")):
    return failure_detective.diagnose(code)

@router.get("/catalog")
def get_all_catalog():
    return failure_detective.list_all_diagnostics()
