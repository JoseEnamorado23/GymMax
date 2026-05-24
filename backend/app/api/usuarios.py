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


@router.put("/{usuario_id}/activar", response_model=UsuarioResponse)
def activar_usuario(usuario_id: UUID, db: Session = Depends(get_db)):
    """Activa un usuario previamente desactivado (soft delete revertido)."""
    db_usuario = crud_usuario.reactivar_usuario(db, usuario_id)
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return db_usuario

from app.schemas.usuario import UsuarioSocioResponse
from datetime import datetime, timezone

@router.get("/token/{token_app}", response_model=UsuarioSocioResponse)
def obtener_perfil_socio(token_app: str, db: Session = Depends(get_db)):
    """Obtiene datos públicos del socio usando su magic link token."""
    from app.models.usuario import Usuario
    from app.models.suscripcion import Suscripcion
    from app.models.plan import Plan

    usuario = db.query(Usuario).filter(Usuario.token_app == token_app).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Token inválido o expirado.")

    response = {
        "nombre_completo": usuario.nombre_completo,
        "documento_identidad": usuario.documento_identidad,
        "foto_perfil": usuario.foto_perfil,
        "activo": usuario.activo,
        "suscripcion_activa": None,
        "dias_restantes": None
    }

    # Buscar última suscripción activa
    ultima_susc = db.query(Suscripcion).join(Plan).filter(
        Suscripcion.usuario_id == usuario.id,
        Suscripcion.estado == "Activa"
    ).order_by(Suscripcion.fecha_fin.desc()).first()

    if ultima_susc:
        # Calcular días restantes
        hoy = datetime.now(timezone.utc)
        dias_rest = (ultima_susc.fecha_fin - hoy).days
        if dias_rest < 0:
            dias_rest = 0

        response["suscripcion_activa"] = {
            "plan_nombre": ultima_susc.plan.nombre,
            "fecha_inicio": ultima_susc.fecha_inicio,
            "fecha_fin": ultima_susc.fecha_fin,
            "estado": ultima_susc.estado
        }
        response["dias_restantes"] = dias_rest

    return response
