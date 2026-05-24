from sqlalchemy.orm import Session
from datetime import datetime, timezone
from fastapi import HTTPException
from app.models.asistencia import Asistencia
from app.models.suscripcion import Suscripcion
from app.schemas.asistencia import AsistenciaCreate


def registrar_ingreso(db: Session, asistencia: AsistenciaCreate):
    # 1. Buscar si el usuario tiene una suscripción activa y vigente
    hoy = datetime.now(timezone.utc)
    suscripcion_activa = db.query(Suscripcion).filter(
        Suscripcion.usuario_id == asistencia.usuario_id,
        Suscripcion.estado == "Activa",
        Suscripcion.fecha_fin >= hoy  # Que no esté vencida
    ).first()

    # 2. Si no tiene suscripción o está vencida, rechazamos la entrada
    if not suscripcion_activa:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado: No tiene plan activo o está vencido."
        )

    # 3. Si todo está bien, registramos la asistencia
    db_asistencia = Asistencia(usuario_id=asistencia.usuario_id)
    db.add(db_asistencia)
    db.commit()
    db.refresh(db_asistencia)

    return {
        "id": db_asistencia.id,
        "usuario_id": db_asistencia.usuario_id,
        "fecha_hora": db_asistencia.fecha_hora,
        "mensaje": "Acceso Permitido ✅"
    }


def obtener_asistencias(db: Session, limit: int = 50, skip: int = 0):
    return db.query(Asistencia).order_by(Asistencia.fecha_hora.desc()).offset(skip).limit(limit).all()
