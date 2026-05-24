from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class DiaRutina(Base):
    __tablename__ = "dias_rutina"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rutina_id = Column(UUID(as_uuid=True), ForeignKey("rutinas.id"), nullable=False)
    dia_numero = Column(Integer, nullable=False) # 1 a 7
    nombre_dia = Column(String, nullable=False) # Ej: Día 1 - Pecho y Tríceps
    orden = Column(Integer, nullable=False)

    rutina = relationship("Rutina", back_populates="dias")
    ejercicios_rutina = relationship("EjercicioRutina", back_populates="dia", cascade="all, delete-orphan", order_by="EjercicioRutina.orden")
