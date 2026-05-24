from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime


class AsistenciaCreate(BaseModel):
    usuario_id: UUID


class AsistenciaResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    fecha_hora: datetime
    mensaje: str  # Ej: "Acceso Permitido"

    model_config = ConfigDict(from_attributes=True)
