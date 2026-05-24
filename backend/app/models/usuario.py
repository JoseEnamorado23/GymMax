from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre_completo = Column(String, index=True, nullable=False)
    documento_identidad = Column(String, unique=True, index=True, nullable=False)
    telefono = Column(String, nullable=False)
    foto_perfil = Column(String, nullable=True)
    contacto_whatsapp = Column(String, nullable=True)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("planes.id"), nullable=True)
    fecha_registro = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    activo = Column(Boolean, default=True)

    # Relación para acceder al plan directamente: usuario.plan
    plan = relationship("Plan", backref="usuarios", lazy="joined")
