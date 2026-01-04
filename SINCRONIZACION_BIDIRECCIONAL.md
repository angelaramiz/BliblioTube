# Sincronización Bidireccional Mejorada

## 📊 Descripción General

BiblioTube ahora cuenta con un sistema de sincronización bidireccional robusto que garantiza que los datos se mantengan sincronizados entre el dispositivo local (SQLite) y la nube (Supabase).

## 🔄 Cómo Funciona

### Método Unificado: `syncBidirectional(userId)`

```javascript
// Sincronización completa (local ↔ Supabase)
await DatabaseService.syncBidirectional(userId);
```

Este método:
1. Sincroniza cambios locales a Supabase
2. Sincroniza cambios de Supabase a local
3. Detiene automáticamente cuando ambos lados están sincronizados
4. Maneja errores sin interrumpir el proceso

### Sincronización Local → Supabase (`syncLocalToSupabase`)

**Qué hace:**
- ✅ Detecta carpetas nuevas y las crea en Supabase
- ✅ Detecta videos modificados (título, descripción, importance) y los actualiza
- ✅ Sincroniza recordatorios nuevos
- ✅ Detección inteligente de cambios (solo sincroniza si algo cambió)

**Flujo:**
```
Local SQLite
    ↓
Detecta cambios
    ↓
Compara con Supabase
    ↓
Inserta nuevos registros
    ↓
Actualiza registros modificados
    ↓
Supabase
```

### Sincronización Supabase → Local (`syncSupabaseToLocal`)

**Qué hace:**
- ✅ Descarga carpetas nuevas de Supabase
- ✅ Descargar videos nuevos/modificados
- ✅ Descarga recordatorios nuevos
- ✅ Actualiza campos locales si cambiaron en la nube

**Flujo:**
```
Supabase
    ↓
Detecta datos nuevos/modificados
    ↓
Compara con SQLite local
    ↓
Descarga nuevos registros
    ↓
Actualiza registros modificados
    ↓
SQLite Local
```

## 🎯 Campos Sincronizados

### Carpetas (folders)
- `id` - Identificador único
- `user_id` - Usuario propietario
- `name` - Nombre de la carpeta
- `color` - Color personalizado
- `created_at` - Fecha de creación
- `updated_at` - Última actualización

### Videos (videos)
- `id` - Identificador único
- `folder_id` - Carpeta asociada
- `title` - Título del video
- `url` - URL del video
- `platform` - Plataforma (YouTube, Instagram, etc.)
- `thumbnail` - Imagen miniatura
- `description` - Descripción
- `saved_at` - Fecha de guardado
- `importance` - Nivel de importancia (1-5) ⭐
- `updated_at` - Última actualización

### Recordatorios (reminders)
- `id` - Identificador único
- `video_id` - Video asociado
- `time` - Hora del recordatorio
- `frequency` - Frecuencia (once, daily, weekly, custom)
- `day_of_week` - Día de la semana (si es semanal)
- `interval_days` - Cada X días (si es custom)
- `is_active` - Recordatorio activo/inactivo

## 🚀 Cuándo Se Ejecuta la Sincronización

### Automáticamente:
1. **Al iniciar sesión** (en LoginScreen)
2. **Al restaurar sesión** (App.js)
3. **Después de crear/editar/eliminar datos** (cuando sea importante)

### Manualmente:
```javascript
// En cualquier parte de la app
import { DatabaseService } from '../database/db';

const userId = currentUser.id;
await DatabaseService.syncBidirectional(userId);
```

## 📋 Logging y Debugging

### Mensajes de Log

```
🔄 Iniciando sincronización bidireccional...
📤 Sincronizando cambios locales a Supabase...
✓ Carpeta creada: Mi Carpeta
✓ Video actualizado: Mi Video
📤 Local → Supabase: 1 carpetas, 2 videos, 3 recordatorios
📥 Sincronizando cambios de Supabase a local...
✓ Carpeta descargada: Carpeta Remota
📥 Supabase → Local: 1 carpetas, 1 videos, 0 recordatorios
✅ Sincronización completada en 1234ms
```

### Para debugging:
```javascript
// Activar logs en console durante desarrollo
// Los logs incluyen:
// - Qué se creó/actualizó
// - Qué se descargó/modificó
// - Tiempo total de sincronización
// - Errores específicos (si los hay)
```

## ⚠️ Manejo de Conflictos

### Estrategia de Conflictos

Cuando hay un conflicto (datos modificados en ambos lados):

1. **Por defecto:** `Supabase gana` (versión más reciente)
2. **Lógica:** Compara `updated_at` en ambos lados
3. **Resultado:** Se mantiene la versión más nueva

### Ejemplo:

```
Local (video título: "Hola", updated_at: 2026-01-04 10:00)
Supabase (video título: "Hola Mundo", updated_at: 2026-01-04 11:00)
↓
Resultado: "Hola Mundo" (más reciente)
```

## 🔒 Seguridad

### RLS (Row Level Security) en Supabase

Se supone que tienes políticas RLS configuradas:

```sql
-- Los usuarios solo pueden ver/editar sus propios datos
-- Esto debe estar configurado en Supabase
```

Verifica en tu proyecto Supabase:
- Sección "Database" → "Authentication"
- Habilita RLS en las tablas: `folders`, `videos`, `reminders`

## 📈 Rendimiento

### Optimizaciones Implementadas

1. **Detección inteligente de cambios**: Solo sincroniza si algo cambió
2. **Índices en timestamps**: Búsquedas rápidas con `updated_at`
3. **Errores aislados**: Un error no detiene toda la sincronización
4. **Logging granular**: Sabes exactamente qué se sincronizó

### Tiempos Esperados

- **Sincronización pequeña** (10-50 items): 500-1000ms
- **Sincronización media** (50-200 items): 1-3 segundos
- **Sincronización grande** (200+ items): 3-10 segundos

## 🐛 Troubleshooting

### "La sincronización tarda mucho"
→ Verifica tu conexión de internet
→ Reduce la cantidad de recordatorios (muchos queries)

### "Algunos datos no se sincronizan"
→ Revisa los logs en console
→ Verifica las políticas RLS en Supabase
→ Asegúrate de que el usuario está autenticado

### "Conflictos entre dispositivos"
→ La última actualización gana
→ Espera a que se complete una sincronización antes de otra
→ No edites el mismo video en 2 dispositivos simultáneamente

## ✅ Checklist de Implementación

- [x] Campo `importance` sincronizado
- [x] Detección de cambios en sincronización
- [x] Sincronización bidireccional unificada
- [x] Manejo robusto de errores
- [x] Logging detallado
- [x] Índices en Supabase para performance
- [x] Triggers automáticos de `updated_at`
- [ ] Compresión de datos (futuro)
- [ ] Sincronización incremental (futuro)
- [ ] Caché local de sincronización (futuro)

## 📞 Integración en tu Aplicación

### En App.js (iniciar sincronización):
```javascript
useEffect(() => {
  if (user) {
    DatabaseService.syncBidirectional(user.id)
      .catch(err => console.error('Sync error:', err));
  }
}, [user]);
```

### En HomeScreen (sincronización periódica):
```javascript
useEffect(() => {
  const syncInterval = setInterval(() => {
    if (user) {
      DatabaseService.syncBidirectional(user.id);
    }
  }, 60000); // Cada 1 minuto

  return () => clearInterval(syncInterval);
}, [user]);
```

---

**Última actualización:** 4 de enero de 2026
**Versión:** 2.0 (Mejorada)
