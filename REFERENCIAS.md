# 📚 Referencias y Recursos - BiblioTube

## 📖 Documentación Oficial

### React Native
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Native API Reference](https://reactnative.dev/docs/view)
- [React Native Community](https://react-native.community/)

### Expo
- [Expo Documentation](https://docs.expo.dev/)
- [Expo SDK Reference](https://docs.expo.dev/versions/latest/)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/)

### React
- [React Documentation](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)
- [Context API](https://react.dev/reference/react/useContext)

---

## 🔗 Navegación

### React Navigation
- [Getting Started](https://reactnavigation.org/docs/getting-started/)
- [Stack Navigator](https://reactnavigation.org/docs/stack-navigator/)
- [Navigation Prop](https://reactnavigation.org/docs/navigation-prop/)

---

## 💾 Bases de Datos

### SQLite
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQLite Docs](https://www.sqlite.org/docs.html)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 🔔 Notificaciones

### Expo Notifications
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Scheduling Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/#notification-scheduling)
- [Handling Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/#handling-notifications)

---

## 🎨 UI/UX

### React Native Components
- [View](https://reactnative.dev/docs/view)
- [Text](https://reactnative.dev/docs/text)
- [StyleSheet](https://reactnative.dev/docs/stylesheet)
- [Pressable](https://reactnative.dev/docs/pressable)
- [Modal](https://reactnative.dev/docs/modal)
- [FlatList](https://reactnative.dev/docs/flatlist)
- [TextInput](https://reactnative.dev/docs/textinput)
- [Image](https://reactnative.dev/docs/image)

---

## 📦 Paquetes Utilizados

### Dependencias Principales
```
@react-navigation/native@^7.1.26
@react-navigation/stack@^7.6.13
@supabase/supabase-js@^2.38.4
expo@~54.0.30
expo-notifications@^0.32.15
expo-sqlite@^16.0.10
react@19.1.0
react-native@0.81.5
uuid@^9.0.1
```

---

## 🧩 Patrones de Código

### Context API
```javascript
// Crear contexto
const MyContext = React.createContext();

// Provider
<MyContext.Provider value={data}>
  <Children />
</MyContext.Provider>

// Usar
const data = useContext(MyContext);
```

### Custom Hooks
```javascript
export const useCustom = () => {
  const context = useContext(MyContext);
  return context;
};
```

### CRUD en SQLite
```javascript
// Create
await db.runAsync('INSERT INTO table ...', [values]);

// Read
const result = await db.getAllAsync('SELECT ...');

// Update
await db.runAsync('UPDATE table ...', [values]);

// Delete
await db.runAsync('DELETE FROM table ...');
```

---

## 🔐 Seguridad

### Autenticación
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Almacenamiento Seguro
- [React Native Secure Storage](https://github.com/react-native-async-storage/async-storage)

---

## 🚀 Deployment

### EAS Build
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store](https://docs.expo.dev/build/setup/)
- [Google Play](https://docs.expo.dev/build-reference/android-builds/)

### Testing
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)

---

## 📱 Plataformas

### Extracción de Metadatos
- [YouTube API](https://developers.google.com/youtube/v3)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-graph-api)
- [TikTok API](https://developers.tiktok.com/)

---

## 💬 Comunidades

- [React Native Forum](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [React Community Discord](https://www.reactiflux.com/)
- [Expo Community Slack](https://www.expo.dev/slack)

---

## 📺 Tutoriales Recomendados

### YouTube
- [React Native Tutorial Series](https://www.youtube.com/@ReactNativeSchool)
- [Expo Getting Started](https://www.youtube.com/watch?v=ulRSH8OsgkE)
- [SQLite with React Native](https://www.youtube.com/watch?v=nUYy7TrNujo)

---

## 🛠️ Herramientas Útiles

### Desarrollo
- [Visual Studio Code](https://code.visualstudio.com/)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

### Testing
- [Expo DevTools](https://github.com/expo/expo-cli)
- [Android Studio Emulator](https://developer.android.com/studio/run/emulator)
- [Xcode Simulator](https://developer.apple.com/xcode/)

### APIs
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)

---

## 📊 Recursos de Diseño

### Herramientas
- [Figma](https://www.figma.com/)
- [Adobe XD](https://www.adobe.com/products/xd.html)

### Inspiración
- [Dribbble](https://dribbble.com/)
- [Behance](https://www.behance.net/)

---

## 🎓 Cursos Recomendados

### Plataformas
- [Udemy React Native](https://www.udemy.com/topic/react-native/)
- [Coursera React Native](https://www.coursera.org/learn/react-native)
- [YouTube Tutorials](https://www.youtube.com/results?search_query=react+native+tutorial)

---

## 📰 Artículos Útiles

### Performance
- [React Native Performance Tips](https://reactnative.dev/docs/performance)
- [Optimizing Bundle Size](https://www.smashingmagazine.com/2021/04/react-native-bundle-size/)

### Best Practices
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [Architecture Pattern](https://reactnative.dev/docs/testing-overview)

---

## 🔄 Actualizaciones

### Seguir Cambios
- [React Native Changelog](https://github.com/facebook/react-native/blob/main/CHANGELOG.md)
- [Expo Blog](https://blog.expo.dev/)
- [Supabase Updates](https://supabase.com/blog)

---

## 💡 Tips y Tricks

### Debug
- Usa `console.log()` frecuentemente
- Aprende a usar React DevTools
- Usa las herramientas de desarrollo de Expo

### Performance
- Usa `React.memo()` para componentes
- Implementa `useMemo()` y `useCallback()`
- Optimiza renders con `shouldComponentUpdate()`

### Código Limpio
- Sigue las convenciones de nombres
- Escribe comentarios en código complejo
- Refactoriza regularmente

---

## 🤝 Contribuir

### Open Source
- [React Native Contributing](https://reactnative.dev/docs/contributing)
- [Expo Contributing](https://github.com/expo/expo/blob/main/CONTRIBUTING.md)

---

## 📞 Contacto y Soporte

### Oficiales
- [Expo Support](https://expo.dev/support)
- [Supabase Support](https://supabase.com/support)
- [React Native Docs](https://reactnative.dev/)

### Comunidad
- Stack Overflow (tag: react-native)
- GitHub Issues
- Reddit r/reactnative

---

## 🎯 Roadmap de Aprendizaje

1. **Fundamentos** → React Native basics
2. **Navegación** → React Navigation
3. **Estado** → Context API, Hooks
4. **API** → Fetch, Supabase
5. **Base de Datos** → SQLite, Real-time
6. **Notificaciones** → Expo Notifications
7. **Deployment** → EAS Build

---

## 📝 Notas de Versión

- React Native: 0.81.5
- Expo: 54.0.30
- React: 19.1.0
- Supabase SDK: 2.38.4

---

**Última Actualización**: 2 de enero de 2026

*Estos son recursos recomendados para mejorar tu desarrollo en BiblioTube y React Native en general.*
