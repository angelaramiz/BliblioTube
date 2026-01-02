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

      // Guardar sesión de forma segura
      if (data.session) {
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(data.session));
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
      
      // Limpiar sesión guardada
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
