import React from 'react';

export const DatabaseContext = React.createContext({
  userId: null,
  folders: [],
  reloadFolders: async () => {},
});
