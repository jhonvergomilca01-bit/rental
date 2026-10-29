import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './auth.jsx';

const Ctx = createContext({ ids: [], toggle: () => {} });
export const useFavorites = () => useContext(Ctx);

export function FavoritesProvider({ children }) {
  const { user } = useAuth(), [ids, setIds] = useState([]);
  useEffect(() => {
    if (user) api.get('/me/favorites').then(l => setIds(l.map(String))).catch(() => {});
    else setIds([]);
  }, [user]);
  const toggle = async id => setIds((await api.post('/me/favorites/' + id)).map(String));
  return <Ctx.Provider value={{ ids, toggle }}>{children}</Ctx.Provider>;
}