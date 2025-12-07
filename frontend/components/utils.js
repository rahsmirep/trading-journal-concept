// Remove per-trade delete

// Delete all trades for the current user
export async function deleteAllTrades() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE, {
    method: 'DELETE',
    headers,
  });
  return res.ok;
}
const API_BASE = (location.protocol === 'file:') ? 'http://localhost:3000/api/trades' : '/api/trades';

export async function submitTrade(trade) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trade)
  });
  const data = await res.json();
  return data;
}

export async function loadTrades() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE, { headers });
  const trades = await res.json();
  return trades;
}
