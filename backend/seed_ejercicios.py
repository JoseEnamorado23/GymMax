from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.ejercicio import Ejercicio, GrupoMuscular, TipoEjercicio, DificultadEjercicio

ejercicios_base = [
    {
        "nombre": "Press de Banca Plano",
        "grupo_muscular": GrupoMuscular.pecho,
        "tipo": TipoEjercicio.fuerza,
        "equipo_requerido": "Barra y Banco",
        "dificultad": DificultadEjercicio.intermedio,
        "descripcion": "Acuéstate en un banco plano, agarra la barra a la anchura de los hombros y baja controladamente hasta el pecho. Empuja con fuerza."
    },
    {
        "nombre": "Sentadilla Libre",
        "grupo_muscular": GrupoMuscular.piernas,
        "tipo": TipoEjercicio.fuerza,
        "equipo_requerido": "Barra y Rack",
        "dificultad": DificultadEjercicio.avanzado,
        "descripcion": "Coloca la barra sobre la espalda alta, desciende manteniendo la espalda recta hasta romper el paralelo y sube contrayendo glúteos y cuádriceps."
    },
    {
        "nombre": "Dominadas (Pull-ups)",
        "grupo_muscular": GrupoMuscular.espalda,
        "tipo": TipoEjercicio.fuerza,
        "equipo_requerido": "Barra de Dominadas",
        "dificultad": DificultadEjercicio.avanzado,
        "descripcion": "Cuélgate de una barra con agarre prono y tira de tu cuerpo hacia arriba hasta que la barbilla pase la barra."
    },
    {
        "nombre": "Curl de Bíceps con Mancuernas",
        "grupo_muscular": GrupoMuscular.brazos,
        "tipo": TipoEjercicio.fuerza,
        "equipo_requerido": "Mancuernas",
        "dificultad": DificultadEjercicio.principiante,
        "descripcion": "De pie, con una mancuerna en cada mano, flexiona el codo para subir el peso hacia los hombros sin balancear el torso."
    },
    {
        "nombre": "Prensa de Piernas",
        "grupo_muscular": GrupoMuscular.piernas,
        "tipo": TipoEjercicio.fuerza,
        "equipo_requerido": "Máquina de Prensa",
        "dificultad": DificultadEjercicio.principiante,
        "descripcion": "Empuja la plataforma con los pies separados a la anchura de los hombros, baja controladamente sin dejar que los talones se levanten."
    },
    {
        "nombre": "Plancha Abdominal",
        "grupo_muscular": GrupoMuscular.core,
        "tipo": TipoEjercicio.funcional,
        "equipo_requerido": "Ninguno (o colchoneta)",
        "dificultad": DificultadEjercicio.principiante,
        "descripcion": "Apóyate sobre los antebrazos y las puntas de los pies, manteniendo el cuerpo en línea recta y el core apretado."
    },
    {
        "nombre": "Burpees",
        "grupo_muscular": GrupoMuscular.cuerpo_completo,
        "tipo": TipoEjercicio.cardio,
        "equipo_requerido": "Ninguno",
        "dificultad": DificultadEjercicio.intermedio,
        "descripcion": "Desde posición de pie, baja a hacer una flexión, recoge las piernas y salta dando una palmada sobre la cabeza."
    },
    {
        "nombre": "Press Militar con Mancuernas",
        "grupo_muscular": GrupoMuscular.hombros,
        "tipo": TipoEjercicio.fuerza,
        "equipo_requerido": "Mancuernas y Banco",
        "dificultad": DificultadEjercicio.intermedio,
        "descripcion": "Sentado con la espalda recta, empuja las mancuernas por encima de la cabeza y baja lentamente hasta la altura de los oídos."
    }
]

def seed_ejercicios():
    db: Session = SessionLocal()
    
    # Verificar si ya existen ejercicios
    if db.query(Ejercicio).count() > 0:
        print("Los ejercicios ya han sido inicializados. Omitiendo seed.")
        db.close()
        return

    print("Inicializando catálogo de ejercicios...")
    for data in ejercicios_base:
        nuevo_ej = Ejercicio(**data)
        db.add(nuevo_ej)
        
    db.commit()
    print("¡Catálogo de ejercicios poblado exitosamente!")
    db.close()

if __name__ == "__main__":
    seed_ejercicios()
