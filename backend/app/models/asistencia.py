from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.database import Base


class Asistencia(Base):
    __tablename__ = "asistencias"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    fecha_hora = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relación para acceder al usuario directamente: asistencia.usuario
    usuario = relationship("Usuario", backref="asistencias", lazy="joined")
