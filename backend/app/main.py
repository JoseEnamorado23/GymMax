from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.usuarios import router as usuarios_router
from app.api.planes import router as planes_router
from app.api.suscripciones import router as suscripciones_router
from app.api.pagos import router as pagos_router
from app.api.asistencias import router as asistencias_router
from app.api.entrenadores import router as entrenadores_router
from app.api.clases import router as clases_router
from app.api.horarios import router as horarios_router
from app.api.ejercicios import router as ejercicios_router
from app.api.rutinas import router as rutinas_router

# Crear las tablas en la BD (para desarrollo, en prod usar Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GymMax API",
    description="API para el sistema de gestión premium para gimnasios GymMax.",
    version="1.0.0"
)

# Configurar CORS para permitir que el frontend React se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción cambiar por los dominios reales
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": f"Bienvenido a la API de {settings.PROJECT_NAME}"}


# --- Routers ---
app.include_router(usuarios_router, prefix="/api/v1/usuarios", tags=["Usuarios"])
app.include_router(planes_router, prefix="/api/v1/planes", tags=["Planes"])
app.include_router(suscripciones_router, prefix="/api/v1/suscripciones", tags=["Suscripciones"])
app.include_router(pagos_router, prefix="/api/v1/pagos", tags=["Pagos"])
app.include_router(asistencias_router, prefix="/api/v1/asistencias", tags=["Asistencias QR"])
app.include_router(entrenadores_router, prefix="/api/v1/entrenadores", tags=["Entrenadores"])
app.include_router(clases_router, prefix="/api/v1/clases", tags=["Clases Grupales"])
app.include_router(horarios_router, prefix="/api/v1/horarios", tags=["Horarios y Reservas"])
app.include_router(ejercicios_router, prefix="/api/v1/ejercicios", tags=["Catálogo de Ejercicios"])
app.include_router(rutinas_router, prefix="/api/v1/rutinas", tags=["Rutinas de Entrenamiento"])
