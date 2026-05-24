from sqlalchemy.orm import Session
from app.models.plan import Plan
from app.schemas.plan import PlanCreate


def crear_plan(db: Session, plan: PlanCreate):
    db_plan = Plan(
        nombre=plan.nombre,
        descripcion=plan.descripcion,
        precio=plan.precio,
        duracion_dias=plan.duracion_dias,
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


def obtener_planes_activos(db: Session):
    return db.query(Plan).filter(Plan.activo == True).all()
