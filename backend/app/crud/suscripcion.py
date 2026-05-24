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

    # 3. Crear el registro de Suscripcion
    db_suscripcion = Suscripcion(
        usuario_id=suscripcion.usuario_id,
        plan_id=suscripcion.plan_id,
        fecha_inicio=fecha_inicio_calc,
        fecha_fin=fecha_fin_calc,
        estado="Activa"
    )
    db.add(db_suscripcion)
    db.flush() # flush para obtener el id de db_suscripcion para el pago

    # 4. Determinar el monto del pago
    monto_pago = suscripcion.monto
    if monto_pago is None:
        monto_pago = plan.precio_especial if plan.precio_especial is not None else plan.precio

    # 5. Crear el registro de Pago asociado
    from app.models.pago import Pago
    db_pago = Pago(
        usuario_id=suscripcion.usuario_id,
        suscripcion_id=db_suscripcion.id,
        plan_id=suscripcion.plan_id,
        monto=monto_pago,
        metodo_pago=suscripcion.metodo_pago,
        entrenador_id=suscripcion.entrenador_id
    )
    db.add(db_pago)
    
    # 6. Actualizar el plan actual en el registro del usuario
    from app.models.usuario import Usuario
    usuario = db.query(Usuario).filter(Usuario.id == suscripcion.usuario_id).first()
    if usuario:
        usuario.plan_id = suscripcion.plan_id

    db.commit()
    db.refresh(db_suscripcion)
    return db_suscripcion


def obtener_ultima_suscripcion(db: Session, usuario_id):
    return db.query(Suscripcion).filter(Suscripcion.usuario_id == usuario_id).order_by(Suscripcion.fecha_fin.desc()).first()


