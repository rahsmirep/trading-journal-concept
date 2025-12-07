const API_BASE = (location.protocol === 'file:') ? 'http://localhost:3000/api/trades' : '/api/trades';

console.log('[app] module loaded');

import { renderAnalytics } from './components/analytics.js';
import { renderTradeTable } from './components/tradeTable.js';

const els = {
  form: document.getElementById('tradeForm'),
  formStatus: document.getElementById('formStatus'),
  table: document.getElementById('tradeTable'),
  tbody: document.getElementById('tableBody'),
  tradeDate: document.getElementById('tradeDate'),
  tradeTime: document.getElementById('tradeTime'),
};

let allTrades = [];

function authHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function fetchTrades() {
  console.log('[app] fetchTrades() start');
  try {
    const res = await fetch(API_BASE, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allTrades = Array.isArray(data) ? data : (data.trades || []);
    console.log('[app] fetched trades:', allTrades.length);
    renderArchive();
    await renderAnalytics();
  } catch (err) {
    console.error(`Error loading trades: ${err.message}`);
  }
}

function renderArchive() {
  // Use renderTradeTable to show table and clear button
  renderTradeTable();
}

async function submitTrade(e) {
  e.preventDefault();
  els.formStatus.textContent = '';
  console.log('[submitTrade] Form submitted');

  const fd = new FormData(els.form);
  const trade = Object.fromEntries(fd.entries());
  console.log('[submitTrade] Trade object:', trade);

  // Parse numbers
  trade.size = parseFloat(trade.size);
  trade.pnl = parseFloat(trade.pnl);
  // Keep date and time as strings - they'll be sent to backend
  trade.entry_date = trade.tradeDate || null;
  trade.trade_time = trade.tradeTime || null;

  if (!trade.ticker || !Number.isFinite(trade.pnl) || !Number.isFinite(trade.size)) {
    els.formStatus.textContent = 'Please fill all required fields with valid numbers.';
    console.warn('[submitTrade] Invalid input');
    return;
  }

  if (!trade.entry_date) {
    els.formStatus.textContent = 'Please select a trade date.';
    console.warn('[submitTrade] Missing trade date');
    return;
  }

  if (!trade.trade_time) {
    els.formStatus.textContent = 'Please select a trade time.';
    console.warn('[submitTrade] Missing trade time');
    return;
  }

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(trade),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error('[submitTrade] Trade log failed:', errBody.message || `HTTP ${res.status}`);
      els.formStatus.textContent = `Error logging trade: ${errBody.message || `HTTP ${res.status}`}`;
      return;
    }
    els.formStatus.textContent = 'Trade logged successfully.';
    els.form.reset();
    console.log('[submitTrade] Trade logged, refreshing table');
    await fetchTrades();
  } catch (err) {
    els.formStatus.textContent = `Error logging trade: Backend unreachable or network error.`;
    console.error('[submitTrade] Error:', err.message);
  }
}

function bindEvents() {
  if (!els.form) {
    console.error('[boot] tradeForm not found in DOM!');
    return;
  }
  console.log('[boot] Binding submit event to tradeForm');
  els.form.addEventListener('submit', submitTrade);
}


async function boot() {
  console.log('[app] boot start');
  bindEvents();
  await fetchTrades();
  console.log('[app] boot complete');
}

document.addEventListener('DOMContentLoaded', boot);
