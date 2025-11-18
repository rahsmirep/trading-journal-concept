import { loadTrades } from './utils.js';

export async function renderTradeTable() {
  const trades = await loadTrades();
  const table = document.getElementById('trade-table-body');
  table.innerHTML = '';

  trades.forEach(trade => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.ticker}</td>
      <td>${trade.entry}</td>
      <td>${trade.exit}</td>
      <td>${trade.size}</td>
      <td>${trade.direction}</td>
      <td>${trade.notes}</td>
      <td>${new Date(trade.timestamp).toLocaleString()}</td>
    `;
    table.appendChild(row);
  });
}
