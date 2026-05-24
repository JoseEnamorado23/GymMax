from sqlalchemy.orm import Session
from uuid import UUID
from app.models.plan import Plan
from app.schemas.plan import PlanCreate


def crear_plan(db: Session, plan: PlanCreate):
    db_plan = Plan(
        nombre=plan.nombre,
        descripcion=plan.descripcion,
        precio=plan.precio,
        precio_especial=plan.precio_especial,
        duracion_dias=plan.duracion_dias,
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


def obtener_planes_activos(db: Session):
    return db.query(Plan).filter(Plan.activo == True).all()


def obtener_todos_los_planes(db: Session):
    return db.query(Plan).all()


def toggle_activar_plan(db: Session, plan_id: UUID):
    db_plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not db_plan:
        return None
    db_plan.activo = not db_plan.activo
    db.commit()
    db.refresh(db_plan)
    return db_plan
