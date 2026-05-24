from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime, time
from app.models.horario_clase import EstadoHorario
from app.schemas.clase import ClaseResponse
from app.schemas.entrenador import EntrenadorOut

class HorarioClaseBase(BaseModel):
    clase_id: UUID
    entrenador_id: UUID
    fecha_hora: datetime
    es_recurrente: bool = False
    dia_semana: Optional[int] = None
    hora_inicio: time
    hora_fin: time
    estado: EstadoHorario = EstadoHorario.activa

class HorarioClaseCreate(HorarioClaseBase):
    pass

class HorarioClaseUpdate(BaseModel):
    entrenador_id: Optional[UUID] = None
    fecha_hora: Optional[datetime] = None
    estado: Optional[EstadoHorario] = None

class HorarioClaseResponse(HorarioClaseBase):
    id: UUID
    clase: ClaseResponse
    entrenador: EntrenadorOut
    cupos_disponibles: Optional[int] = None # Campo calculado
    total_reservas: Optional[int] = None # Campo calculado

    model_config = ConfigDict(from_attributes=True)
