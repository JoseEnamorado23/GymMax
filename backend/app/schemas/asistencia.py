from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional


class AsistenciaCreate(BaseModel):
    usuario_id: UUID


class UsuarioAsistencia(BaseModel):
    nombre_completo: str
    documento_identidad: str
    foto_perfil: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AsistenciaResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    fecha_hora: datetime
    mensaje: str  # Ej: "Acceso Permitido"

    model_config = ConfigDict(from_attributes=True)


class AsistenciaHistoricoResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    fecha_hora: datetime
    usuario: Optional[UsuarioAsistencia] = None

    model_config = ConfigDict(from_attributes=True)
