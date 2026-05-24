from sqlalchemy import Column, String, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.db.database import Base

class Clase(Base):
    """Catálogo maestro de los tipos de clase que ofrece el gimnasio."""
    __tablename__ = "clases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, index=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    duracion_min = Column(Integer, nullable=False, default=60)
    cupo_maximo = Column(Integer, nullable=False, default=20)
    color_hex = Column(String, default="#3b82f6")
    activa = Column(Boolean, default=True)

    horarios = relationship("HorarioClase", back_populates="clase")
