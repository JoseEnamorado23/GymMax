from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone, timedelta
from app.models.rutina import Rutina
from app.models.dia_rutina import DiaRutina
from app.models.ejercicio_rutina import EjercicioRutina
from app.models.registro_ejercicio import RegistroEjercicio
from app.models.ejercicio import Ejercicio
from app.schemas.rutina import RutinaCreate, RegistroEjercicioCreate

def obtener_ejercicios(db: Session):
    return db.query(Ejercicio).order_by(Ejercicio.nombre).all()

def crear_rutina(db: Session, usuario_id: UUID, rutina_data: RutinaCreate) -> Rutina:
    # 1. Desactivar rutinas anteriores del usuario
    rutinas_viejas = db.query(Rutina).filter(
        Rutina.usuario_id == usuario_id, 
        Rutina.activa == True
    ).all()
    for rv in rutinas_viejas:
        rv.activa = False
    
    # 2. Calcular fecha de fin
    fecha_fin = rutina_data.fecha_inicio + timedelta(days=rutina_data.semanas_duracion * 7)

    # 3. Crear encabezado
    nueva_rutina = Rutina(
        usuario_id=usuario_id,
        entrenador_id=rutina_data.entrenador_id,
        nombre=rutina_data.nombre,
        objetivo=rutina_data.objetivo,
        fecha_inicio=rutina_data.fecha_inicio,
        fecha_fin=fecha_fin,
        activa=True,
        semanas_duracion=rutina_data.semanas_duracion,
        notas_entrenador=rutina_data.notas_entrenador
    )
    db.add(nueva_rutina)
    db.flush() # Para obtener el ID

    # 4. Crear Días y Ejercicios
    for dia_data in rutina_data.dias:
        nuevo_dia = DiaRutina(
            rutina_id=nueva_rutina.id,
            dia_numero=dia_data.dia_numero,
            nombre_dia=dia_data.nombre_dia,
            orden=dia_data.orden
        )
        db.add(nuevo_dia)
        db.flush()

        for ej_data in dia_data.ejercicios:
            nuevo_ej = EjercicioRutina(
                dia_rutina_id=nuevo_dia.id,
                ejercicio_id=ej_data.ejercicio_id,
                orden=ej_data.orden,
                series=ej_data.series,
                repeticiones=ej_data.repeticiones,
                peso_kg=ej_data.peso_kg,
                descanso_seg=ej_data.descanso_seg,
                notas=ej_data.notas
            )
            db.add(nuevo_ej)
            
    db.commit()
    db.refresh(nueva_rutina)
    return nueva_rutina

def obtener_rutina_activa(db: Session, usuario_id: UUID) -> Rutina | None:
    return db.query(Rutina).filter(
        Rutina.usuario_id == usuario_id,
        Rutina.activa == True
    ).first()

def obtener_dia_rutina_actual(db: Session, usuario_id: UUID):
    """
    Calcula el día actual para el socio basado en el orden, no en la fecha fija.
    Retorna el DiaRutina que le toca hoy y los registros si ya los hizo.
    """
    rutina = obtener_rutina_activa(db, usuario_id)
    if not rutina or not rutina.dias:
        return None
        
    # Obtener el último día completado
    hoy = datetime.now(timezone.utc).date()
    
    # Buscar registros hechos hoy
    registros_hoy = db.query(RegistroEjercicio).join(EjercicioRutina).join(DiaRutina).filter(
        RegistroEjercicio.usuario_id == usuario_id,
        RegistroEjercicio.fecha == hoy,
        DiaRutina.rutina_id == rutina.id
    ).all()
    
    if registros_hoy:
        # Ya empezó o completó algo hoy, devolvemos el día de esos registros
        dia_id = registros_hoy[0].ejercicio_rutina.dia_rutina_id
        return db.query(DiaRutina).filter(DiaRutina.id == dia_id).first()
        
    # Si no hay nada hoy, buscar el último día que entrenó
    ultimo_registro = db.query(RegistroEjercicio).join(EjercicioRutina).join(DiaRutina).filter(
        RegistroEjercicio.usuario_id == usuario_id,
        DiaRutina.rutina_id == rutina.id
    ).order_by(RegistroEjercicio.fecha.desc()).first()
    
    if not ultimo_registro:
        # Primer día de la rutina
        return sorted(rutina.dias, key=lambda d: d.orden)[0]
        
    ultimo_dia_completado = ultimo_registro.ejercicio_rutina.dia
    
    # Buscar el siguiente día en orden
    dias_ordenados = sorted(rutina.dias, key=lambda d: d.orden)
    for i, dia in enumerate(dias_ordenados):
        if dia.id == ultimo_dia_completado.id:
            # Si era el último día, volver al día 1
            if i + 1 < len(dias_ordenados):
                return dias_ordenados[i + 1]
            else:
                return dias_ordenados[0]
                
    return dias_ordenados[0]

def registrar_ejercicio(db: Session, usuario_id: UUID, registro: RegistroEjercicioCreate):
    hoy = datetime.now(timezone.utc).date()
    
    # Evitar duplicados del mismo día (inmutabilidad)
    existente = db.query(RegistroEjercicio).filter(
        RegistroEjercicio.usuario_id == usuario_id,
        RegistroEjercicio.ejercicio_rutina_id == registro.ejercicio_rutina_id,
        RegistroEjercicio.fecha == hoy
    ).first()
    
    if existente:
        return {"success": False, "error": "Ya registraste este ejercicio hoy."}
        
    nuevo_reg = RegistroEjercicio(
        ejercicio_rutina_id=registro.ejercicio_rutina_id,
        usuario_id=usuario_id,
        fecha=hoy,
        series_completadas=registro.series_completadas,
        reps_completadas=registro.reps_completadas,
        peso_real_kg=registro.peso_real_kg,
        completado=registro.completado,
        sensacion=registro.sensacion,
        nota_socio=registro.nota_socio
    )
    db.add(nuevo_reg)
    db.commit()
    db.refresh(nuevo_reg)
    return {"success": True, "registro": nuevo_reg}

def obtener_progreso_rutina(db: Session, rutina_id: UUID):
    # Retorna todos los registros de una rutina
    registros = db.query(RegistroEjercicio).join(EjercicioRutina).join(DiaRutina).filter(
        DiaRutina.rutina_id == rutina_id
    ).order_by(RegistroEjercicio.fecha.asc()).all()
    return registros
