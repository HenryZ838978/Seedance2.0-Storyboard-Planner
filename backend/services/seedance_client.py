"""Seedance / Jimeng API client — async, supports official + third-party endpoints."""
from __future__ import annotations
import httpx
import json
from typing import Optional, List
from db import get_setting

DEFAULT_BASE_URL = "https://api.dreamina.capcut.com"


async def _get_client() -> tuple[httpx.AsyncClient, str]:
    api_key = await get_setting("seedance_api_key")
    if not api_key:
        raise ValueError("Seedance API key not configured")
    base_url = await get_setting("seedance_base_url") or DEFAULT_BASE_URL
    client = httpx.AsyncClient(
        base_url=base_url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        timeout=60.0,
    )
    return client, base_url


async def submit_generation(
    prompt: str,
    images: Optional[List[str]] = None,
    duration: int = 5,
    aspect_ratio: str = "16:9",
) -> dict:
    """Submit a video generation request. Returns task_id for polling."""
    client, _ = await _get_client()
    try:
        payload = {
            "prompt": prompt,
            "duration": duration,
            "aspect_ratio": aspect_ratio,
        }
        if images:
            payload["reference_images"] = images

        resp = await client.post("/v1/video/generate", json=payload)
        resp.raise_for_status()
        data = resp.json()
        return {
            "task_id": data.get("task_id") or data.get("id"),
            "status": "submitted",
            "raw": data,
        }
    finally:
        await client.aclose()


async def poll_generation(task_id: str) -> dict:
    """Poll a generation task for status/result."""
    client, _ = await _get_client()
    try:
        resp = await client.get(f"/v1/video/status/{task_id}")
        resp.raise_for_status()
        data = resp.json()
        status = data.get("status", "unknown")
        result_url = data.get("video_url") or data.get("result", {}).get("url")
        return {
            "task_id": task_id,
            "status": status,
            "result_url": result_url,
            "raw": data,
        }
    finally:
        await client.aclose()
