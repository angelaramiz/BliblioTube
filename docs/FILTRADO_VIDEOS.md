# Sistema de Filtrado de Videos 🎬

## Descripción General

Se ha implementado un sistema completo de filtrado de videos que permite a los usuarios organizar y buscar sus videos de múltiples formas. Los filtros son **composables**, lo que significa que se pueden aplicar múltiples filtros simultáneamente.

## Características Principales

### 1. **Filtro por Plataforma**
   - Selecciona uno o múltiples plataformas:
     - YouTube
     - Instagram
     - Instagram Reels
     - TikTok
     - Facebook
   - Permite ver solo videos de las plataformas seleccionadas

### 2. **Ordenamiento por Fecha**
   - **Más Reciente** (por defecto): Ordena de nuevos a antiguos
   - **Más Antiguo**: Ordena de antiguos a nuevos
   - Solo una opción de ordenamiento a la vez

### 3. **Filtro por Nivel de Importancia** ⭐
   - Rango de 1 a 5 estrellas
   - **Configuración**: Mínimo y Máximo
   - Niveles:
     - ⭐ Muy Baja (1)
     - ⭐⭐ Baja (2)
     - ⭐⭐⭐ Media (3) - Por defecto
     - ⭐⭐⭐⭐ Alta (4)
     - ⭐⭐⭐⭐⭐ Muy Alta (5)

## Cómo Usar

### Acceder a Filtros
1. Abre una carpeta de videos
2. Toca el botón de **filtro** (⚙️) en la esquina superior derecha del header
3. Se abrirá el modal de filtros

### Aplicar Filtros
1. En el modal:
   - **Plataforma**: Toca los botones de plataforma (se resaltan al seleccionar)
   - **Fecha**: Elige entre "Más Reciente" o "Más Antiguo"
   - **Importancia**: Ajusta el rango mínimo y máximo con las estrellas
2. Toca **"Aplicar Filtros"** para ver los resultados
3. Toca **"Limpiar Filtros"** para resetear todos los filtros

### Guardar Video con Importancia
Al guardar un video (QuickSave o Modal de Agregar):
1. Selecciona el nivel de importancia (1-5 estrellas)
2. El valor por defecto es 3 (Media)
3. El nivel se guarda automáticamente con el video

## Cambios Técnicos

### Archivos Modificados

#### `src/models/Video.js`
- Agregado campo `importance` (número 1-5, default: 3)
- Actualizado constructor y métodos `fromJSON()`

#### `src/database/db.js`
- Agregado campo `importance` a tabla `videos`
- Nuevo método: `getVideosByFolderWithFilters(folderId, filters)`
- Actualizado `createVideo()` para aceptar parámetro `importance`
- Actualizado `updateVideo()` para poder cambiar importancia

#### `src/screens/FolderDetailScreen.js`
- Importado componente `FilterModal`
- Agregado estado para gestionar filtros activos
- Configurado botón de filtro en header
- Integrada lógica de filtrado en carga de videos

#### `src/screens/QuickSaveScreen.js`
- Agregado selector visual de importancia (estrellas)
- Actualizado `handleSaveVideo()` para incluir importancia
- Agregados estilos para UI de importancia

#### `src/components/FilterModal.js` (Nuevo)
- Componente modal completo para configurar filtros
- UI con secciones para: plataforma, fecha e importancia
- Botones para Aplicar y Limpiar filtros
- Estilos con diseño moderno y responsive

### Base de Datos SQLite
```sql
-- Alteración de tabla videos
ALTER TABLE videos ADD COLUMN importance INTEGER DEFAULT 3;
```

## Ejemplos de Uso

### Ejemplo 1: Solo YouTube recientes
1. Abre filtros
2. Selecciona "YouTube"
3. Elige "Más Reciente"
4. Aplica filtros
→ Verás solo videos de YouTube ordenados de nuevo a antiguo

### Ejemplo 2: Videos importantes
1. Abre filtros
2. Ajusta importancia mínima a 4
3. Aplica filtros
→ Verás solo videos con importancia alta (4-5)

### Ejemplo 3: Filtro combinado
1. Selecciona "Instagram" e "Instagram Reels"
2. Elige "Más Antiguo"
3. Importancia mínima: 2
4. Aplica filtros
→ Videos de Instagram/Reels con importancia ≥ 2, ordenados de antiguo a nuevo

## Rendimiento

- Los filtros se aplican a nivel de **SQLite** para máximo rendimiento
- No se cargan todos los videos primero; se filtra directamente en la base de datos
- Cambios de filtro recargan automáticamente la lista

## Futuras Mejoras

- [ ] Guardar filtros como favoritos
- [ ] Historial de filtros usados
- [ ] Búsqueda de texto en títulos/descripciones
- [ ] Filtro por fecha específica (rango de fechas)
- [ ] Mostrar badge con número de filtros activos
- [ ] Sincronizar preferencias de importancia con Supabase

## Notas

- Todos los videos nuevos comienzan con importancia 3 (Media) por defecto
- Los filtros no se guardan entre sesiones (se resetean al cerrar la carpeta)
- La importancia se puede editar después de guardar el video desde VideoDetailScreen
