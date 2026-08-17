from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import admin, bdm
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Ensure all database tables exist
    Base.metadata.create_all(bind=engine)

    # 2. Seed SQLite database from CSVs if database file does not exist or is unseeded
    db_file = engine.url.database or "./field_ops.db"
    if not os.path.exists(db_file) or os.path.getsize(db_file) == 0:
        seed_database()

    yield


app = FastAPI(
    title="FieldBeat TN API",
    version="1.0",
    description="Field force intelligence & audit engine for 820 Apple retail outlets across Tamil Nadu",
    lifespan=lifespan,
)

# Enable CORS for local Vite dev server and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(bdm.router)
app.include_router(admin.router)

# -----------------------------------------------------------------------------
# Static Asset Serving & SPA Routing Fallback (for Production / Docker)
# -----------------------------------------------------------------------------
frontend_dist = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../frontend/dist")
)
if not os.path.exists(frontend_dist):
    frontend_dist = os.path.abspath("/app/frontend/dist")

if os.path.exists(frontend_dist):
    # Mount compiled CSS/JS asset bundle
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve index.html for root and client-side SPA routes (e.g. /admin, /visuals)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Let API routes and docs pass through untouched
        if (
            full_path.startswith("api")
            or full_path.startswith("docs")
            or full_path.startswith("openapi.json")
        ):
            return None

        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

else:

    @app.get("/")
    def root():
        return {
            "message": "FieldBeat TN Backend API is running.",
            "docs": "/docs",
        }