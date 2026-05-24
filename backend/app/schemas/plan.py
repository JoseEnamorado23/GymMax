from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional


class PlanCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    duracion_dias: int


class PlanResponse(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str]
    precio: float
    duracion_dias: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)
