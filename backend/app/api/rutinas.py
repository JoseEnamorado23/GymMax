from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from uuid import UUID
from datetime import datetime

from app.db.database import get_db
from app.schemas.rutina import RutinaCreate, RutinaResponse, RegistroEjercicioCreate, DiaRutinaResponse
from app.crud.rutina import (
    crear_rutina,
    obtener_rutina_activa,
    obtener_dia_rutina_actual,
    registrar_ejercicio,
    obtener_progreso_rutina
)

router = APIRouter()

# --- Rutinas (Entrenador) ---

@router.post("/{usuario_id}", response_model=RutinaResponse, status_code=status.HTTP_201_CREATED)
def asignar_rutina(usuario_id: UUID, rutina: RutinaCreate, db: Session = Depends(get_db)):
    return crear_rutina(db, usuario_id, rutina)

@router.get("/{usuario_id}", response_model=RutinaResponse)
def ver_rutina_activa(usuario_id: UUID, db: Session = Depends(get_db)):
    rutina = obtener_rutina_activa(db, usuario_id)
    if not rutina:
        raise HTTPException(status_code=404, detail="El usuario no tiene una rutina activa.")
    return rutina

@router.get("/{rutina_id}/progreso", response_model=List[Dict[str, Any]])
def ver_progreso(rutina_id: UUID, db: Session = Depends(get_db)):
    registros = obtener_progreso_rutina(db, rutina_id)
    return [
        {
            "fecha": r.fecha,
            "ejercicio": r.ejercicio_rutina.ejercicio.nombre,
            "series": r.series_completadas,
            "reps": r.reps_completadas,
            "peso": r.peso_real_kg,
            "sensacion": r.sensacion,
            "completado": r.completado
        }
        for r in registros
    ]

# --- PWA Socio ---

@router.get("/socio/rutina-hoy", response_model=dict)
def ver_rutina_hoy(usuario_id: UUID = Query(...), db: Session = Depends(get_db)):
    dia_actual = obtener_dia_rutina_actual(db, usuario_id)
    if not dia_actual:
        return {"success": False, "error": "No tienes una rutina asignada."}
        
    return {
        "success": True, 
        "rutina_id": dia_actual.rutina_id,
        "dia": DiaRutinaResponse.model_validate(dia_actual)
    }

@router.post("/socio/registrar-ejercicio", response_model=dict)
def guardar_registro_ejercicio(registro: RegistroEjercicioCreate, usuario_id: UUID = Query(...), db: Session = Depends(get_db)):
    res = registrar_ejercicio(db, usuario_id, registro)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    return {"success": True, "mensaje": "Ejercicio registrado con éxito."}
