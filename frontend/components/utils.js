export async function submitTrade(trade) {
  const res = await fetch('http://localhost:3000/api/trades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trade)
  });
  const data = await res.json();
  return data.message;
}

export async function loadTrades() {
  const res = await fetch('http://localhost:3000/api/trades');
  const trades = await res.json();
  return trades;
}

// utils.js
export async function submitTrade(trade) {
  const res = await fetch('http://localhost:3000/api/trades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trade)
  });
  const data = await res.json();
  return data.message;
}

export async function loadTrades() {
  const res = await fetch('http://localhost:3000/api/trades');
  const trades = await res.json();
  return trades;
}
