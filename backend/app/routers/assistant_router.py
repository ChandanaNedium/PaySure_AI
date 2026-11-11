from fastapi import APIRouter
from app import schemas
from app.engines.ai_engine import ai_engine

router = APIRouter(prefix="/assistant", tags=["PaySure AI Assistant"])

@router.post("/chat", response_model=schemas.ChatResponse)
async def chat_with_assistant(chat_msg: schemas.ChatMessage):
    res = await ai_engine.generate_chat_response(
        user_message=chat_msg.content,
        transaction_context=chat_msg.transaction_context
    )
    return schemas.ChatResponse(
        reply=res["reply"],
        suggested_actions=res.get("suggested_actions", []),
        referenced_tx=res.get("referenced_tx")
    )
