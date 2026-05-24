from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime

from app.db.database import get_db
from app.schemas.horario import HorarioClaseCreate, HorarioClaseResponse, HorarioClaseUpdate
from app.schemas.reserva import ReservaCreate, ReservaResponse
from app.crud.horario import (
    obtener_horarios_semana,
    crear_horario,
    proyectar_semana_siguiente,
    cancelar_horario
)
from app.crud.reserva import reservar_clase, cancelar_reserva

router = APIRouter()

# --- Horarios ---

@router.get("/", response_model=List[HorarioClaseResponse])
def listar_horarios(
    inicio: datetime = Query(...),
    fin: datetime = Query(...),
    db: Session = Depends(get_db)
):
    return obtener_horarios_semana(db, inicio, fin)

@router.post("/", response_model=HorarioClaseResponse, status_code=status.HTTP_201_CREATED)
def programar_clase(horario: HorarioClaseCreate, db: Session = Depends(get_db)):
    return crear_horario(db, horario)

@router.put("/proyectar", response_model=dict)
def proyectar_semana(db: Session = Depends(get_db)):
    """Botón mágico para clonar clases recurrentes a la siguiente semana."""
    creados = proyectar_semana_siguiente(db)
    return {"mensaje": f"Se proyectaron {creados} clases para la siguiente semana."}

@router.delete("/{horario_id}", response_model=dict)
def borrar_horario_y_cancelar_reservas(horario_id: UUID, db: Session = Depends(get_db)):
    h = cancelar_horario(db, horario_id)
    if not h:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return {"mensaje": "Clase cancelada exitosamente y reservas notificadas."}

# --- Reservas ---

@router.post("/reservar", response_model=dict)
def hacer_reserva(reserva: ReservaCreate, usuario_id: UUID = Query(...), db: Session = Depends(get_db)):
    # NOTA: Recibimos usuario_id en query para simular auth del socio.
    # En producción esto vendría del token de la URL o sesión.
    resultado = reservar_clase(db, reserva.horario_id, usuario_id)
    if not resultado["success"]:
        raise HTTPException(status_code=400, detail=resultado["error"])
    return resultado

@router.delete("/reservar/{reserva_id}", response_model=dict)
def cancelar_mi_reserva(reserva_id: UUID, db: Session = Depends(get_db)):
    resultado = cancelar_reserva(db, reserva_id)
    if not resultado["success"]:
        raise HTTPException(status_code=400, detail=resultado["error"])
    return {"mensaje": "Reserva cancelada.", "promovido": bool(resultado["promovido"])}
