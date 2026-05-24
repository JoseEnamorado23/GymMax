from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional
from app.schemas.plan import PlanResponse


# Lo que exigimos para crear un usuario
class UsuarioCreate(BaseModel):
    nombre_completo: str
    documento_identidad: str
    telefono: str
    foto_perfil: Optional[str] = None
    contacto_whatsapp: Optional[str] = None
    plan_id: Optional[UUID] = None


# Lo que aceptamos para actualizar (todos los campos opcionales)
class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    documento_identidad: Optional[str] = None
    telefono: Optional[str] = None
    foto_perfil: Optional[str] = None
    contacto_whatsapp: Optional[str] = None
    plan_id: Optional[UUID] = None
    activo: Optional[bool] = None


# Lo que la API responde
class UsuarioResponse(BaseModel):
    id: UUID
    nombre_completo: str
    documento_identidad: str
    telefono: str
    foto_perfil: Optional[str] = None
    contacto_whatsapp: Optional[str] = None
    plan_id: Optional[UUID]
    plan: Optional[PlanResponse] = None
    fecha_registro: datetime
    activo: bool
    token_app: Optional[str] = None

    # Permite que Pydantic lea el modelo de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

class SuscripcionBasica(BaseModel):
    plan_nombre: str
    fecha_inicio: datetime
    fecha_fin: datetime
    estado: str

class UsuarioSocioResponse(BaseModel):
    nombre_completo: str
    documento_identidad: str
    foto_perfil: Optional[str] = None
    activo: bool
    suscripcion_activa: Optional[SuscripcionBasica] = None
    dias_restantes: Optional[int] = None
