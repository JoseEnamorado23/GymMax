from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class RegistroEjercicio(Base):
    __tablename__ = "registros_ejercicio"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ejercicio_rutina_id = Column(UUID(as_uuid=True), ForeignKey("ejercicios_rutina.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    series_completadas = Column(Integer, nullable=False)
    reps_completadas = Column(String, nullable=False)
    peso_real_kg = Column(Numeric, nullable=True)
    completado = Column(Boolean, default=False)
    sensacion = Column(Integer, nullable=False) # 1 a 5
    nota_socio = Column(Text, nullable=True)

    ejercicio_rutina = relationship("EjercicioRutina", back_populates="registros")
    usuario = relationship("Usuario")
