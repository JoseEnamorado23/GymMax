from sqlalchemy import Column, String, Integer, Boolean, DateTime, Time, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from app.db.database import Base

class EstadoHorario(str, enum.Enum):
    activa = "activa"
    cancelada = "cancelada"
    llena = "llena"

class HorarioClase(Base):
    """Sesiones programadas recurrentes o únicas de una Clase."""
    __tablename__ = "horarios_clase"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clase_id = Column(UUID(as_uuid=True), ForeignKey("clases.id"), nullable=False)
    entrenador_id = Column(UUID(as_uuid=True), ForeignKey("entrenadores.id"), nullable=False)
    
    fecha_hora = Column(DateTime, nullable=False)
    es_recurrente = Column(Boolean, default=False)
    dia_semana = Column(Integer, nullable=True) # 0=Lunes, 6=Domingo
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    estado = Column(Enum(EstadoHorario), default=EstadoHorario.activa)

    clase = relationship("Clase", back_populates="horarios")
    entrenador = relationship("Entrenador")
    reservas = relationship("Reserva", back_populates="horario")
    notificaciones = relationship("NotificacionClase", back_populates="horario")
