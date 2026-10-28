"""Main FastAPI application entrypoint."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db

# Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.simulations import router as simulations_router
from app.api.v1.experiments import router as experiments_router
from app.api.v1.scenarios import router as scenarios_router
from app.api.v1.microscope import router as microscope_router
from app.api.v1.heatmap import router as heatmap_router
from app.api.v1.bifurcation import router as bifurcation_router
from app.api.v1.lessons import router as lessons_router
from app.api.v1.exports import router as exports_router
from app.api.v1.health import router as health_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("butterfly_effect_lab")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed lessons
    logger.info("Initializing database and seeding default scientific inquiry lessons...")
    db = SessionLocal()
    try:
        init_db(db)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
    finally:
        db.close()
    yield
    # Shutdown logic if any
    logger.info("Shutting down AI Butterfly Effect Lab.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Interactive Scientific Laboratory for Sensitive Dependence on Initial Conditions & Deterministic Chaos.",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Structured error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal error occurred while processing the scientific simulation or request.",
                "path": request.url.path
            }
        }
    )


# Attach routers under /api/v1
app.include_router(health_router)
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(simulations_router, prefix=settings.API_V1_STR)
app.include_router(experiments_router, prefix=settings.API_V1_STR)
app.include_router(scenarios_router, prefix=settings.API_V1_STR)
app.include_router(microscope_router, prefix=settings.API_V1_STR)
app.include_router(heatmap_router, prefix=settings.API_V1_STR)
app.include_router(bifurcation_router, prefix=settings.API_V1_STR)
app.include_router(lessons_router, prefix=settings.API_V1_STR)
app.include_router(exports_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
