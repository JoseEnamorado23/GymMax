from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.database import Base

class Suscripcion(Base):
    __tablename__ = "suscripciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("planes.id"), nullable=False)
    
    fecha_inicio = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    fecha_fin = Column(DateTime, nullable=False) # Se calcula al crearla
    estado = Column(String, default="Activa") # Activa, Vencida, Cancelada

    # Relaciones para poder acceder a los datos completos del usuario y el plan
    usuario = relationship("Usuario")
    plan = relationship("Plan")
