from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.suscripcion import SuscripcionCreate, SuscripcionResponse
from app.crud import suscripcion as crud_suscripcion

router = APIRouter()

@router.post("/", response_model=SuscripcionResponse)
def registrar_suscripcion(suscripcion: SuscripcionCreate, db: Session = Depends(get_db)):
    return crud_suscripcion.crear_suscripcion(db=db, suscripcion=suscripcion)
