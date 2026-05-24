from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import datetime, timezone, timedelta
from app.models.reserva import Reserva, EstadoReserva
from app.models.horario_clase import HorarioClase, EstadoHorario
from app.models.suscripcion import Suscripcion
from app.models.notificacion_clase import NotificacionClase, TipoNotificacion
from app.crud.horario import _calcular_cupos

def _validar_suscripcion_activa(db: Session, usuario_id: UUID) -> bool:
    hoy = datetime.now(timezone.utc).date()
    suscripcion = db.query(Suscripcion).filter(
        Suscripcion.usuario_id == usuario_id,
        Suscripcion.activa == True,
        Suscripcion.fecha_fin >= hoy
    ).first()
    return suscripcion is not None

def reservar_clase(db: Session, horario_id: UUID, usuario_id: UUID) -> dict:
    horario = db.query(HorarioClase).filter(HorarioClase.id == horario_id).first()
    if not horario or horario.estado == EstadoHorario.cancelada:
        return {"success": False, "error": "Clase no disponible"}

    if not _validar_suscripcion_activa(db, usuario_id):
        return {"success": False, "error": "Necesitas una suscripción activa"}
    
    # Validar que no haya reservado ya (y no esté cancelada)
    reserva_existente = db.query(Reserva).filter(
        Reserva.horario_id == horario_id,
        Reserva.usuario_id == usuario_id,
        Reserva.estado.in_([EstadoReserva.confirmada, EstadoReserva.lista_espera])
    ).first()
    
    if reserva_existente:
        return {"success": False, "error": "Ya tienes una reserva activa para esta clase"}

    total_reservas, cupos_disp = _calcular_cupos(db, horario_id)
    
    nueva_reserva = Reserva(
        horario_id=horario_id,
        usuario_id=usuario_id,
        reservada_en=datetime.now(timezone.utc)
    )

    if cupos_disp > 0:
        nueva_reserva.estado = EstadoReserva.confirmada
        mensaje = "Reserva confirmada"
        # Si se llenó con esta reserva
        if cupos_disp == 1:
            horario.estado = EstadoHorario.llena
    else:
        nueva_reserva.estado = EstadoReserva.lista_espera
        max_pos = db.query(func.max(Reserva.posicion_espera)).filter(
            Reserva.horario_id == horario_id,
            Reserva.estado == EstadoReserva.lista_espera
        ).scalar()
        nueva_reserva.posicion_espera = (max_pos or 0) + 1
        mensaje = f"En lista de espera (Posición {nueva_reserva.posicion_espera})"

    db.add(nueva_reserva)
    db.commit()
    db.refresh(nueva_reserva)
    
    return {"success": True, "reserva": nueva_reserva, "mensaje": mensaje}

def cancelar_reserva(db: Session, reserva_id: UUID) -> dict:
    reserva = db.query(Reserva).filter(Reserva.id == reserva_id).first()
    if not reserva or reserva.estado not in [EstadoReserva.confirmada, EstadoReserva.lista_espera]:
        return {"success": False, "error": "Reserva no válida para cancelar"}
    
    estado_anterior = reserva.estado
    reserva.estado = EstadoReserva.cancelada
    reserva.cancelada_en = datetime.now(timezone.utc)
    
    db.commit()
    
    # Lógica de Lista de Espera: si canceló alguien confirmado, el #1 de lista de espera sube
    promovido = None
    if estado_anterior == EstadoReserva.confirmada:
        siguiente = db.query(Reserva).filter(
            Reserva.horario_id == reserva.horario_id,
            Reserva.estado == EstadoReserva.lista_espera
        ).order_by(Reserva.posicion_espera.asc()).first()
        
        if siguiente:
            siguiente.estado = EstadoReserva.confirmada
            siguiente.posicion_espera = None
            
            # Simular WhatsApp a promovido
            notif = NotificacionClase(
                horario_id=reserva.horario_id,
                usuario_id=siguiente.usuario_id,
                tipo=TipoNotificacion.promovido
            )
            db.add(notif)
            promovido = siguiente
            db.commit()
            db.refresh(promovido)
        else:
            # Si no hay nadie en espera, la clase deja de estar llena
            horario = db.query(HorarioClase).filter(HorarioClase.id == reserva.horario_id).first()
            if horario and horario.estado == EstadoHorario.llena:
                horario.estado = EstadoHorario.activa
                db.commit()

    return {"success": True, "promovido": promovido}
