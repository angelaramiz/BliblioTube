import React from 'react';

export const AuthContext = React.createContext({
  state: {
    isLoading: true,
    isSignout: false,
    userToken: null,
  },
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});
