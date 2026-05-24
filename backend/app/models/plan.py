from sqlalchemy import Column, String, Float, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.database import Base


class Plan(Base):
    __tablename__ = "planes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, index=True, nullable=False)
    descripcion = Column(String, nullable=True)
    precio = Column(Float, nullable=False)
    precio_especial = Column(Float, nullable=True)
    duracion_dias = Column(Integer, nullable=False)  # Ej: 30 para mensualidad
    activo = Column(Boolean, default=True)
