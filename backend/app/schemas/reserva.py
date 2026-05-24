from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.reserva import EstadoReserva
from app.schemas.usuario import UsuarioResponse

class ReservaBase(BaseModel):
    horario_id: UUID

class ReservaCreate(ReservaBase):
    pass

class ReservaUpdate(BaseModel):
    estado: EstadoReserva

class ReservaResponse(BaseModel):
    id: UUID
    horario_id: UUID
    usuario_id: UUID
    estado: EstadoReserva
    posicion_espera: Optional[int] = None
    reservada_en: datetime
    cancelada_en: Optional[datetime] = None
    usuario: Optional[UsuarioResponse] = None

    model_config = ConfigDict(from_attributes=True)
