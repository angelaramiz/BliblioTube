# Problemas Conocidos y Soluciones

## 📱 Problemas Comunes

### 1. Las notificaciones no funcionan en Android
**Síntoma**: Las notificaciones programadas no se reciben
**Solución**:
- Asegúrate que la app tiene permisos de notificación
- En Android 12+, verifica los permisos en Configuración
- En emulador, asegúrate que la versión sea reciente

### 2. La app se bloquea al iniciar sesión
**Síntoma**: Crash después de ingresar credenciales
**Solución**:
- Verifica que las credenciales de Supabase sean correctas
- Comprueba la conexión de internet
- Revisa la consola para mensajes de error específicos

### 3. Los videos no se guardan
**Síntoma**: Los videos desaparecen al cerrar la app
**Solución**:
- Verifica que la base de datos SQLite se inicializa correctamente
- Comprueba permisos de archivo en el dispositivo
- Revisa los logs de SQLite

### 4. Las imágenes de miniatura no se cargan
**Síntoma**: Las tarjetas de video muestran placeholders
**Solución**:
- Verifica que la URL es válida
- Para YouTube, la extracción de miniatura debe ser correcta
- Comprueba conexión de internet para descargar imágenes

### 5. Error de permisos en Supabase
**Síntoma**: "Permission denied" al guardar datos
**Solución**:
- Verifica que las políticas RLS estén correctamente configuradas
- Asegúrate que `user_id` coincida con el usuario autenticado
- Comprueba que el `auth.uid()` se está pasando correctamente

## 🔧 Pasos para Debugging

### 1. Revisar Logs
```javascript
// Agregar al inicio de db.js
console.log('Intentando conectar a SQLite...');
// ... rest del código
```

### 2. Usar React DevTools
```bash
npm install -g react-devtools
react-devtools
```

### 3. Ver Logs de Supabase
- Dashboard → Logs → API
- Busca la solicitud problemática

### 4. Test en Dispositivo Real
Los emuladores pueden no reflejar exactamente el comportamiento real

## 📝 Cambios Futuros Recomendados

### Mejoras de Rendimiento:
- Implementar paginación en listas de videos
- Cache de imágenes con `react-native-cached-image`
- Lazy loading de componentes

### Mejoras de Funcionalidad:
- Sincronización automática con Supabase
- Búsqueda global de videos
- Exportar/importar bibliotecas
- Dark mode

### Mejoras de UX:
- Drag and drop para reorganizar
- Atajos de teclado
- Animaciones suaves
- Interfaz más intuitiva

## ✅ Checklist de Deployment

Antes de publicar en App Store/Play Store:

- [ ] Configurar variables de entorno de producción
- [ ] Probar en dispositivo real
- [ ] Configurar icono de app
- [ ] Configurar splash screen
- [ ] Probar flujo completo de autenticación
- [ ] Probar notificaciones
- [ ] Verificar permisos necesarios
- [ ] Optimizar imágenes
- [ ] Probar offline mode
- [ ] Obtener certificados/permisos necesarios
- [ ] Revisar política de privacidad
- [ ] Preparar screenshots para tienda

## 🆘 Soporte Adicional

Si encuentras problemas no listados aquí:

1. Revisa los mensajes de error en la consola
2. Busca en [Stack Overflow](https://stackoverflow.com) con el tag `react-native`
3. Consulta la documentación de [Expo](https://docs.expo.dev/)
4. Abre un issue en el repositorio del proyecto

---

Last Updated: 2 de enero de 2026
