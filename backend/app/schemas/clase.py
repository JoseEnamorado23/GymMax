from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID

class ClaseBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    duracion_min: int = 60
    cupo_maximo: int = 20
    color_hex: str = "#3b82f6"
    activa: bool = True

class ClaseCreate(ClaseBase):
    pass

class ClaseUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    duracion_min: Optional[int] = None
    cupo_maximo: Optional[int] = None
    color_hex: Optional[str] = None
    activa: Optional[bool] = None

class ClaseResponse(ClaseBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
