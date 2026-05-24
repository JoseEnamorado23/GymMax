import sys
import os
from datetime import datetime, timedelta, timezone
import random
import uuid

# Asegurar que el directorio raíz de la aplicación backend esté en el PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.plan import Plan
from app.models.usuario import Usuario
from app.models.suscripcion import Suscripcion
from app.models.pago import Pago
from app.models.asistencia import Asistencia
from app.models.entrenador import Entrenador

def seed_data():
    print("Conectando a la base de datos...")
    db = SessionLocal()
    try:
        # 1. Crear Planes si no existen
        planes_data = [
            {"nombre": "Día Suelto", "precio": 15000, "duracion_dias": 1, "activo": True},
            {"nombre": "Mensualidad Básico", "precio": 80000, "duracion_dias": 30, "activo": True},
            {"nombre": "Mensualidad Premium", "precio": 120000, "duracion_dias": 30, "activo": True},
            {"nombre": "Trimestre", "precio": 200000, "precio_especial": 180000, "duracion_dias": 90, "activo": True},
            {"nombre": "Anual", "precio": 700000, "precio_especial": 600000, "duracion_dias": 365, "activo": True},
        ]
        
        db_planes = []
        print("Poblando planes...")
        for p_data in planes_data:
            plan = db.query(Plan).filter(Plan.nombre == p_data["nombre"]).first()
            if not plan:
                plan = Plan(**p_data)
                db.add(plan)
                db.commit()
                db.refresh(plan)
            db_planes.append(plan)

        # 1.5 Crear Entrenadores
        entrenadores_data = [
            {"nombre": "Rony Coleman", "telefono": "3001112233", "porcentaje": 60.0, "activo": True},
            {"nombre": "Chris Bumstead", "telefono": "3004445566", "porcentaje": 70.0, "activo": True},
            {"nombre": "Arnold Schwarzenegger", "telefono": "3007778899", "porcentaje": 50.0, "activo": True},
        ]
        
        db_entrenadores = []
        print("Poblando entrenadores...")
        for e_data in entrenadores_data:
            entrenador = db.query(Entrenador).filter(Entrenador.nombre == e_data["nombre"]).first()
            if not entrenador:
                entrenador = Entrenador(**e_data)
                db.add(entrenador)
                db.commit()
                db.refresh(entrenador)
            db_entrenadores.append(entrenador)

        # Nombres reales generados para el script
        nombres = [
            "Carlos Ramírez", "María Fernanda Gómez", "Andrés Felipe Castro", "Laura Marcela Ruiz",
            "Juan David López", "Daniela Osorio", "Camilo Torres", "Valentina Rojas",
            "Sebastián Martínez", "Juliana Morales", "Diego Fernando Silva", "Natalia Herrera"
        ]

        # 2. Crear Usuarios
        print("Poblando usuarios y suscripciones...")
        for i, nombre in enumerate(nombres):
            doc = f"100{i}000{random.randint(100, 999)}"
            usuario = db.query(Usuario).filter(Usuario.documento_identidad == doc).first()
            
            if not usuario:
                plan_asignado = random.choice(db_planes) if random.random() > 0.1 else None # 10% sin plan
                
                usuario = Usuario(
                    nombre_completo=nombre,
                    documento_identidad=doc,
                    telefono=f"300{random.randint(1000000, 9999999)}",
                    plan_id=plan_asignado.id if plan_asignado else None,
                    fecha_registro=datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365)),
                    activo=True if random.random() > 0.1 else False # 10% inactivos
                )
                db.add(usuario)
                db.commit()
                db.refresh(usuario)

                # 3. Crear Suscripciones y Pagos si tiene plan
                if plan_asignado:
                    # Crear una suscripción activa
                    fecha_inicio = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20))
                    fecha_fin = fecha_inicio + timedelta(days=plan_asignado.duracion_dias)
                    
                    suscripcion = Suscripcion(
                        usuario_id=usuario.id,
                        plan_id=plan_asignado.id,
                        fecha_inicio=fecha_inicio,
                        fecha_fin=fecha_fin,
                        estado="Activa" if fecha_fin > datetime.now(timezone.utc) else "Vencida"
                    )
                    db.add(suscripcion)
                    db.commit()
                    db.refresh(suscripcion)
                    
                    monto_pago = plan_asignado.precio_especial if plan_asignado.precio_especial else plan_asignado.precio
                    
                    # 30% de probabilidad de tener entrenador personal
                    entrenador_asignado = random.choice(db_entrenadores) if random.random() > 0.7 else None
                    
                    pago = Pago(
                        usuario_id=usuario.id,
                        suscripcion_id=suscripcion.id,
                        plan_id=plan_asignado.id,
                        monto=monto_pago,
                        metodo_pago=random.choice(["Efectivo", "Nequi", "Tarjeta"]),
                        entrenador_id=entrenador_asignado.id if entrenador_asignado else None
                    )
                    db.add(pago)
                    db.commit()

                # 4. Crear Asistencias (Historial)
                print(f"  Poblando asistencias para {nombre}...")
                num_asistencias = random.randint(5, 25)
                # Días únicos para la racha
                dias_asistidos = set()
                
                for _ in range(num_asistencias):
                    # Asistencias en los últimos 30 días
                    dia_offset = random.randint(0, 30)
                    fecha_asistencia = datetime.now(timezone.utc) - timedelta(days=dia_offset)
                    # Aleatorizar hora entre 6am y 9pm
                    hora = random.randint(6, 21)
                    minuto = random.randint(0, 59)
                    fecha_asistencia = fecha_asistencia.replace(hour=hora, minute=minuto)
                    
                    dia_str = fecha_asistencia.strftime("%Y-%m-%d")
                    if dia_str not in dias_asistidos:
                        dias_asistidos.add(dia_str)
                        asistencia = Asistencia(
                            usuario_id=usuario.id,
                            fecha_hora=fecha_asistencia
                        )
                        db.add(asistencia)
                db.commit()

        print("¡Base de datos poblada exitosamente!")

    except Exception as e:
        print(f"Error al poblar la base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
