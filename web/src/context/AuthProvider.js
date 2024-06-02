// src/context/AuthProvider.js

import { createContext, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    return token && userId ? { token, user: { id: userId } } : {};
  });

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
