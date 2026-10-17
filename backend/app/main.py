from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, delay, weather

app = FastAPI(
    title="Stratus Delay API",
    description="Backend for Stratus flight delay prediction assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    # Vite falls back to 5174 when 5173 is taken by another dev server.
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(delay.router, prefix="/api", tags=["Delay"])
app.include_router(weather.router, prefix="/api", tags=["Weather"])
