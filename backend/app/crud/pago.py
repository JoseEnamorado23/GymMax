from sqlalchemy.orm import Session
from app.models.pago import Pago
from app.schemas.pago import PagoCreate


def registrar_pago(db: Session, pago: PagoCreate):
    db_pago = Pago(
        usuario_id=pago.usuario_id,
        plan_id=pago.plan_id,
        suscripcion_id=pago.suscripcion_id,
        monto=pago.monto,
        metodo_pago=pago.metodo_pago,
    )
    db.add(db_pago)
    db.commit()
    db.refresh(db_pago)
    return db_pago


def obtener_pagos_historico(db: Session, limit: int = 100, skip: int = 0):
    return db.query(Pago).order_by(Pago.fecha_pago.desc()).offset(skip).limit(limit).all()
