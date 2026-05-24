from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.pago import PagoHistoricoResponse
from app.crud import pago as crud_pago

router = APIRouter()


@router.get("/", response_model=List[PagoHistoricoResponse])
def listar_pagos(limit: int = 100, skip: int = 0, db: Session = Depends(get_db)):
    """Obtiene el historial contable global de todos los pagos registrados (ventas de membresías)."""
    return crud_pago.obtener_pagos_historico(db=db, limit=limit, skip=skip)
