"""Health and version endpoints."""

from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_provider": settings.AI_PROVIDER
    }


@router.get("/version")
def version_info():
    """System version and capability manifest."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "simulation_engine": "1.0.0",
        "models": ["lorenz-1963", "logistic-1976"],
        "integrator": "classical-rk4"
    }
