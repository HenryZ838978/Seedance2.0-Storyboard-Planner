"""Seedance video generation endpoints — submit, poll, list tasks."""
from __future__ import annotations
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.seedance_client import submit_generation, poll_generation
from db import get_db
import json

router = APIRouter(prefix="/api/generate", tags=["generate"])


class GenerateRequest(BaseModel):
    shot_id: str
    prompt: str
    duration: int = 5
    aspect_ratio: str = "16:9"
    reference_images: List[str] = []  # base64 or URLs


class TaskStatus(BaseModel):
    task_id: str
    shot_id: str
    status: str
    result_url: Optional[str] = None
    error: Optional[str] = None


@router.post("/submit", response_model=TaskStatus)
async def submit(req: GenerateRequest):
    """Submit a video generation task for a specific shot."""
    try:
        result = await submit_generation(
            prompt=req.prompt,
            images=req.reference_images if req.reference_images else None,
            duration=req.duration,
            aspect_ratio=req.aspect_ratio,
        )
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        raise HTTPException(500, f"Seedance API error: {str(e)}")

    task_id = result["task_id"]

    # Store task in DB
    db = await get_db()
    await db.execute(
        "INSERT INTO generation_tasks (id, shot_id, status, prompt, request_payload) VALUES (?, ?, ?, ?, ?)",
        (task_id, req.shot_id, "submitted", req.prompt, json.dumps(req.model_dump())),
    )
    await db.commit()
    await db.close()

    return TaskStatus(task_id=task_id, shot_id=req.shot_id, status="submitted")


@router.get("/poll/{task_id}", response_model=TaskStatus)
async def poll(task_id: str):
    """Poll the status of a generation task."""
    # Get shot_id from DB
    db = await get_db()
    cursor = await db.execute("SELECT shot_id FROM generation_tasks WHERE id = ?", (task_id,))
    row = await cursor.fetchone()
    if not row:
        await db.close()
        raise HTTPException(404, "Task not found")
    shot_id = row[0]

    try:
        result = await poll_generation(task_id)
    except Exception as e:
        await db.close()
        raise HTTPException(500, f"Poll error: {str(e)}")

    # Update DB
    await db.execute(
        "UPDATE generation_tasks SET status = ?, result_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (result["status"], result.get("result_url"), task_id),
    )
    await db.commit()
    await db.close()

    return TaskStatus(
        task_id=task_id,
        shot_id=shot_id,
        status=result["status"],
        result_url=result.get("result_url"),
    )


@router.get("/tasks")
async def list_tasks():
    """List all generation tasks."""
    db = await get_db()
    cursor = await db.execute(
        "SELECT id, shot_id, status, result_url, error, created_at FROM generation_tasks ORDER BY created_at DESC LIMIT 50"
    )
    rows = await cursor.fetchall()
    await db.close()
    return {
        "tasks": [
            {
                "task_id": r[0],
                "shot_id": r[1],
                "status": r[2],
                "result_url": r[3],
                "error": r[4],
                "created_at": r[5],
            }
            for r in rows
        ]
    }
