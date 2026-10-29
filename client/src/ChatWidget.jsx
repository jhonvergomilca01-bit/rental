import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';

const QUICK = ['What vehicles are available?', 'How do I book a vehicle?', 'What payment methods do you accept?', 'Show my bookings'];

export default function ChatWidget() {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [text, setText] = useState('');
  const [msgs, setMsgs] = useState([]);
  const end = useRef();
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy, open]);

  const send = async t => {
    t = (t ?? text).trim();
    if (!t || busy) return;
    const next = [...msgs, { role: 'user', text: t }];
    setMsgs(next); setText(''); setBusy(true);
    try {
      const { reply } = await api.post('/ai/chat', { messages: next.filter(m => !m.err) });
      setMsgs([...next, { role: 'assistant', text: reply }]);
    } catch (e) {
      setMsgs([...next, { role: 'assistant', text: '⚠️ ' + e.message, err: true }]);
    }
    setBusy(false);
  };

  return (<>
    {open && <div className="chat">
      <div className="chat-head">🤖 Lorence <button onClick={() => setOpen(false)}>✕</button></div>
      <div className="chat-body">
        <div className="msg bot">Hi! 👋I'm Lorence, RentGo's assistant. I can help with vehicles, availability, booking and your reservations.</div>
        {!msgs.length && <div className="quick">{QUICK.map(q => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>}
        {msgs.map((m, i) => <div key={i} className={'msg ' + (m.role === 'user' ? 'me' : 'bot')}>{m.text}</div>)}
        {busy && <div className="msg bot">Typing…</div>}
        <div ref={end} />
      </div>
      <form className="chat-input" onSubmit={e => { e.preventDefault(); send(); }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask a question..." maxLength={500} />
        <button disabled={busy}>Send</button>
      </form>
    </div>}
    <button className="chat-fab" onClick={() => setOpen(!open)}>{open ? '✕' : '💬'}</button>
  </>);
}