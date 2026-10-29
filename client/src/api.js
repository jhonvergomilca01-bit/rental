// const call = async (url, method = 'GET', body) => {
//   const res = await fetch('/api' + url, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.message || 'Request failed');
//   return data;
// };
// export const api = { get: u => call(u), post: (u, b) => call(u, 'POST', b), put: (u, b) => call(u, 'PUT', b), del: u => call(u, 'DELETE') };
const call = async (url, method = 'GET', body) => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json();
  if (res.status === 401 && !url.startsWith('/auth')) { localStorage.clear(); location.href = '/login'; }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};
export const api = { get: u => call(u), post: (u, b) => call(u, 'POST', b), put: (u, b) => call(u, 'PUT', b), del: u => call(u, 'DELETE') };