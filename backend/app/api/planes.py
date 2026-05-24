from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.database import get_db
from app.schemas.plan import PlanCreate, PlanResponse
from app.crud import plan as crud_plan

router = APIRouter()


@router.post("/", response_model=PlanResponse)
def crear_plan(plan: PlanCreate, db: Session = Depends(get_db)):
    return crud_plan.crear_plan(db=db, plan=plan)


@router.get("/", response_model=List[PlanResponse])
def listar_planes(incluir_inactivos: bool = Query(False), db: Session = Depends(get_db)):
    if incluir_inactivos:
        return crud_plan.obtener_todos_los_planes(db=db)
    return crud_plan.obtener_planes_activos(db=db)


@router.put("/{plan_id}/toggle_activo", response_model=PlanResponse)
def toggle_activar_plan(plan_id: UUID, db: Session = Depends(get_db)):
    db_plan = crud_plan.toggle_activar_plan(db=db, plan_id=plan_id)
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    return db_plan
