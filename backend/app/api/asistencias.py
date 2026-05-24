from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.asistencia import AsistenciaCreate, AsistenciaResponse
from app.crud import asistencia as crud_asistencia

router = APIRouter()


@router.post("/", response_model=AsistenciaResponse)
def marcar_asistencia(asistencia: AsistenciaCreate, db: Session = Depends(get_db)):
    """Registra el ingreso de un usuario. Valida que tenga una suscripción activa y vigente."""
    return crud_asistencia.registrar_ingreso(db=db, asistencia=asistencia)
