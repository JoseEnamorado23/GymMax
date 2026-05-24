from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.db.database import get_db
from app.schemas.entrenador import EntrenadorCreate, EntrenadorOut, LiquidacionEntrenador
from app.crud import entrenador as crud_entrenador

router = APIRouter()

@router.post("/", response_model=EntrenadorOut)
def crear_entrenador(entrenador: EntrenadorCreate, db: Session = Depends(get_db)):
    """Crea un nuevo entrenador."""
    return crud_entrenador.crear_entrenador(db=db, entrenador=entrenador)

@router.get("/", response_model=List[EntrenadorOut])
def listar_entrenadores(db: Session = Depends(get_db)):
    """Lista todos los entrenadores activos."""
    return crud_entrenador.obtener_entrenadores_activos(db=db)

@router.get("/liquidacion/todos", response_model=List[LiquidacionEntrenador])
def liquidacion_todos(
    mes: Optional[int] = Query(None, description="Mes a liquidar (1-12)"),
    anio: Optional[int] = Query(None, description="Año a liquidar"),
    db: Session = Depends(get_db)
):
    """Obtiene la liquidación de todos los entrenadores activos en un mes."""
    return crud_entrenador.obtener_liquidacion_todos(db=db, mes=mes, anio=anio)

@router.get("/{id}/liquidacion", response_model=LiquidacionEntrenador)
def liquidacion_entrenador(
    id: UUID,
    mes: Optional[int] = Query(None, description="Mes a liquidar (1-12)"),
    anio: Optional[int] = Query(None, description="Año a liquidar"),
    db: Session = Depends(get_db)
):
    """Obtiene la liquidación detallada de un entrenador en específico."""
    liquidacion = crud_entrenador.obtener_liquidacion_entrenador(db=db, entrenador_id=id, mes=mes, anio=anio)
    if not liquidacion:
        raise HTTPException(status_code=404, detail="Entrenador no encontrado")
    return liquidacion
