from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional


class PlanCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    precio_especial: Optional[float] = None
    duracion_dias: int


class PlanUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    precio_especial: Optional[float] = None
    duracion_dias: Optional[int] = None
    activo: Optional[bool] = None

class PlanResponse(BaseModel):
    id: UUID
    nombre: str
    descripcion: Optional[str]
    precio: float
    precio_especial: Optional[float] = None
    duracion_dias: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)
