import { createContext, useContext, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const save = ({ token, user }) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); setUser(user); };
  const login = async (email, password) => save(await api.post('/auth/login', { email, password }));
  const register = async (name, email, password) => save(await api.post('/auth/register', { name, email, password }));
  const logout = () => { localStorage.clear(); setUser(null); };
  return <Ctx.Provider value={{ user, isAdmin: user?.role === 'admin', login, register, logout }}>{children}</Ctx.Provider>;
}