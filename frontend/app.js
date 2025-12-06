const API_BASE = '/api/trades';

const els = {
  form: document.getElementById('tradeForm'),
  formStatus: document.getElementById('formStatus'),
  table: document.getElementById('tradeTable'),
  tbody: document.querySelector('#tradeTable tbody'),
  archiveStatus: document.getElementById('archiveStatus'),
  filterTicker: document.getElementById('filterTicker'),
  filterDirection: document.getElementById('filterDirection'),
  sortBy: document.getElementById('sortBy'),
  applyFilters: document.getElementById('applyFilters'),
  clearFilters: document.getElementById('clearFilters'),
  exportCsv: document.getElementById('exportCsv'),
  refresh: document.getElementById('refresh'),
};

let allTrades = [];

function authHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function fetchTrades() {
  els.archiveStatus.textContent = 'Loading trades...';
  try {
    const res = await fetch(API_BASE, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allTrades = Array.isArray(data) ? data : (data.trades || []);
    renderArchive();
    els.archiveStatus.textContent = `Loaded ${allTrades.length} trades.`;
  } catch (err) {
    els.archiveStatus.textContent = `Error loading trades: ${err.message}`;
  }
}

function renderArchive() {
  const filtered = Utils.filterTrades(allTrades, {
    ticker: els.filterTicker.value.trim(),
    direction: els.filterDirection.value,
  });
  const sorted = Utils.sortTrades(filtered, els.sortBy.value);
  TradeTable.renderTableRows(els.tbody, sorted);
}

async function submitTrade(e) {
  e.preventDefault();
  els.formStatus.textContent = '';
  const fd = new FormData(els.form);
  const trade = Object.fromEntries(fd.entries());

  trade.entry = parseFloat(trade.entry);
  trade.exit = parseFloat(trade.exit);
  trade.size = parseFloat(trade.size);

  if (!trade.ticker || !Number.isFinite(trade.entry) || !Number.isFinite(trade.exit) || !Number.isFinite(trade.size)) {
    els.formStatus.textContent = 'Please fill all required fields with valid numbers.';
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
      throw new Error(errBody.message || `HTTP ${res.status}`);
    }
    els.formStatus.textContent = 'Trade logged successfully.';
    els.form.reset();
    await fetchTrades();
  } catch (err) {
    els.formStatus.textContent = `Error logging trade: ${err.message}`;
  }
}

function bindEvents() {
  els.form.addEventListener('submit', submitTrade);
  els.applyFilters.addEventListener('click', renderArchive);
  els.clearFilters.addEventListener('click', () => {
    els.filterTicker.value = '';
    els.filterDirection.value = '';
    els.sortBy.value = 'timestamp_desc';
    renderArchive();
  });
  els.exportCsv.addEventListener('click', () => {
    const headers = ['id', 'timestamp', 'ticker', 'direction', 'entry', 'exit', 'size', 'notes'];
    const filtered = Utils.filterTrades(allTrades, {
      ticker: els.filterTicker.value.trim(),
      direction: els.filterDirection.value,
    });
    const sorted = Utils.sortTrades(filtered, els.sortBy.value);
    const csv = Utils.toCSV(sorted, headers);
    Utils.download(`trades_${new Date().toISOString().slice(0,19)}.csv`, csv);
  });
  els.refresh.addEventListener('click', fetchTrades);
}

function boot() {
  bindEvents();
  fetchTrades();
}

document.addEventListener('DOMContentLoaded', boot);
