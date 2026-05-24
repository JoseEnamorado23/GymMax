from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.db.database import SessionLocal
from app.models.usuario import Usuario
from app.models.entrenador import Entrenador
from app.models.ejercicio import Ejercicio
from app.models.rutina import Rutina, ObjetivoRutina
from app.models.dia_rutina import DiaRutina
from app.models.ejercicio_rutina import EjercicioRutina
from app.models.registro_ejercicio import RegistroEjercicio

def seed_rutinas():
    db: Session = SessionLocal()
    
    # 1. Obtener al menos un usuario, un entrenador y ejercicios
    usuario = db.query(Usuario).first()
    entrenador = db.query(Entrenador).first()
    ejercicios = db.query(Ejercicio).all()
    
    if not usuario or not entrenador or len(ejercicios) < 3:
        print("Faltan datos base (usuarios, entrenadores o ejercicios) para crear la rutina.")
        db.close()
        return

    # Verificar si ya existe la rutina de prueba para evitar duplicados
    if db.query(Rutina).filter(Rutina.nombre == "Fuerza Base 5x5").first():
        print("La rutina de prueba ya existe. Omitiendo.")
        db.close()
        return

    print(f"Creando rutina para el usuario: {usuario.nombre_completo}...")
    
    # 2. Crear Rutina
    hoy = datetime.now(timezone.utc).date()
    rutina = Rutina(
        usuario_id=usuario.id,
        entrenador_id=entrenador.id,
        nombre="Fuerza Base 5x5",
        objetivo=ObjetivoRutina.fuerza,
        fecha_inicio=hoy - timedelta(days=14), # Empezó hace 2 semanas
        fecha_fin=hoy + timedelta(days=14),
        activa=True,
        semanas_duracion=4,
        notas_entrenador="Enfocarse en la técnica antes de subir peso."
    )
    db.add(rutina)
    db.flush()
    
    # 3. Crear Días
    dia1 = DiaRutina(rutina_id=rutina.id, dia_numero=1, nombre_dia="Día 1 - Pecho y Espalda", orden=1)
    dia2 = DiaRutina(rutina_id=rutina.id, dia_numero=2, nombre_dia="Día 2 - Piernas", orden=2)
    db.add(dia1)
    db.add(dia2)
    db.flush()
    
    # 4. Asignar Ejercicios a Día 1
    ej_pecho = next((e for e in ejercicios if e.nombre == "Press de Banca Plano"), ejercicios[0])
    ej_espalda = next((e for e in ejercicios if e.nombre == "Dominadas (Pull-ups)"), ejercicios[1])
    
    er1 = EjercicioRutina(
        dia_rutina_id=dia1.id, ejercicio_id=ej_pecho.id, orden=1,
        series=5, repeticiones="5", peso_kg=60, descanso_seg=120
    )
    er2 = EjercicioRutina(
        dia_rutina_id=dia1.id, ejercicio_id=ej_espalda.id, orden=2,
        series=4, repeticiones="8", peso_kg=0, descanso_seg=90
    )
    
    # Asignar Ejercicios a Día 2
    ej_pierna = next((e for e in ejercicios if e.nombre == "Sentadilla Libre"), ejercicios[2])
    er3 = EjercicioRutina(
        dia_rutina_id=dia2.id, ejercicio_id=ej_pierna.id, orden=1,
        series=5, repeticiones="5", peso_kg=80, descanso_seg=120
    )
    
    db.add_all([er1, er2, er3])
    db.flush()
    
    # 5. Crear Registros Históricos (Simular que ya entrenó varias veces)
    # Sesión 1: Hace 14 días (Día 1)
    db.add(RegistroEjercicio(ejercicio_rutina_id=er1.id, usuario_id=usuario.id, fecha=hoy - timedelta(days=14),
                             series_completadas=5, reps_completadas="5", peso_real_kg=55, completado=True, sensacion=3))
    db.add(RegistroEjercicio(ejercicio_rutina_id=er2.id, usuario_id=usuario.id, fecha=hoy - timedelta(days=14),
                             series_completadas=4, reps_completadas="8", peso_real_kg=0, completado=True, sensacion=4))
                             
    # Sesión 2: Hace 12 días (Día 2)
    db.add(RegistroEjercicio(ejercicio_rutina_id=er3.id, usuario_id=usuario.id, fecha=hoy - timedelta(days=12),
                             series_completadas=5, reps_completadas="5", peso_real_kg=75, completado=True, sensacion=3))
                             
    # Sesión 3: Hace 7 días (Día 1) - Subió peso
    db.add(RegistroEjercicio(ejercicio_rutina_id=er1.id, usuario_id=usuario.id, fecha=hoy - timedelta(days=7),
                             series_completadas=5, reps_completadas="5", peso_real_kg=60, completado=True, sensacion=3))
    db.add(RegistroEjercicio(ejercicio_rutina_id=er2.id, usuario_id=usuario.id, fecha=hoy - timedelta(days=7),
                             series_completadas=4, reps_completadas="10", peso_real_kg=0, completado=True, sensacion=4))
                             
    # Sesión 4: Hace 5 días (Día 2) - Subió peso
    db.add(RegistroEjercicio(ejercicio_rutina_id=er3.id, usuario_id=usuario.id, fecha=hoy - timedelta(days=5),
                             series_completadas=5, reps_completadas="5", peso_real_kg=80, completado=True, sensacion=4))

    db.commit()
    print("¡Rutinas y registros de prueba creados exitosamente!")
    db.close()

if __name__ == "__main__":
    seed_rutinas()
