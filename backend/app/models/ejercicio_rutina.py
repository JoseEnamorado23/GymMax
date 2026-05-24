from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class EjercicioRutina(Base):
    __tablename__ = "ejercicios_rutina"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dia_rutina_id = Column(UUID(as_uuid=True), ForeignKey("dias_rutina.id"), nullable=False)
    ejercicio_id = Column(UUID(as_uuid=True), ForeignKey("ejercicios.id"), nullable=False)
    orden = Column(Integer, nullable=False)
    series = Column(Integer, nullable=False)
    repeticiones = Column(String, nullable=False) # ej: "10-12", "al fallo"
    peso_kg = Column(Numeric, nullable=True)
    descanso_seg = Column(Integer, nullable=False)
    notas = Column(Text, nullable=True)

    dia = relationship("DiaRutina", back_populates="ejercicios_rutina")
    ejercicio = relationship("Ejercicio")
    registros = relationship("RegistroEjercicio", back_populates="ejercicio_rutina", cascade="all, delete-orphan")
