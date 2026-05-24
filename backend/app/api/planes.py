from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.plan import PlanCreate, PlanResponse
from app.crud import plan as crud_plan

router = APIRouter()


@router.post("/", response_model=PlanResponse)
def crear_plan(plan: PlanCreate, db: Session = Depends(get_db)):
    return crud_plan.crear_plan(db=db, plan=plan)


@router.get("/", response_model=List[PlanResponse])
def listar_planes(db: Session = Depends(get_db)):
    return crud_plan.obtener_planes_activos(db=db)
