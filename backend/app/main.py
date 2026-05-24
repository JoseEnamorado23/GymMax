from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api import usuarios, planes, suscripciones, asistencias

# Crea las tablas en la DB al iniciar (en producción usarías Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Permitir requests desde el frontend (React en localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": f"Bienvenido a la API de {settings.PROJECT_NAME}"}


# --- Routers ---
app.include_router(usuarios.router, prefix="/api/v1/usuarios", tags=["Usuarios"])
app.include_router(planes.router, prefix="/api/v1/planes", tags=["Planes"])
app.include_router(suscripciones.router, prefix="/api/v1/suscripciones", tags=["Suscripciones"])
app.include_router(asistencias.router, prefix="/api/v1/asistencias", tags=["Asistencias"])
