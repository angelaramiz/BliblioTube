# Arquitectura de BiblioTube

## Diagrama General de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│                      BIBLIOTUBE APP                          │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
           ┌────▼────┐   ┌────▼────┐   ┌──▼──────┐
           │ Auth    │   │ Database │   │ Storage │
           │ Layer   │   │ Layer    │   │ Layer   │
           └────┬────┘   └────┬────┘   └──┬──────┘
                │             │             │
         ┌──────▼──────┐  ┌───▼────┐  ┌───▼─────┐
         │  Supabase   │  │ SQLite │  │ Device  │
         │   (Auth &   │  │ Local  │  │ Storage │
         │   Backend)  │  │ Cache  │  │ (Imgs)  │
         └─────────────┘  └────────┘  └─────────┘
```

## Estructura de Carpetas Detallada

```
BiblioTube/
│
├── src/
│   ├── components/                    # Componentes reutilizables
│   │   ├── FolderCard.js             # Tarjeta de carpeta
│   │   ├── VideoCard.js              # Tarjeta de video
│   │   └── ReminderModal.js          # Modal de recordatorios
│   │
│   ├── context/                      # Context API para estado global
│   │   ├── AuthContext.js            # Estado de autenticación
│   │   └── DatabaseContext.js        # Estado de base de datos
│   │
│   ├── database/                     # Capas de acceso a datos
│   │   ├── db.js                     # Servicio SQLite (CRUD local)
│   │   └── authService.js            # Servicio Supabase Auth
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── useAuth.js                # Hook para autenticación
│   │   └── useDatabase.js            # Hook para BD
│   │
│   ├── models/                       # Definición de entidades
│   │   ├── User.js                   # Modelo de usuario
│   │   ├── Folder.js                 # Modelo de carpeta
│   │   ├── Video.js                  # Modelo de video
│   │   └── Reminder.js               # Modelo de recordatorio
│   │
│   ├── screens/                      # Pantallas principales
│   │   ├── LoginScreen.js            # Login
│   │   ├── RegisterScreen.js         # Registro
│   │   ├── HomeScreen.js             # Lista de carpetas
│   │   ├── FolderDetailScreen.js     # Videos en carpeta
│   │   └── VideoDetailScreen.js      # Detalles del video
│   │
│   ├── config/                       # Configuración
│   │   └── supabase.js               # Credenciales Supabase
│   │
│   └── utils/                        # Funciones auxiliares
│       ├── notificationService.js    # Servicio de notificaciones
│       ├── setupNotifications.js     # Setup de notificaciones
│       ├── videoMetadataExtractor.js # Extracción de metadatos
│       └── dateFormat.js             # Formateo de fechas
│
├── App.js                            # Componente raíz
├── index.js                          # Punto de entrada
├── app.json                          # Configuración Expo
├── package.json                      # Dependencias
├── eas.json                          # Configuración EAS
├── .gitignore                        # Archivos ignorados
├── .env.example                      # Ejemplo de variables
│
└── Documentación/
    ├── README.md                     # Guía principal
    ├── SUPABASE_SETUP.md             # Configuración Supabase
    ├── PROBLEMAS_CONOCIDOS.md        # Troubleshooting
    └── ARQUITECTURA.md               # Este archivo
```

## Flujo de Datos

### 1. Autenticación

```
Usuario
   │
   ├─► LoginScreen
   │     │
   │     ├─► AuthService.signIn()
   │     │     │
   │     ├────► Supabase Auth
   │     │     │
   │     └────► Session Token
   │
   └─► App.js (navega a HomeScreen)
```

### 2. Creación de Carpeta

```
HomeScreen (FAB +)
   │
   ├─► Modal de creación
   │     │
   │     ├─► Nombre & Color
   │     │
   │     ├─► DatabaseService.createFolder()
   │     │     │
   │     └────► SQLite INSERT
   │
   └─► loadFolders() → Refresh UI
```

### 3. Agregar Video a Carpeta

```
FolderDetailScreen (FAB +)
   │
   ├─► Modal agregar video
   │     │
   │     ├─► URL, Título, Descripción
   │     │
   │     ├─► VideoMetadataExtractor
   │     │     │
   │     │     ├─► Detectar plataforma
   │     │     │
   │     │     └─► Extraer miniatura (si YouTube)
   │     │
   │     ├─► DatabaseService.createVideo()
   │     │     │
   │     └────► SQLite INSERT
   │
   └─► loadVideos() → Refresh UI
