import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { Linking, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import FolderDetailScreen from './src/screens/FolderDetailScreen';
import VideoDetailScreen from './src/screens/VideoDetailScreen';
import QuickSaveScreen from './src/screens/QuickSaveScreen';
import { AuthContext } from './src/context/AuthContext';
import { AuthService } from './src/database/authService';
import { DatabaseService } from './src/database/db';

const Stack = createStackNavigator();

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'BiblioTube' }}
      />
      <Stack.Screen 
        name="FolderDetail" 
        component={FolderDetailScreen}
        options={({ route }) => ({
          title: route.params?.folderName || 'Carpeta',
        })}
      />
      <Stack.Screen 
        name="VideoDetail" 
        component={VideoDetailScreen}
        options={{ title: 'Detalles del Video' }}
      />
    </Stack.Navigator>
  );
}

const SplashScreen = () => null;

// Referencia global para navegación desde deep linking
const navigationRef = React.createRef();

function RootNavigator({ userToken, isLoading, onDeepLink }) {
  useEffect(() => {
    // Escuchar cambios en la URL (deep linking)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link recibido:', url);
      onDeepLink?.(url);
    });

    // Verificar si la app fue abierta con una URL
    Linking.getInitialURL().then((url) => {
      if (url != null) {
        console.log('URL inicial:', url);
        onDeepLink?.(url);
      }
    });

    return () => subscription.remove();
  }, [onDeepLink]);

  return (
    <NavigationContainer ref={navigationRef}>
      {isLoading ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      ) : userToken == null ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'white' },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'BiblioTube' }}
          />
          <Stack.Screen 
            name="FolderDetail" 
            component={FolderDetailScreen}
            options={({ route }) => ({
              title: route.params?.folderName || 'Carpeta',
            })}
          />
          <Stack.Screen 
            name="VideoDetail" 
            component={VideoDetailScreen}
            options={{ title: 'Detalles del Video' }}
          />
          <Stack.Screen 
            name="QuickSave" 
            component={QuickSaveScreen}
            options={{
              title: 'Guardar Video',
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.payload,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
        case 'SIGN_UP':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  const [deepLinkUrl, setDeepLinkUrl] = useState(null);

  // Función para detectar URLs de video en el portapapeles
  const checkClipboardForVideoUrl = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      
      // Detectar si es una URL de video conocida
      const isVideoUrl =
        text.includes('youtube.com') ||
        text.includes('youtu.be') ||
        text.includes('instagram.com') ||
        text.includes('tiktok.com') ||
        text.includes('vm.tiktok.com') ||
        text.includes('vt.tiktok.com') ||
        text.includes('facebook.com');

      if (isVideoUrl && text.startsWith('http')) {
        return text;
      }
    } catch (error) {
      console.log('No se pudo acceder al portapapeles');
    }
    return null;
  };

  // Procesar URL encontrada en portapapeles
  const handleClipboardUrl = (url) => {
    Alert.alert(
      'Video detectado',
      '¿Deseas guardar este video en BiblioTube?',
      [
        {
          text: 'No',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Sí, guardar',
          onPress: () => {
            if (state.userToken) {
              // Si está logueado, ir directamente a QuickSave
              navigationRef.current?.navigate('QuickSave', {
                videoUrl: url,
              });
            } else {
              // Si no está logueado, guardar para después
              setDeepLinkUrl(url);
            }
          },
        },
      ]
    );
  };

  const handleDeepLink = (url) => {
    console.log('Procesando deep link:', url);
    
    // Extraer parámetros de la URL
    // Formato 1: bibliotube://video?url=<VIDEO_URL>
    // Formato 2: URL directa de video (youtube.com, instagram.com, tiktok.com, etc.)
    let videoUrl = null;
    let isExternalShare = false;
    
    if (url.includes('bibliotube://')) {
      // Formato personalizado: bibliotube://video?url=<VIDEO_URL>
      if (url.includes('video')) {
        const urlParams = new URL(url.replace('bibliotube://', 'http://')).searchParams;
        videoUrl = urlParams.get('url');
      }
    } else if (
      url.includes('youtube.com') || 
      url.includes('youtu.be') ||
      url.includes('instagram.com') ||
      url.includes('tiktok.com') ||
      url.includes('vm.tiktok.com') ||
      url.includes('vt.tiktok.com') ||
      url.includes('facebook.com')
    ) {
      // URL directa de video (compartida desde otra app)
      videoUrl = url;
      isExternalShare = true;
    }
    
    if (videoUrl) {
      setDeepLinkUrl(videoUrl);
      console.log('Deep link procesado:', videoUrl);
      
      // Esperar a que navigationRef esté listo
      setTimeout(() => {
        if (navigationRef.current) {
          if (state.userToken) {
            // Si está logueado, ir directamente a QuickSave
            navigationRef.current.navigate('QuickSave', {
              videoUrl: videoUrl,
            });
          } else {
            // Si no está logueado, mostrar alerta
            Alert.alert(
              'Inicia sesión',
              'Necesitas iniciar sesión para guardar videos',
              [
                {
                  text: 'Cancelar',
                  style: 'cancel',
                },
                {
                  text: 'Iniciar sesión',
                  onPress: () => {
                    // El usuario será redirigido automáticamente a Login
                  },
                },
              ]
            );
          }
        }
      }, 500);
    }
  };

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Inicializar base de datos
        await DatabaseService.initializeDatabase();
        
        // Intentar restaurar sesión guardada primero
        let session = await AuthService.getCurrentSession();
        
        if (!session) {
          // Si no hay sesión activa, intentar restaurar la guardada
          const savedSession = await AuthService.restoreSavedSession();
          if (savedSession) {
            session = savedSession;
            console.log('Sesión restaurada del almacenamiento seguro');
          }
        }

        if (session && session.user) {
          dispatch({ type: 'RESTORE_TOKEN', payload: session.user.id });
          
          // Sincronizar datos bidireccionales al restaurar sesión
          try {
            await DatabaseService.syncBidirectional(session.user.id);
            console.log('✅ Sincronización automática completada al iniciar');
          } catch (syncError) {
            console.error('⚠️ Error en sincronización automática:', syncError);
            // No interrumpir el flujo si falla la sincronización
          }
            await DatabaseService.syncSupabaseToLocal(session.user.id);
            console.log('Sincronización completada al restaurar sesión');
          } catch (syncError) {
            console.error('Error en sincronización al restaurar sesión:', syncError);
          }
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: null });
        }

        // Verificar portapapeles después de restaurar sesión
        const clipboardUrl = await checkClipboardForVideoUrl();
        if (clipboardUrl) {
          // Esperar un poco para que la navegación esté lista
          setTimeout(() => {
            handleClipboardUrl(clipboardUrl);
          }, 1000);
        }
      } catch (e) {
        console.error('Error en bootstrap:', e);
        dispatch({ type: 'RESTORE_TOKEN', payload: null });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (email, password) => {
        try {
          const result = await AuthService.signIn(email, password);
          if (result.success && result.user) {
            dispatch({ type: 'SIGN_IN', payload: result.user.id });
            
            // Sincronizar datos después del login
            try {
              await DatabaseService.syncLocalToSupabase(result.user.id);
              await DatabaseService.syncSupabaseToLocal(result.user.id);
              console.log('Sincronización completada después del login');
            } catch (syncError) {
              console.error('Error en sincronización:', syncError);
            }
            
            return { success: true };
          } else {
            return { success: false, error: result.error };
          }
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      signOut: async () => {
        try {
          await AuthService.signOut();
          dispatch({ type: 'SIGN_OUT' });
        } catch (error) {
          console.error('Error en logout:', error);
        }
      },
      signUp: async (email, password, username) => {
        try {
          const result = await AuthService.signUp(email, username, password);
          if (result.success && result.user) {
            dispatch({ type: 'SIGN_UP', payload: result.user.id });
            
            // Sincronizar datos después del registro
            try {
              await DatabaseService.syncLocalToSupabase(result.user.id);
              console.log('Datos locales subidos a Supabase después del registro');
            } catch (syncError) {
              console.error('Error en sincronización después del registro:', syncError);
            }
            
            return { success: true };
          } else {
            return { success: false, error: result.error };
          }
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={{ ...state, ...authContext }}>
      <RootNavigator 
        userToken={state.userToken} 
        isLoading={state.isLoading}
        onDeepLink={handleDeepLink}
      />
      <StatusBar barStyle="light-content" />
    </AuthContext.Provider>
  );
}
