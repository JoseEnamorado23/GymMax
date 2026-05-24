from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.database import get_db
from app.schemas.asistencia import AsistenciaCreate, AsistenciaResponse, AsistenciaHistoricoResponse
from app.crud import asistencia as crud_asistencia

router = APIRouter()


@router.post("/", response_model=AsistenciaResponse)
def marcar_asistencia(asistencia: AsistenciaCreate, db: Session = Depends(get_db)):
    """Registra el ingreso de un usuario. Valida que tenga una suscripción activa y vigente."""
    return crud_asistencia.registrar_ingreso(db=db, asistencia=asistencia)


from datetime import datetime

@router.get("/", response_model=List[AsistenciaHistoricoResponse])
def listar_asistencias(
    usuario_id: Optional[UUID] = Query(None, description="Filtrar por el ID del usuario"),
    fecha_inicio: Optional[datetime] = Query(None, description="Filtrar asistencias desde esta fecha"),
    fecha_fin: Optional[datetime] = Query(None, description="Filtrar asistencias hasta esta fecha"),
    limit: int = 100,
    skip: int = 0,
    db: Session = Depends(get_db),
):
    """Obtiene el historial de asistencias (registros de ingreso con fecha y hora)."""
    return crud_asistencia.obtener_asistencias(
        db=db, 
        usuario_id=usuario_id, 
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        limit=limit, 
        skip=skip
    )