```

### 4. Configurar Recordatorio

```
VideoDetailScreen
   │
   ├─► ReminderModal
   │     │
   │     ├─► Hora, Frecuencia, etc.
   │     │
   │     ├─► DatabaseService.createReminder()
   │     │     │
   │     │     └────► SQLite INSERT
   │     │
   │     ├─► NotificationService.scheduleReminder()
   │     │     │
   │     └────► Expo Notifications API
   │
   └─► En la hora configurada
         │
         ├─► Sistema dispara notificación
         │
         └─► Usuario ve recordatorio
```

## Patrones de Arquitectura

### 1. Clean Architecture
- **Screens**: Componentes de interfaz
- **Components**: Widgets reutilizables
- **Services**: Lógica de negocio (Database, Auth)
- **Models**: Entidades de datos
- **Utils**: Funciones auxiliares

### 2. Separación de Responsabilidades

```
┌─────────────────────────────────────┐
│ UI Layer (Screens, Components)      │
├─────────────────────────────────────┤
│ Logic Layer (Hooks, Context)        │
├─────────────────────────────────────┤
│ Data Layer (Services, Models)       │
├─────────────────────────────────────┤
│ External (Supabase, SQLite)         │
└─────────────────────────────────────┘
```

### 3. State Management

```
App.js (AuthContext)
  │
  └─► useAuth() hook
        │
        ├─► signIn()
        ├─► signOut()
        └─► signUp()

HomeScreen (Local State)
  │
  ├─► folders (useState)
  ├─► loading (useState)
  └─► modalVisible (useState)
```

## Flujo de Notificaciones

```
┌─────────────────────────────────────────────────────┐
│          SISTEMA DE NOTIFICACIONES                   │
└─────────────────────────────────────────────────────┘

User configura Reminder
        ↓
DatabaseService.createReminder()  (SQLite)
        ↓
NotificationService.scheduleReminder()
        ↓
┌───────────────────────────────────────────┐
│     Expo Notifications                    │
│  - Triggers: time, frequency, dayOfWeek  │
│  - Storage: Sistema operativo             │
└───────────────────────────────────────────┘
        ↓
En la hora programada
        ↓
┌───────────────────────────────────────────┐
│    Notificación de Sistema                │
│  - Título: "Recordatorio: [Video]"       │
│  - Body: "Tienes un recordatorio..."     │
│  - Data: {reminderId, videoTitle}        │
└───────────────────────────────────────────┘
```

## Interacción con Bases de Datos

### SQLite (Local)

```javascript
// Operaciones CRUD locales
DatabaseService.createFolder()     // INSERT
DatabaseService.getFoldersByUser() // SELECT
DatabaseService.updateFolder()     // UPDATE
DatabaseService.deleteFolder()     // DELETE
```

### Supabase (Backend)

```javascript
// Autenticación
AuthService.signUp()      // Crear usuario
AuthService.signIn()      // Iniciar sesión
AuthService.signOut()     // Cerrar sesión
AuthService.getCurrentUser() // Obtener usuario actual
```

## Consideraciones de Rendimiento

### 1. Carga de Imágenes
- Miniaturas de YouTube: Se descargan bajo demanda
- Caché: React Native cache automático
- Placeholder: 🎬 mientras carga

### 2. Base de Datos
- Índices en: user_id, folder_id, video_id
- Queries: Siempre con WHERE para limitar
- Batch operations: Para sincronización

### 3. Notificaciones
- Programadas en el sistema operativo
- No requieren que la app esté activa
- Almacenadas en SQLite para persistencia

## Próximas Mejoras Arquitectónicas

### Fase 2: Sincronización
```
┌────────────────────────────────────┐
│ SQLite (Local Cache)               │
└────────────────────────────────────┘
         │
         ├─ Sync cuando hay conexión
         │
┌────────▼────────────────────────────┐
│ Supabase (Cloud Storage)            │
└─────────────────────────────────────┘
```

### Fase 3: Offline First
```
┌──────────────────────────────────────┐
│ Todas las operaciones en SQLite      │
│ Sincronización en background        │
│ Conflicto resolution automático      │
└──────────────────────────────────────┘
```

### Fase 4: Compartición
```
┌──────────────────────────────────────┐
│ Carpetas compartidas                │
│ Permisos granulares                 │
│ Sync en tiempo real (Realtime)      │
└──────────────────────────────────────┘
```

---

**Última actualización**: 2 de enero de 2026
**Versión**: 1.0.0
