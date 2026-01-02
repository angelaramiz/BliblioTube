# 🚀 Guía Rápida - BiblioTube

## ⚡ 5 Minutos para Empezar

### Paso 1: Instalación (2 min)
```bash
cd BiblioTube
npm install
```

### Paso 2: Configurar Supabase (2 min)
1. Ve a [supabase.com](https://supabase.com)
2. Copia tu **Project URL** y **Anon Key**
3. Edita `src/config/supabase.js`:
```javascript
const SUPABASE_URL = 'tu-url-aqui';
const SUPABASE_ANON_KEY = 'tu-clave-aqui';
```

### Paso 3: Crear Tablas (1 min)
Ve a SQL Editor en Supabase y copia el contenido de `SUPABASE_SETUP.md`

---

## 🎯 Primer Uso

1. **Ejecutar App**
   ```bash
   npm start
   ```

2. **Abrir en Expo Go** (tu celular)
   - Descarga Expo Go
   - Escanea el código QR

3. **Crear Cuenta**
   - Email: `test@example.com`
   - Username: `testuser`
   - Contraseña: `password123`

4. **Crear Carpeta**
   - Toca el botón **+** en pantalla principal
   - Pon nombre: "Videos de Prueba"
   - Elige color
   - Toca "Crear Carpeta"

5. **Agregar Video**
   - Abre la carpeta
   - Toca el botón **+**
   - Pega URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Título: "Mi primer video"
   - Toca "Agregar Video"

6. **Agregar Recordatorio**
   - Abre el video
   - Toca "Agregar" en Recordatorios
   - Configura hora y frecuencia
   - Toca "Guardar Recordatorio"

---

## 📁 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `App.js` | Componente principal y navegación |
| `src/screens/*` | Todas las pantallas |
| `src/database/db.js` | Operaciones SQLite |
| `src/database/authService.js` | Autenticación Supabase |
| `src/config/supabase.js` | Credenciales Supabase |

---

## 🔧 Comandos Útiles

```bash
# Iniciar en desarrollo
npm start

# Android
npm run android

# iOS
npm start -i

# Limpiar caché
npx expo start -c

# Instalar paquete nuevo
npm install nombre-paquete
```

---

## ❌ Problemas Comunes

### "Error: Network request failed"
→ Verifica conexión a internet y credenciales de Supabase

### "No se ven los videos"
→ Asegúrate que la BD de SQLite está inicializada

### "Las notificaciones no funcionan"
→ Comprueba permisos en el dispositivo

---

## 🎨 Personalizar Colores

En `App.js` y componentes, cambia:
```javascript
backgroundColor: '#6366f1' // Color principal
```

Colores disponibles:
- `#6366f1` (Indigo) - Por defecto
- `#ec4899` (Rosa)
- `#f59e0b` (Ámbar)
- `#10b981` (Esmeralda)

---

## 📱 Plataformas Soportadas

La app detecta automáticamente:
- YouTube.com / youtu.be
- instagram.com
- tiktok.com
- facebook.com
- twitter.com / x.com
- vimeo.com
- twitch.tv

---

## 🔐 Seguridad

✅ Hacer:
- Usar credenciales reales de Supabase
- Validar inputs
- Usar HTTPS siempre

❌ No hacer:
- Compartir credenciales en código
- Usar contraseñas débiles
- Desactivar Row Level Security

---

## 📚 Documentación Completa

Para más información, lee:
- `README.md` - Guía completa
- `ARQUITECTURA.md` - Diseño técnico
- `SUPABASE_SETUP.md` - Configuración detallada
- `PROBLEMAS_CONOCIDOS.md` - Solución de problemas

---

## 💡 Tips de Desarrollo

### Debug
```javascript
// En cualquier archivo
console.log('Mi debug:', variableADebugear);
```

### Agregar Paquete
```bash
npm install nombre-paquete
```

### Limpiar BD Local (SQLite)
- Android: Borrar app y reinstalar
- iOS: Borrar en Simulador y reinstalar

---

## 🎯 Próximas Mejoras

Después de probar, puedes:
1. Agregar más plataformas de videos
2. Implementar búsqueda
3. Agregar dark mode
4. Mejorar animaciones

---

## 🆘 Necesitas Ayuda?

1. **Verifica la documentación** (6 archivos .md incluidos)
2. **Revisa logs** (consola de desarrollo)
3. **Consulta PROBLEMAS_CONOCIDOS.md**
4. **Verifica conexión de internet**

---

## ✅ Checklist de Primer Uso

- [ ] Instaladas las dependencias
- [ ] Configuradas credenciales de Supabase
- [ ] Creadas las tablas en Supabase
- [ ] App ejecutándose
- [ ] Cuenta creada
- [ ] Carpeta creada
- [ ] Video agregado
- [ ] Recordatorio configurado
- [ ] Notificación recibida

---

## 🎉 ¡Listo!

Ahora puedes:
- Desarrollar nuevas features
- Personalizar la interfaz
- Agregar más funcionalidades
- Publicar en App Stores

---

**¿Preguntas?** Consulta la documentación completa incluida.

**¡Disfruta desarrollando BiblioTube! 📚🎬**
