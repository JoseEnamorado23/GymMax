from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.rutina import EjercicioResponse
from app.crud.rutina import obtener_ejercicios

router = APIRouter()

@router.get("/", response_model=List[EjercicioResponse])
def listar_catalogo_ejercicios(db: Session = Depends(get_db)):
    return obtener_ejercicios(db)
