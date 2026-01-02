import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { AuthService } from '../database/authService';

export default function LoginScreen({ navigation }) {
  const { signIn } = React.useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await AuthService.isBiometricAvailable();
    setBiometricAvailable(available);
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const authenticated = await AuthService.authenticateWithBiometric();
      if (authenticated) {
        // Restaurar sesión guardada
        const savedSession = await AuthService.restoreSavedSession();
        if (savedSession && savedSession.user) {
          const result = await signIn(null, null);
          if (result.success) {
            Alert.alert('Éxito', '¡Bienvenido de nuevo!');
          } else {
            Alert.alert('Error', 'No se pudo restaurar tu sesión');
          }
        } else {
          Alert.alert('Error', 'No hay sesión guardada');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Error en autenticación biométrica: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);

      if (result.success) {
        Alert.alert('Éxito', '¡Bienvenido a BiblioTube!');
        // La navegación se maneja automáticamente en App.js
      } else {
        Alert.alert('Error de inicio de sesión', result.error || 'Error desconocido');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>📚</Text>
        <Text style={styles.logoText}>BiblioTube</Text>
        <Text style={styles.tagline}>Tu biblioteca de videos</Text>
      </View>

      {/* Email Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            secureTextEntry={!showPassword}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Login Button */}
      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          pressed && styles.loginButtonPressed,
          loading && styles.loginButtonDisabled,
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        )}
      </Pressable>

      {/* Biometric Login Button */}
      {biometricAvailable && (
        <Pressable
          style={({ pressed }) => [
            styles.biometricButton,
            pressed && styles.biometricButtonPressed,
            loading && styles.loginButtonDisabled,
          ]}
          onPress={handleBiometricLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#6366f1" />
          ) : (
            <>
              <Text style={styles.biometricButtonIcon}>👆</Text>
              <Text style={styles.biometricButtonText}>Usa biometría</Text>
            </>
          )}
        </Pressable>
      )}

      {/* Forgot Password */}
      <Pressable style={styles.forgotButton}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </Pressable>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.divider} />
      </View>

      {/* Sign Up Button */}
      <Pressable
        style={({ pressed }) => [
          styles.signUpButton,
          pressed && styles.signUpButtonPressed,
        ]}
        onPress={() => navigation.navigate('Register')}
        disabled={loading}
      >
        <Text style={styles.signUpButtonText}>Crear Nueva Cuenta</Text>
      </Pressable>

      {/* Demo Info */}
      <View style={styles.demoInfo}>
        <Text style={styles.demoText}>
          Para las pruebas, usa Supabase configurado en src/config/supabase.js
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  loginButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonPressed: {
    opacity: 0.9,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  biometricButtonPressed: {
    opacity: 0.9,
  },
  biometricButtonIcon: {
    fontSize: 20,
  },
  biometricButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 12,
  },
  signUpButton: {
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpButtonPressed: {
    backgroundColor: '#f5f5f5',
  },
  signUpButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  demoInfo: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  demoText: {
    fontSize: 12,
    color: '#666',
  },
});
