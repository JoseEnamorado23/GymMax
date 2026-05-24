from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional

class EntrenadorBase(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    porcentaje: float = 60.0
    activo: bool = True

class EntrenadorCreate(EntrenadorBase):
    pass

class EntrenadorOut(EntrenadorBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

class LiquidacionEntrenador(BaseModel):
    entrenador_id: UUID
    entrenador_nombre: str
    total_ventas: float
    porcentaje: float
    monto_entrenador: float
    monto_gym: float
    num_clientes: int
