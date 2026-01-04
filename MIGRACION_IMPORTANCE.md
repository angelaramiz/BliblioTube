# Guía de Migración: Agregar Campo Importance a Supabase

## 📋 Resumen

Se necesita agregar una columna `importance` (nivel de importancia 1-5) a la tabla `videos` en Supabase para sincronizar correctamente con el sistema de filtrado implementado en la app.

## 🔧 Pasos para Aplicar la Migración

### Opción 1: Mediante Supabase Dashboard (Recomendado)

1. **Accede a tu proyecto Supabase**
   - Ve a https://supabase.com
   - Inicia sesión con tu cuenta
   - Selecciona el proyecto BiblioTube

2. **Abre el SQL Editor**
   - Click en "SQL Editor" en el menú lateral izquierdo
   - Click en "+ New Query"

3. **Ejecuta el SQL**
   - Copia el contenido del archivo `migrations/001_add_importance_to_videos.sql`
   - Pégalo en el editor
   - Click en "Run" (o presiona Ctrl+Enter)

4. **Verifica el resultado**
   - Si ves "Successfully executed" sin errores, está listo ✓
   - Puedes revisar la tabla en la sección "Databases" → "videos"

### Opción 2: Mediante supabase CLI

Si tienes supabase CLI instalado:

```bash
# Conectar con tu proyecto
supabase link --project-ref [tu-project-ref]

# Ejecutar la migración
psql -d "postgresql://postgres:[password]@[host]/postgres" -f migrations/001_add_importance_to_videos.sql
```

## 📝 SQL Completo (Si lo copias manualmente)

```sql
ALTER TABLE videos ADD COLUMN IF NOT EXISTS importance INTEGER DEFAULT 3;

CREATE INDEX IF NOT EXISTS idx_videos_importance ON videos(importance);
```

## ✅ Verificación Post-Migración

Después de ejecutar la migración:

1. **Verifica que la columna existe:**
   ```sql
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'videos';
   ```
   
   Deberías ver `importance` con tipo `integer` en la lista.

2. **Verifica los valores por defecto:**
   ```sql
   SELECT id, title, importance FROM videos LIMIT 5;
   ```
   
   Todos los videos existentes deberían tener `importance = 3`.

## 🔄 Sincronización Automática

Una vez aplicada la migración:

1. La app sincronizará automáticamente:
   - Los videos nuevos se guardarán con el nivel de importancia especificado
   - Los videos existentes en local se subirán a Supabase con importance = 3 (por defecto)
   - Los cambios de importancia se sincronizarán bidireccionally

2. Ejecuta `syncLocalToSupabase()` en la app para sincronizar datos existentes

## 🐛 Troubleshooting

### Error: "column 'importance' already exists"
- Significa que la columna ya está en la tabla
- Esto es normal, puedes ignorar el error o usar `IF NOT EXISTS` (como hace el script)

### Error: "permission denied for schema public"
- Verifica que tu usuario de Supabase tiene permisos de escritura
- Intenta con el usuario administrativo del proyecto

### Los cambios no se sincronizaron
- Verifica que la app tenga la última versión del código
- Ejecuta `npm install` para asegurar que tienes las dependencias correctas
- Reinicia la app y haz un sync manual

## 📊 Estructura Final de la Tabla

```
videos:
├── id (UUID, PRIMARY KEY)
├── folder_id (UUID, FOREIGN KEY)
├── title (TEXT)
├── url (TEXT)
├── platform (TEXT)
├── thumbnail (TEXT)
├── description (TEXT)
├── saved_at (TIMESTAMP)
├── created_at (TIMESTAMP)
├── importance (INTEGER) ← NUEVO CAMPO
└── updated_at (TIMESTAMP)
```

## 📚 Referencias

- [Documentación de Supabase SQL](https://supabase.com/docs/guides/database)
- [ALTER TABLE en PostgreSQL](https://www.postgresql.org/docs/current/sql-altertable.html)

---

**Nota:** Esta migración es retrocompatible y no romperá datos existentes. Todos los videos existentes usarán `importance = 3` (media) por defecto.
