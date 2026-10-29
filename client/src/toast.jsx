import { createContext, useContext, useState } from 'react';

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = (msg, type = 'ok') => {
    const id = Date.now() + Math.random();
    setItems(l => [...l, { id, msg, type }]);
    setTimeout(() => setItems(l => l.filter(t => t.id !== id)), 3000);
  };
  return (<Ctx.Provider value={toast}>{children}
    <div className="toasts">{items.map(t => <div key={t.id} className={'toast ' + t.type}>{t.type === 'ok' ? '✅' : '⚠️'} {t.msg}</div>)}</div>
  </Ctx.Provider>);
}