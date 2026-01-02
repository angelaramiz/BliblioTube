# Guía de Configuración de Supabase para BiblioTube

## 1. Crear una Cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub u otra opción
4. Crea una nueva organización
5. Crea un nuevo proyecto

## 2. Configurar Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL**: `https://[proyecto].supabase.co`
   - **anon public**: Tu clave pública anonimizada

3. Edita `src/config/supabase.js`:
```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-clave-anonimizada';
```

## 3. Crear Tablas en la Base de Datos

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Crea una nueva query
3. Copia y ejecuta el siguiente SQL:

```sql
-- Crear tabla de carpetas
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de videos
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  platform TEXT NOT NULL,
  thumbnail TEXT,
  description TEXT,
  saved_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de recordatorios
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  frequency TEXT DEFAULT 'once',
  day_of_week INTEGER,
  interval_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_videos_folder_id ON videos(folder_id);
CREATE INDEX idx_reminders_video_id ON reminders(video_id);
```

## 4. Configurar Autenticación

1. Ve a **Authentication** → **Providers**
2. Habilita los siguientes métodos:
   - **Email** (por defecto está habilitado)
   - **Password** (ajusta los requisitos si es necesario)

3. Ve a **URL Configuration**
4. Configura las **Redirect URLs**:
   - Para desarrollo local: `http://localhost:8081/*`
   - Para tu app: `[tu-app-scheme]://*`

## 5. Configurar Row Level Security (RLS)

La seguridad es importante. Configura RLS para cada tabla:

### Para la tabla `folders`:
```sql
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean solo sus carpetas
CREATE POLICY "Users can view their own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

-- Política para que los usuarios inserten sus propias carpetas
CREATE POLICY "Users can create their own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios actualicen sus propias carpetas
CREATE POLICY "Users can update their own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para que los usuarios eliminen sus propias carpetas
CREATE POLICY "Users can delete their own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);
```

### Para la tabla `videos`:
```sql
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Política para videos (a través de carpetas del usuario)
CREATE POLICY "Users can view their own videos"
  ON videos FOR SELECT
  USING (
    folder_id IN (
      SELECT id FROM folders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create videos in their folders"
  ON videos FOR INSERT
  WITH CHECK (
    folder_id IN (
      SELECT id FROM folders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE
  USING (
    folder_id IN (
      SELECT id FROM folders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE
  USING (
    folder_id IN (
      SELECT id FROM folders WHERE user_id = auth.uid()
    )
  );
```

### Para la tabla `reminders`:
```sql
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Política para recordatorios (a través de videos del usuario)
CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  USING (
    video_id IN (
      SELECT id FROM videos 
      WHERE folder_id IN (
        SELECT id FROM folders WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create reminders for their videos"
  ON reminders FOR INSERT
  WITH CHECK (
    video_id IN (
      SELECT id FROM videos 
      WHERE folder_id IN (
        SELECT id FROM folders WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  USING (
    video_id IN (
      SELECT id FROM videos 
      WHERE folder_id IN (
        SELECT id FROM folders WHERE user_id = auth.uid()
      )
    )
  );
```

## 6. Sincronizar Datos con SQLite Local

BiblioTube funciona con:
- **SQLite Local**: Para almacenamiento rápido y offline
- **Supabase**: Para autenticación y backup en la nube

La sincronización ocurre:
- **Autenticación**: Siempre desde Supabase
- **Datos locales**: Se guardan primero en SQLite, se pueden sincronizar con Supabase después

## 7. Pruebas

### Crear un usuario de prueba:
1. Ve a **Authentication** → **Users**
2. Haz clic en "Add user"
3. Ingresa email y contraseña
4. Crea el usuario

### Probar la app:
1. Inicia sesión con el usuario de prueba
2. Crea carpetas y agrega videos
3. Verifica que los datos aparecen en la tabla `folders` de Supabase

## 8. Consideraciones de Seguridad

✅ Recomendaciones:
- Nunca expongas tu clave privada (service role key) en la app
- Usa solo la clave anonimizada (anon public key)
- Mantén RLS habilitado en todas las tablas
- Regularmente revisa los logs de autenticación

⚠️ Cosas a evitar:
- No almacenes contraseñas en localStorage sin hash
- No expongas IDs sensibles en URLs
- No confíes completamente en validaciones del cliente

## 9. Soporte y Documentación

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guía de autenticación](https://supabase.com/docs/guides/auth)
- [Guía de base de datos](https://supabase.com/docs/guides/database)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)

## 10. Troubleshooting

### Error: "Could not verify JWT"
- Verifica que tu clave anonimizada sea correcta
- Comprueba que las políticas RLS permitan las operaciones

### Error: "Permission denied"
- Asegúrate que el `user_id` coincida con `auth.uid()`
- Revisa las políticas RLS de la tabla

### Datos no se sincronizan
- Verifica la conexión de internet
- Comprueba los logs de Supabase en "Logs" → "API"

---

¡Listo! Tu Supabase está configurado para BiblioTube 🚀
