from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.database import get_db
from app.schemas.clase import ClaseCreate, ClaseUpdate, ClaseResponse
from app.crud.clase import (
    obtener_clases,
    crear_clase,
    obtener_clase,
    actualizar_clase,
    eliminar_clase
)

router = APIRouter()

@router.get("/", response_model=List[ClaseResponse])
def listar_clases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return obtener_clases(db, skip=skip, limit=limit)

@router.post("/", response_model=ClaseResponse, status_code=status.HTTP_201_CREATED)
def agregar_clase(clase: ClaseCreate, db: Session = Depends(get_db)):
    return crear_clase(db, clase)

@router.put("/{clase_id}", response_model=ClaseResponse)
def modificar_clase(clase_id: UUID, clase: ClaseUpdate, db: Session = Depends(get_db)):
    db_clase = actualizar_clase(db, clase_id, clase)
    if not db_clase:
        raise HTTPException(status_code=404, detail="Clase no encontrada")
    return db_clase

@router.delete("/{clase_id}", status_code=status.HTTP_204_NO_CONTENT)
def borrar_clase(clase_id: UUID, db: Session = Depends(get_db)):
    exito = eliminar_clase(db, clase_id)
    if not exito:
        raise HTTPException(status_code=404, detail="Clase no encontrada")
