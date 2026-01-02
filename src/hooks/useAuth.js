import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthService } from '../database/authService';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthContext.Provider');
  }

  return {
    state: context,
    signIn: AuthService.signIn,
    signOut: AuthService.signOut,
    signUp: AuthService.signUp,
  };
};
