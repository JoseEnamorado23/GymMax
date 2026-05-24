from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.models.suscripcion import Suscripcion
from app.models.plan import Plan
from app.schemas.suscripcion import SuscripcionCreate
from fastapi import HTTPException

def crear_suscripcion(db: Session, suscripcion: SuscripcionCreate):
    # 1. Buscar el plan para saber cuántos días dura
    plan = db.query(Plan).filter(Plan.id == suscripcion.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    # 2. Calcular la fecha de fin
    fecha_inicio_calc = datetime.now(timezone.utc)
    fecha_fin_calc = fecha_inicio_calc + timedelta(days=plan.duracion_dias)

    # 3. Crear el registro
    db_suscripcion = Suscripcion(
        usuario_id=suscripcion.usuario_id,
        plan_id=suscripcion.plan_id,
        fecha_inicio=fecha_inicio_calc,
        fecha_fin=fecha_fin_calc,
        estado="Activa"
    )
    
    # 4. Actualizar el plan actual en el registro del usuario
    from app.models.usuario import Usuario
    usuario = db.query(Usuario).filter(Usuario.id == suscripcion.usuario_id).first()
    if usuario:
        usuario.plan_id = suscripcion.plan_id

    db.add(db_suscripcion)
    db.commit()
    db.refresh(db_suscripcion)
    return db_suscripcion
