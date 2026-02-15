from __future__ import annotations
import aiosqlite
import os
from typing import Optional
from cryptography.fernet import Fernet
from config import DB_PATH, ENCRYPTION_KEY_FILE

# --- Encryption helpers ---

def _get_or_create_key() -> bytes:
    if os.path.exists(ENCRYPTION_KEY_FILE):
        with open(ENCRYPTION_KEY_FILE, "rb") as f:
            return f.read()
    key = Fernet.generate_key()
    with open(ENCRYPTION_KEY_FILE, "wb") as f:
        f.write(key)
    return key

_fernet = Fernet(_get_or_create_key())

def encrypt(value: str) -> str:
    return _fernet.encrypt(value.encode()).decode()

def decrypt(value: str) -> str:
    return _fernet.decrypt(value.encode()).decode()

# --- Database ---

async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db

async def init_db():
    db = await get_db()
    await db.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS generation_tasks (
            id TEXT PRIMARY KEY,
            shot_id TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            prompt TEXT,
            request_payload TEXT,
            result_url TEXT,
            error TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    await db.commit()
    await db.close()

# --- Settings CRUD ---

async def get_setting(key: str) -> Optional[str]:
    db = await get_db()
    cursor = await db.execute("SELECT value FROM settings WHERE key = ?", (key,))
    row = await cursor.fetchone()
    await db.close()
    if row is None:
        return None
    return decrypt(row[0])

async def set_setting(key: str, value: str):
    db = await get_db()
    encrypted = encrypt(value)
    await db.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
        (key, encrypted),
    )
    await db.commit()
    await db.close()

async def delete_setting(key: str):
    db = await get_db()
    await db.execute("DELETE FROM settings WHERE key = ?", (key,))
    await db.commit()
    await db.close()

async def get_all_settings() -> dict:
    db = await get_db()
    cursor = await db.execute("SELECT key, value FROM settings")
    rows = await cursor.fetchall()
    await db.close()
    result = {}
    for row in rows:
        try:
            result[row[0]] = decrypt(row[1])
        except Exception:
            result[row[0]] = "(decryption error)"
    return result
