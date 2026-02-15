"""LLM prompt optimization endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.prompt_optimizer import optimize_prompt

router = APIRouter(prefix="/api/llm", tags=["llm"])


class OptimizeRequest(BaseModel):
    prompt: str
    context: str = ""  # optional: shot type, duration, camera info


class OptimizeResponse(BaseModel):
    original: str
    optimized: str


@router.post("/optimize", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    """Enhance a rough scene description into a professional Seedance prompt."""
    if not req.prompt.strip():
        raise HTTPException(400, "Prompt cannot be empty")
    try:
        result = await optimize_prompt(req.prompt.strip(), req.context)
        return OptimizeResponse(original=req.prompt, optimized=result)
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        raise HTTPException(500, f"LLM call failed: {str(e)}")
