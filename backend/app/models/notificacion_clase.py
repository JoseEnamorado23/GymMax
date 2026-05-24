from sqlalchemy import Column, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone
from app.db.database import Base

class TipoNotificacion(str, enum.Enum):
    recordatorio = "recordatorio"
    cancelacion = "cancelacion"
    promovido = "promovido" # Cuando pasa de lista de espera a confirmada

class NotificacionClase(Base):
    """Log de mensajes enviados por clase."""
    __tablename__ = "notificaciones_clase"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    horario_id = Column(UUID(as_uuid=True), ForeignKey("horarios_clase.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    
    tipo = Column(Enum(TipoNotificacion), nullable=False)
    enviado_en = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    horario = relationship("HorarioClase", back_populates="notificaciones")
    usuario = relationship("Usuario")
