from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone
from app.db.database import Base

class EstadoReserva(str, enum.Enum):
    confirmada = "confirmada"
    lista_espera = "lista_espera"
    cancelada = "cancelada"
    cancelada_por_gym = "cancelada_por_gym"
    asistio = "asistio"
    no_show = "no_show"

class Reserva(Base):
    """Reserva de un socio a una sesión específica."""
    __tablename__ = "reservas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    horario_id = Column(UUID(as_uuid=True), ForeignKey("horarios_clase.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    
    estado = Column(Enum(EstadoReserva), default=EstadoReserva.confirmada)
    posicion_espera = Column(Integer, nullable=True) # Solo si esta en lista_espera
    
    reservada_en = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    cancelada_en = Column(DateTime, nullable=True)

    horario = relationship("HorarioClase", back_populates="reservas")
    usuario = relationship("Usuario")

    # Índice para evitar que el mismo usuario reserve la misma sesión más de una vez
    # No se puede usar directamente UniqueConstraint si queremos permitir que reserve de nuevo si canceló, 
    # pero para simplicidad inicial lo pondremos así, o lo manejamos a nivel de lógica de negocio.
    # __table_args__ = (UniqueConstraint('horario_id', 'usuario_id', name='uq_reserva_horario_usuario'),)
