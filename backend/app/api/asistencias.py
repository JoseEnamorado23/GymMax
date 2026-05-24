from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.asistencia import AsistenciaCreate, AsistenciaResponse, AsistenciaHistoricoResponse
from app.crud import asistencia as crud_asistencia

router = APIRouter()


@router.post("/", response_model=AsistenciaResponse)
def marcar_asistencia(asistencia: AsistenciaCreate, db: Session = Depends(get_db)):
    """Registra el ingreso de un usuario. Valida que tenga una suscripción activa y vigente."""
    return crud_asistencia.registrar_ingreso(db=db, asistencia=asistencia)


@router.get("/", response_model=List[AsistenciaHistoricoResponse])
def listar_asistencias(limit: int = 50, skip: int = 0, db: Session = Depends(get_db)):
    """Obtiene el historial de asistencias (registros de ingreso con fecha y hora)."""
    return crud_asistencia.obtener_asistencias(db=db, limit=limit, skip=skip)
