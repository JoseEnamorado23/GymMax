from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class SuscripcionCreate(BaseModel):
    usuario_id: UUID
    plan_id: UUID

class SuscripcionResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    plan_id: UUID
    fecha_inicio: datetime
    fecha_fin: datetime
    estado: str

    model_config = ConfigDict(from_attributes=True)
