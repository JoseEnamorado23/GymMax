from sqlalchemy.orm import Session
from uuid import UUID
from app.models.clase import Clase
from app.schemas.clase import ClaseCreate, ClaseUpdate

def obtener_clases(db: Session, skip: int = 0, limit: int = 100) -> list[Clase]:
    return db.query(Clase).offset(skip).limit(limit).all()

def crear_clase(db: Session, clase: ClaseCreate) -> Clase:
    db_clase = Clase(
        nombre=clase.nombre,
        descripcion=clase.descripcion,
        duracion_min=clase.duracion_min,
        cupo_maximo=clase.cupo_maximo,
        color_hex=clase.color_hex,
        activa=clase.activa
    )
    db.add(db_clase)
    db.commit()
    db.refresh(db_clase)
    return db_clase

def obtener_clase(db: Session, clase_id: UUID) -> Clase | None:
    return db.query(Clase).filter(Clase.id == clase_id).first()

def actualizar_clase(db: Session, clase_id: UUID, datos: ClaseUpdate) -> Clase | None:
    db_clase = obtener_clase(db, clase_id)
    if not db_clase:
        return None
    
    datos_dict = datos.model_dump(exclude_unset=True)
    for campo, valor in datos_dict.items():
        setattr(db_clase, campo, valor)
        
    db.commit()
    db.refresh(db_clase)
    return db_clase

def eliminar_clase(db: Session, clase_id: UUID) -> bool:
    db_clase = obtener_clase(db, clase_id)
    if not db_clase:
        return False
    # Podría ser soft delete (activa = False), pero lo haremos delete si no tiene horarios,
    # o mejor soft delete siempre para evitar Foreign Key errors
    db_clase.activa = False
    db.commit()
    return True
