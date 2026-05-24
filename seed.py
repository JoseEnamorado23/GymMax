import urllib.request
import urllib.error
import json
import random
import sys
import os

# Asegurar que las tablas existan y que los modelos estén cargados
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/backend")
try:
    from app.main import app  # Esto carga todos los routers y modelos
    from app.db.database import Base, engine
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Error creando tablas:", e)

BASE_URL = "http://localhost:8000/api/v1"

def post_json(url, data):
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    json_data = json.dumps(data).encode("utf-8")
    try:
        with urllib.request.urlopen(req, data=json_data) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as e:
        return 500, str(e)

print("Poblando planes...")
planes_data = [
    {"nombre": "Mensualidad General", "descripcion": "Acceso libre todos los días por un mes.", "precio": 60000, "duracion_dias": 30},
    {"nombre": "Tiquetera 12 Entradas", "descripcion": "12 entradas para usar en cualquier momento.", "precio": 45000, "duracion_dias": 90},
    {"nombre": "Anualidad VIP", "descripcion": "Acceso todo el año con clases incluidas.", "precio": 500000, "duracion_dias": 365},
]

planes_creados = []
for p in planes_data:
    status, response_data = post_json(f"{BASE_URL}/planes/", p)
    if status in [200, 201]:
        planes_creados.append(response_data)
        print(f"Plan creado: {p['nombre']}")
    else:
        print(f"Error creando plan {p['nombre']}: {response_data}")

print("\nPoblando usuarios...")
usuarios_data = [
    {
        "nombre_completo": "Carlos Ramírez",
        "documento_identidad": "1020304050",
        "telefono": "3001234567",
        "contacto_whatsapp": "3001234567",
        "foto_perfil": "https://i.pravatar.cc/150?u=carlos"
    },
    {
        "nombre_completo": "Ana Martínez",
        "documento_identidad": "1098765432",
        "telefono": "3109876543",
        "contacto_whatsapp": "3109876543",
        "foto_perfil": "https://i.pravatar.cc/150?u=ana"
    },
    {
        "nombre_completo": "Luis Gómez",
        "documento_identidad": "1122334455",
        "telefono": "3201122334",
        "contacto_whatsapp": "",
        "foto_perfil": ""
    },
    {
        "nombre_completo": "Diana López",
        "documento_identidad": "5544332211",
        "telefono": "3155544332",
        "contacto_whatsapp": "3155544332",
        "foto_perfil": "https://i.pravatar.cc/150?u=diana"
    },
    {
        "nombre_completo": "Andrés Felipe Castro",
        "documento_identidad": "1002003004",
        "telefono": "3012003004",
        "contacto_whatsapp": "3012003004",
        "foto_perfil": "https://i.pravatar.cc/150?u=andres"
    }
]

for i, u in enumerate(usuarios_data):
    if i < 4 and planes_creados:
        plan_asignado = random.choice(planes_creados)
        u["plan_id"] = plan_asignado["id"]
        
    status, response_data = post_json(f"{BASE_URL}/usuarios/", u)
    if status in [200, 201]:
        print(f"Usuario creado: {u['nombre_completo']}")
    else:
        print(f"Error creando usuario {u['nombre_completo']}: {response_data}")

print("\n¡Base de datos poblada exitosamente!")
