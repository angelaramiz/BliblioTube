import { useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase debe ser usado dentro de DatabaseContext.Provider');
  }
  return context;
};
