# BiblioTube 📚

Una aplicación móvil para organizar y guardar links de videos de diferentes plataformas (YouTube, Instagram, TikTok, etc.) en una biblioteca personalizada con categorías, recordatorios, filtrado avanzado y sincronización en la nube.

## Características ✨

- **Autenticación**: Registro e inicio de sesión con Supabase + autenticación biométrica
- **Carpetas Organizadas**: Crea carpetas con colores personalizados para categorizar videos
- **Gestión de Videos**: Agrega links de videos con información automática (miniatura, plataforma)
- **Recordatorios**: Configura recordatorios con diferentes frecuencias:
  - Una sola vez
  - Diariamente
  - Semanalmente (especifica día)
  - Cada X días
- **Filtrado Avanzado** 🆕:
  - Filtrar por plataforma (YouTube, Instagram, TikTok, Facebook, etc.)
  - Ordenar por fecha (más reciente o más antiguo)
  - Filtrar por nivel de importancia (1-5 estrellas) ⭐
  - Filtros composables (aplicar múltiples a la vez)
- **Nivel de Importancia**: Asigna importancia (1-5 estrellas) a cada video
- **Múltiples Plataformas**: Soporta YouTube, Instagram, TikTok, Facebook, Twitter, Vimeo, Twitch
- **Deep Linking**: Comparte videos desde otras apps directamente a BiblioTube
- **Share Sheet**: Integración nativa con el sistema de compartir de Android/iOS
- **Almacenamiento Local**: SQLite para datos locales
- **Backend en Nube**: Supabase para autenticación y sincronización
- **Session Persistence**: Tu sesión se mantiene después de cerrar la app
- **Clipboard Detection**: Detecta automáticamente URLs de videos en el portapapeles

## Estructura del Proyecto

```
BiblioTube/
├── src/
│   ├── components/
│   │   ├── FolderCard.js          # Card de carpeta
│   │   ├── VideoCard.js           # Card de video
│   │   ├── ReminderModal.js       # Modal para recordatorios
│   │   └── FilterModal.js         # Modal de filtrado (NUEVO)
│   ├── context/
│   │   ├── AuthContext.js         # Contexto de autenticación
│   │   └── DatabaseContext.js     # Contexto de base de datos
│   ├── database/
│   │   ├── db.js                  # Servicio SQLite
│   │   └── authService.js         # Servicio Supabase
│   ├── hooks/
│   │   ├── useAuth.js             # Hook de autenticación
│   │   └── useDatabase.js         # Hook de base de datos
│   ├── models/
│   │   ├── User.js                # Modelo de usuario
│   │   ├── Folder.js              # Modelo de carpeta
│   │   ├── Video.js               # Modelo de video
│   │   └── Reminder.js            # Modelo de recordatorio
│   ├── screens/
│   │   ├── LoginScreen.js         # Pantalla de inicio de sesión
│   │   ├── RegisterScreen.js      # Pantalla de registro
│   │   ├── HomeScreen.js          # Pantalla principal (carpetas)
│   │   ├── FolderDetailScreen.js  # Pantalla de videos en carpeta
│   │   ├── VideoDetailScreen.js   # Pantalla de detalles del video
│   │   └── QuickSaveScreen.js     # Pantalla de guardado rápido
│   ├── config/
│   │   └── supabase.js            # Configuración de Supabase
│   └── utils/
│       ├── notificationService.js # Servicio de notificaciones
│       ├── videoMetadataExtractor.js # Extracción de metadatos
│       └── dateFormat.js          # Utilidades de fecha
├── App.js                         # Componente principal
├── app.json                       # Configuración Expo
├── package.json                   # Dependencias
└── README.md                      # Este archivo
```

## Instalación 🚀

