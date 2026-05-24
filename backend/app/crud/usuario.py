from uuid import UUID
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


def crear_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    """Crea un nuevo usuario en la base de datos."""
    db_usuario = Usuario(
        nombre_completo=usuario.nombre_completo,
        documento_identidad=usuario.documento_identidad,
        telefono=usuario.telefono,
        foto_perfil=usuario.foto_perfil,
        contacto_whatsapp=usuario.contacto_whatsapp,
        plan_id=usuario.plan_id,
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def obtener_usuarios(db: Session, skip: int = 0, limit: int = 100) -> list[Usuario]:
    """Lista todos los usuarios con paginación."""
    return db.query(Usuario).offset(skip).limit(limit).all()


def obtener_usuario_por_id(db: Session, usuario_id: UUID) -> Usuario | None:
    """Busca un usuario por su UUID."""
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()


def obtener_usuario_por_documento(db: Session, documento: str) -> Usuario | None:
    """Busca un usuario por su documento de identidad."""
    return db.query(Usuario).filter(Usuario.documento_identidad == documento).first()


def actualizar_usuario(db: Session, usuario_id: UUID, datos: UsuarioUpdate) -> Usuario | None:
    """Actualiza los campos proporcionados de un usuario existente."""
    db_usuario = obtener_usuario_por_id(db, usuario_id)
    if not db_usuario:
        return None

    # Solo actualiza los campos que fueron enviados (no None)
    datos_dict = datos.model_dump(exclude_unset=True)
    for campo, valor in datos_dict.items():
        setattr(db_usuario, campo, valor)

    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def desactivar_usuario(db: Session, usuario_id: UUID) -> Usuario | None:
    """Desactiva un usuario (soft delete)."""
    db_usuario = obtener_usuario_por_id(db, usuario_id)
    if not db_usuario:
        return None

    db_usuario.activo = False
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def reactivar_usuario(db: Session, usuario_id: UUID) -> Usuario | None:
    """Reactiva un usuario previamente desactivado."""
    db_usuario = obtener_usuario_por_id(db, usuario_id)
    if not db_usuario:
        return None

    db_usuario.activo = True
    db.commit()
    db.refresh(db_usuario)
    return db_usuario
