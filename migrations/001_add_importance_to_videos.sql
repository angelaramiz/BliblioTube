-- Migration: Add importance field to videos table
-- Description: Agrega soporte para nivel de importancia (1-5) a los videos
-- Date: 2026-01-04

-- Agregar columna importance a la tabla videos
ALTER TABLE videos ADD COLUMN IF NOT EXISTS importance INTEGER DEFAULT 3;

-- Agregar comentario a la columna para documentación
COMMENT ON COLUMN videos.importance IS 'Nivel de importancia del video (1-5, donde 1 es muy baja y 5 es muy alta)';

-- Crear índice opcional para búsquedas rápidas por importancia
CREATE INDEX IF NOT EXISTS idx_videos_importance ON videos(importance);

-- Notas:
-- - La columna importance almacena valores de 1 a 5
-- - El valor por defecto es 3 (importancia media)
-- - Los videos existentes usarán el valor por defecto
-- - Se puede actualizar en cualquier momento desde la aplicación
