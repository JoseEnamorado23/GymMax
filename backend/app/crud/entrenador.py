from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from uuid import UUID
from datetime import datetime, timezone
from app.models.entrenador import Entrenador
from app.models.pago import Pago
from app.schemas.entrenador import EntrenadorCreate

def crear_entrenador(db: Session, entrenador: EntrenadorCreate):
    db_entrenador = Entrenador(
        nombre=entrenador.nombre,
        telefono=entrenador.telefono,
        porcentaje=entrenador.porcentaje,
        activo=entrenador.activo
    )
    db.add(db_entrenador)
    db.commit()
    db.refresh(db_entrenador)
    return db_entrenador

def obtener_entrenadores_activos(db: Session):
    return db.query(Entrenador).filter(Entrenador.activo == True).all()

def obtener_liquidacion_entrenador(db: Session, entrenador_id: UUID, mes: int = None, anio: int = None):
    hoy = datetime.now(timezone.utc)
    mes = mes if mes is not None else hoy.month
    anio = anio if anio is not None else hoy.year

    entrenador = db.query(Entrenador).filter(Entrenador.id == entrenador_id).first()
    if not entrenador:
        return None

    # Agrupar pagos del entrenador en ese mes y año
    resultado = db.query(
        func.sum(Pago.monto).label('total_ventas'),
        func.count(Pago.id).label('num_clientes')
    ).filter(
        Pago.entrenador_id == entrenador_id,
        extract('month', Pago.fecha_pago) == mes,
        extract('year', Pago.fecha_pago) == anio
    ).first()

    total_ventas = resultado.total_ventas or 0.0
    num_clientes = resultado.num_clientes or 0

    monto_entrenador = total_ventas * (entrenador.porcentaje / 100.0)
    monto_gym = total_ventas - monto_entrenador

    return {
        "entrenador_id": entrenador.id,
        "entrenador_nombre": entrenador.nombre,
        "total_ventas": total_ventas,
        "porcentaje": entrenador.porcentaje,
        "monto_entrenador": monto_entrenador,
        "monto_gym": monto_gym,
        "num_clientes": num_clientes
    }

def obtener_liquidacion_todos(db: Session, mes: int = None, anio: int = None):
    entrenadores_activos = obtener_entrenadores_activos(db)
    liquidaciones = []
    
    for entrenador in entrenadores_activos:
        liq = obtener_liquidacion_entrenador(db, entrenador.id, mes, anio)
        if liq:
            liquidaciones.append(liq)
            
    return liquidaciones
