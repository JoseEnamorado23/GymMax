from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional


class PagoCreate(BaseModel):
    usuario_id: UUID
    plan_id: UUID
    suscripcion_id: Optional[UUID] = None
    monto: float
    metodo_pago: str  # "Efectivo" o "Nequi"


class UsuarioPago(BaseModel):
    nombre_completo: str
    documento_identidad: str

    model_config = ConfigDict(from_attributes=True)


class PlanPago(BaseModel):
    nombre: str
    duracion_dias: int

    model_config = ConfigDict(from_attributes=True)


class PagoResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    suscripcion_id: Optional[UUID]
    plan_id: UUID
    monto: float
    metodo_pago: str
    fecha_pago: datetime

    model_config = ConfigDict(from_attributes=True)


class PagoHistoricoResponse(BaseModel):
    id: UUID
    usuario_id: UUID
    suscripcion_id: Optional[UUID]
    plan_id: UUID
    monto: float
    metodo_pago: str
    fecha_pago: datetime
    
    usuario: Optional[UsuarioPago] = None
    plan: Optional[PlanPago] = None

    model_config = ConfigDict(from_attributes=True)
