import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null,
  );
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : null,
  );
  const login = (user, token) => {
    setUser(user);
    setToken(token); //refresh nhi karte ho
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token); //refresh karte ho
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);