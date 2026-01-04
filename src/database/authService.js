import { supabase } from '../config/supabase';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const SESSION_KEY = 'bibliotube_session';

export class AuthService {
  static async signUp(email, username, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Guardar sesión de forma segura (incluyendo email)
      if (data.session) {
        const sessionData = {
          ...data.session,
          email: email, // Guardar email para biometric login
        };
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionData));
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // NO eliminar la sesión guardada para permitir login rápido con biometría después
      // La sesión se elimina solo cuando se hace logout total o cambio de usuario
      // await SecureStore.deleteItemAsync(SESSION_KEY);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Logout total - elimina la sesión guardada
  static async signOutCompletely() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpiar sesión guardada completamente
      await SecureStore.deleteItemAsync(SESSION_KEY);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async getCurrentSession() {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      return null;
    }
  }

  static async getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  // Restaurar sesión guardada
  static async restoreSavedSession() {
    try {
      const savedSession = await SecureStore.getItemAsync(SESSION_KEY);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        return session;
      }
      return null;
    } catch (error) {
      console.error('Error restaurando sesión guardada:', error);
      return null;
    }
  }

  // Restaurar sesión para biometric login
  static async restoreSessionWithToken() {
    try {
      // Primero, intentar obtener la sesión activa actual de Supabase
      const { data } = await supabase.auth.getSession();
      if (data.session && data.session.user) {
        return {
          success: true,
          user: data.session.user,
          session: data.session,
        };
      }

      // Si no hay sesión activa, intentar restaurar desde el guardado
      const savedSession = await SecureStore.getItemAsync(SESSION_KEY);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        // Solo retornar los datos guardados, sin intentar setSession
        // El usuario ya debe estar autenticado en Supabase
        return {
          success: true,
          user: { email: session.email, id: session.user?.id },
          session: session,
        };
      }

      return { success: false, error: 'No hay sesión guardada' };
    } catch (error) {
      console.error('Error restaurando sesión:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar disponibilidad de biometría
  static async isBiometricAvailable() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return false;

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.error('Error verificando biometría:', error);
      return false;
    }
  }

  // Autenticar con biometría
  static async authenticateWithBiometric() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Usa biometría para acceder a tu cuenta',
      });

      return result.success;
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
      return false;
    }
  }
}
