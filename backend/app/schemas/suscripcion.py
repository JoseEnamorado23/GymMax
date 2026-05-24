from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class SuscripcionCreate(BaseModel):
    usuario_id: UUID
    plan_id: UUID
    metodo_pago: str  # "Efectivo" o "Nequi"
    monto: Optional[float] = None  # Si es nulo, usará el precio del plan


class SuscripcionResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    plan_id: UUID
    fecha_inicio: datetime
    fecha_fin: datetime
    estado: str

    model_config = ConfigDict(from_attributes=True)