### Requisitos Previos
- Node.js (v16 o superior)
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Una cuenta en Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   cd BiblioTube
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Crear un proyecto en [Supabase](https://supabase.com)
   - Copiar las credenciales (URL y Anon Key)
   - Editar `src/config/supabase.js`:
   ```javascript
   const SUPABASE_URL = 'tu_url_supabase';
   const SUPABASE_ANON_KEY = 'tu_anon_key';
   ```

4. **Crear tablas en Supabase**
   - Ejecutar el SQL en tu dashboard de Supabase:
   ```sql
   -- Tabla de usuarios (se crea automáticamente con auth)
   
   -- Tabla de carpetas
   CREATE TABLE folders (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     color TEXT DEFAULT '#6366f1',
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Tabla de videos
   CREATE TABLE videos (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     url TEXT NOT NULL,
     platform TEXT NOT NULL,
     thumbnail TEXT,
     description TEXT,
     saved_date TIMESTAMP DEFAULT NOW()
   );
   
   -- Tabla de recordatorios
   CREATE TABLE reminders (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
     time TEXT NOT NULL,
     frequency TEXT DEFAULT 'once',
     day_of_week INTEGER,
     interval_days INTEGER,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Ejecutar la aplicación**
   ```bash
   # Para Expo Go
   npm start

   # Para Android
   npm run android

   # Para iOS
   npm run ios

   # Para Web
   npm run web
   ```

## Uso 📱

### Inicio de Sesión
1. Abre la aplicación
2. Ingresa tu email y contraseña
3. Si es la primera vez, regístrate creando una nueva cuenta

### Crear Carpetas
1. En la pantalla principal, toca el botón **+**
2. Ingresa un nombre para la carpeta
3. Selecciona un color
4. Toca "Crear Carpeta"

### Agregar Videos
1. Abre una carpeta
2. Toca el botón **+**
3. Pega la URL del video (YouTube, Instagram, TikTok, etc.)
4. Ingresa un título y descripción opcional
5. Toca "Agregar Video"

### Configurar Recordatorios
1. Abre un video
2. Toca el botón **+ Agregar** en la sección Recordatorios
3. Configura:
   - **Hora**: A qué hora deseas el recordatorio
   - **Frecuencia**: Una sola vez, diaria, semanal o cada X días
   - **Día/Intervalo**: Según la frecuencia seleccionada
4. Toca "Guardar Recordatorio"

## Tecnologías 🛠️

- **React Native**: Framework para aplicaciones móviles
- **Expo**: Plataforma para desarrollo React Native
- **Supabase**: Backend y autenticación
- **SQLite**: Base de datos local (expo-sqlite)
- **React Navigation**: Navegación entre pantallas
- **Expo Notifications**: Notificaciones del sistema

## Dependencias Principales

```json
{
  "@react-navigation/native": "^7.1.26",
  "@react-navigation/stack": "^7.6.13",
  "@supabase/supabase-js": "^2.38.4",
  "expo": "~54.0.30",
  "expo-notifications": "^0.32.15",
  "expo-sqlite": "^16.0.10",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "uuid": "^9.0.1"
}
```

## Próximas Características 🚧

- [ ] Sincronización automática con Supabase
- [ ] Búsqueda y filtrado avanzado de videos
- [ ] Listas de reproducción
- [ ] Compartir carpetas con otros usuarios
- [ ] Descarga de metadatos mejorada para más plataformas
- [ ] Modo oscuro
- [ ] Estadísticas de visualización
- [ ] Integración con reproducción nativa de videos

## Troubleshooting 🔧

### El app no inicia
- Asegúrate de que todas las dependencias están instaladas: `npm install`
- Limpia la caché: `npx expo start -c`

### Notificaciones no funcionan
- En Android: Asegúrate de tener permisos de notificación
- En iOS: Necesitas probar en dispositivo físico

### Problemas con Supabase
- Verifica que las credenciales sean correctas en `src/config/supabase.js`
- Asegúrate que las tablas estén creadas correctamente
- Revisa los permisos RLS (Row Level Security) en Supabase

## Contribuir 🤝

Si encuentras bugs o tienes sugerencias, por favor abre un issue o crea un pull request.

## Licencia 📄

Este proyecto está bajo licencia MIT.

## Autor 👨‍💻

BiblioTube - Tu biblioteca personal de videos

---

¡Disfruta organizando tu biblioteca de videos! 🎬📚
