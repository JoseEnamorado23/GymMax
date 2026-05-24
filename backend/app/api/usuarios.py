from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.crud import usuario as crud_usuario

router = APIRouter()


@router.post("/", response_model=UsuarioResponse, status_code=201)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """Registra un nuevo usuario en el sistema."""
    # Verificar que el documento no esté ya registrado
    existente = crud_usuario.obtener_usuario_por_documento(db, usuario.documento_identidad)
    if existente:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe un usuario con el documento '{usuario.documento_identidad}'.",
        )
    return crud_usuario.crear_usuario(db=db, usuario=usuario)


@router.get("/", response_model=list[UsuarioResponse])
def listar_usuarios(
    skip: int = Query(0, ge=0, description="Registros a saltar"),
    limit: int = Query(100, ge=1, le=500, description="Máximo de registros"),
    db: Session = Depends(get_db),
):
    """Lista todos los usuarios con paginación."""
    return crud_usuario.obtener_usuarios(db, skip=skip, limit=limit)


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: UUID, db: Session = Depends(get_db)):
    """Obtiene un usuario específico por su ID."""
    db_usuario = crud_usuario.obtener_usuario_por_id(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return db_usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(usuario_id: UUID, datos: UsuarioUpdate, db: Session = Depends(get_db)):
    """Actualiza los datos de un usuario existente."""
    db_usuario = crud_usuario.actualizar_usuario(db, usuario_id, datos)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return db_usuario


@router.delete("/{usuario_id}", response_model=UsuarioResponse)
def desactivar_usuario(usuario_id: UUID, db: Session = Depends(get_db)):
    """Desactiva un usuario (soft delete, no se borra de la DB)."""
    db_usuario = crud_usuario.desactivar_usuario(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return db_usuario
