from sqlalchemy import Column, DateTime, ForeignKey, String, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.database import Base


class Pago(Base):
    __tablename__ = "pagos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    suscripcion_id = Column(UUID(as_uuid=True), ForeignKey("suscripciones.id", ondelete="SET NULL"), nullable=True)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("planes.id"), nullable=False)
    entrenador_id = Column(UUID(as_uuid=True), ForeignKey("entrenadores.id", ondelete="SET NULL"), nullable=True)
    
    monto = Column(Float, nullable=False)
    metodo_pago = Column(String, nullable=False)  # "Efectivo" o "Nequi"
    fecha_pago = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relaciones para acceder a los datos de forma rápida (joined)
    usuario = relationship("Usuario", lazy="joined")
    plan = relationship("Plan", lazy="joined")
    suscripcion = relationship("Suscripcion")
    entrenador = relationship("Entrenador")
