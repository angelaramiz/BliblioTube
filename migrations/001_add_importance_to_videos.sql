-- Migration: Add importance field and improve sync to videos table
-- Description: Agrega soporte para nivel de importancia (1-5) y mejora sincronización bidireccional
-- Date: 2026-01-04

-- Agregar columna importance a la tabla videos
ALTER TABLE videos ADD COLUMN IF NOT EXISTS importance INTEGER DEFAULT 3;

-- Agregar columna de timestamp para sincronización
ALTER TABLE videos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Agregar columna de timestamp para sincronización en folders
ALTER TABLE folders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN videos.importance IS 'Nivel de importancia del video (1-5, donde 1 es muy baja y 5 es muy alta)';
COMMENT ON COLUMN videos.updated_at IS 'Timestamp de última actualización para sincronización bidireccional';
COMMENT ON COLUMN folders.updated_at IS 'Timestamp de última actualización para sincronización bidireccional';

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_videos_importance ON videos(importance);
CREATE INDEX IF NOT EXISTS idx_videos_updated_at ON videos(updated_at);
CREATE INDEX IF NOT EXISTS idx_folders_updated_at ON folders(updated_at);

-- Agregar trigger para actualizar automáticamente updated_at en videos
CREATE OR REPLACE FUNCTION update_videos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_videos_timestamp ON videos;
CREATE TRIGGER trigger_update_videos_timestamp
BEFORE UPDATE ON videos
FOR EACH ROW
EXECUTE FUNCTION update_videos_timestamp();

-- Agregar trigger para actualizar automáticamente updated_at en folders
CREATE OR REPLACE FUNCTION update_folders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_folders_timestamp ON folders;
CREATE TRIGGER trigger_update_folders_timestamp
BEFORE UPDATE ON folders
FOR EACH ROW
EXECUTE FUNCTION update_folders_timestamp();

-- Notas:
-- - La columna importance almacena valores de 1 a 5
-- - El valor por defecto es 3 (importancia media)
-- - Los campos updated_at se usan para sincronización eficiente
-- - Los triggers actualizan automáticamente el timestamp en cambios
-- - Se puede actualizar en cualquier momento desde la aplicación

