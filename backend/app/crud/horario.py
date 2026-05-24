from sqlalchemy.orm import Session
from sqlalchemy import extract, and_
from uuid import UUID
from datetime import datetime, timedelta, timezone
from app.models.horario_clase import HorarioClase, EstadoHorario
from app.models.clase import Clase
from app.models.reserva import Reserva, EstadoReserva
from app.schemas.horario import HorarioClaseCreate, HorarioClaseUpdate

def _calcular_cupos(db: Session, horario_id: UUID) -> tuple[int, int]:
    horario = db.query(HorarioClase).filter(HorarioClase.id == horario_id).first()
    if not horario:
        return 0, 0
    
    total_reservas = db.query(Reserva).filter(
        Reserva.horario_id == horario_id,
        Reserva.estado == EstadoReserva.confirmada
    ).count()
    
    cupos_disp = max(0, horario.clase.cupo_maximo - total_reservas)
    return total_reservas, cupos_disp

def obtener_horarios_semana(db: Session, inicio_semana: datetime, fin_semana: datetime) -> list[dict]:
    # Retorna diccionarios con la data completa más cupos calculados
    horarios = db.query(HorarioClase).filter(
        HorarioClase.fecha_hora >= inicio_semana,
        HorarioClase.fecha_hora <= fin_semana,
        HorarioClase.estado != EstadoHorario.cancelada
    ).order_by(HorarioClase.fecha_hora).all()
    
    resultados = []
    for h in horarios:
        total, cupos = _calcular_cupos(db, h.id)
        
        # Auto-marcar como llena si no hay cupos
        if cupos == 0 and h.estado != EstadoHorario.llena:
            h.estado = EstadoHorario.llena
            db.commit()
            
        h_dict = h.__dict__.copy()
        h_dict["clase"] = h.clase
        h_dict["entrenador"] = h.entrenador
        h_dict["total_reservas"] = total
        h_dict["cupos_disponibles"] = cupos
        resultados.append(h_dict)
        
    return resultados

def crear_horario(db: Session, horario: HorarioClaseCreate) -> HorarioClase:
    db_horario = HorarioClase(
        clase_id=horario.clase_id,
        entrenador_id=horario.entrenador_id,
        fecha_hora=horario.fecha_hora,
        es_recurrente=horario.es_recurrente,
        dia_semana=horario.fecha_hora.weekday(),
        hora_inicio=horario.hora_inicio,
        hora_fin=horario.hora_fin
    )
    db.add(db_horario)
    db.commit()
    db.refresh(db_horario)
    return db_horario

def proyectar_semana_siguiente(db: Session) -> int:
    """Clona las clases marcadas como recurrentes para la próxima semana."""
    # Obtenemos las clases de hace 7 días hasta hoy
    hoy = datetime.now(timezone.utc)
    hace_7_dias = hoy - timedelta(days=7)
    
    recurrentes = db.query(HorarioClase).filter(
        HorarioClase.es_recurrente == True,
        HorarioClase.fecha_hora >= hace_7_dias,
        HorarioClase.fecha_hora <= hoy,
        HorarioClase.estado != EstadoHorario.cancelada
    ).all()
    
    creados = 0
    for h in recurrentes:
        nueva_fecha = h.fecha_hora + timedelta(days=7)
        # Verificar si ya existe para no duplicar
        existe = db.query(HorarioClase).filter(
            HorarioClase.clase_id == h.clase_id,
            HorarioClase.entrenador_id == h.entrenador_id,
            HorarioClase.fecha_hora == nueva_fecha
        ).first()
        
        if not existe:
            nuevo_h = HorarioClase(
                clase_id=h.clase_id,
                entrenador_id=h.entrenador_id,
                fecha_hora=nueva_fecha,
                es_recurrente=True,
                dia_semana=nueva_fecha.weekday(),
                hora_inicio=h.hora_inicio,
                hora_fin=h.hora_fin
            )
            db.add(nuevo_h)
            creados += 1
            
    if creados > 0:
        db.commit()
    
    return creados

def cancelar_horario(db: Session, horario_id: UUID) -> HorarioClase | None:
    h = db.query(HorarioClase).filter(HorarioClase.id == horario_id).first()
    if not h:
        return None
    
    h.estado = EstadoHorario.cancelada
    
    # Cancelar todas las reservas
    reservas = db.query(Reserva).filter(
        Reserva.horario_id == horario_id,
        Reserva.estado.in_([EstadoReserva.confirmada, EstadoReserva.lista_espera])
    ).all()
    
    from app.models.notificacion_clase import NotificacionClase, TipoNotificacion
    
    for r in reservas:
        r.estado = EstadoReserva.cancelada_por_gym
        r.cancelada_en = datetime.now(timezone.utc)
        
        # Simular envío WhatsApp
        notif = NotificacionClase(
            horario_id=h.id,
            usuario_id=r.usuario_id,
            tipo=TipoNotificacion.cancelacion
        )
        db.add(notif)
        
    db.commit()
    db.refresh(h)
    return h
