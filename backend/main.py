"""SeeDance 2.0 Backend — FastAPI + LiteLLM + Seedance API proxy."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import init_db
from config import CORS_ORIGINS
from routers import settings, llm, generate


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="SeeDance 2.0 Backend",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(settings.router)
app.include_router(llm.router)
app.include_router(generate.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
