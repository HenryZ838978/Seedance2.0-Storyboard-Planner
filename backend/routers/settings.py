"""API Key management endpoints — encrypted storage in SQLite."""
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_setting, set_setting, delete_setting, get_all_settings

router = APIRouter(prefix="/api/settings", tags=["settings"])

# Supported API key names
VALID_KEYS = {
    "seedance_api_key",    # Seedance / Jimeng / Dreamina
    "seedance_base_url",   # Custom Seedance endpoint (fal.ai, WaveSpeed, etc.)
    "llm_api_key",         # LLM provider key (OpenAI, Claude, Doubao, etc.)
    "llm_provider",        # LLM provider name for LiteLLM routing
    "llm_model",           # Model name (gpt-4o, claude-3-5-sonnet, doubao-pro, etc.)
    "llm_base_url",        # Custom LLM endpoint (Ollama, etc.)
}


class SettingUpdate(BaseModel):
    value: str


@router.get("")
async def list_settings():
    """List all settings — API keys are masked."""
    all_settings = await get_all_settings()
    masked = {}
    for k, v in all_settings.items():
        if "key" in k.lower() and len(v) > 8:
            masked[k] = v[:4] + "****" + v[-4:]
        else:
            masked[k] = v
    return {"settings": masked}


@router.get("/{key}")
async def get_one_setting(key: str):
    if key not in VALID_KEYS:
        raise HTTPException(400, f"Unknown setting: {key}")
    value = await get_setting(key)
    if value is None:
        return {"key": key, "value": None, "exists": False}
    # Mask API keys
    if "key" in key.lower() and len(value) > 8:
        return {"key": key, "value": value[:4] + "****" + value[-4:], "exists": True}
    return {"key": key, "value": value, "exists": True}


@router.put("/{key}")
async def update_setting(key: str, body: SettingUpdate):
    if key not in VALID_KEYS:
        raise HTTPException(400, f"Unknown setting: {key}")
    if not body.value.strip():
        raise HTTPException(400, "Value cannot be empty")
    await set_setting(key, body.value.strip())
    return {"key": key, "status": "saved"}


@router.delete("/{key}")
async def remove_setting(key: str):
    if key not in VALID_KEYS:
        raise HTTPException(400, f"Unknown setting: {key}")
    await delete_setting(key)
    return {"key": key, "status": "deleted"}


@router.get("/health/check")
async def health_check():
    """Check which APIs are configured (not whether they work)."""
    seedance_key = await get_setting("seedance_api_key")
    llm_key = await get_setting("llm_api_key")
    return {
        "seedance_configured": seedance_key is not None,
        "llm_configured": llm_key is not None,
    }
