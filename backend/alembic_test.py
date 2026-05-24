from app.db.database import Base
import app.models.usuario
import app.models.clase
import app.models.horario_clase
import app.models.reserva
import app.models.notificacion_clase

def print_tables():
    print(list(Base.metadata.tables.keys()))

if __name__ == "__main__":
    print_tables()
