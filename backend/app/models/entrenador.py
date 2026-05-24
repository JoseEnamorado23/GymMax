from sqlalchemy import Column, String, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.database import Base

class Entrenador(Base):
    __tablename__ = "entrenadores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    telefono = Column(String, nullable=True)
    porcentaje = Column(Float, default=60.0, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
