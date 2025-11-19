import { loadTrades } from './utils.js';
import { renderTradeTable } from './tradeTable.js';

document.getElementById('applyFilters').addEventListener('click', async () => {
  const ticker = document.getElementById('filterTicker').value.trim().toUpperCase();
  const direction = document.getElementById('filterDirection').value;
  const sortBy = document.getElementById('sortBy').value;

  let trades = await loadTrades();

  // Apply filters
  if (ticker) trades = trades.filter(t => t.ticker.toUpperCase() === ticker);
  if (direction) trades = trades.filter(t => t.direction === direction);

  // Apply sorting
  trades.sort((a, b) => {
    switch (sortBy) {
      case 'timestamp_desc': return new Date(b.timestamp) - new Date(a.timestamp);
      case 'timestamp_asc': return new Date(a.timestamp) - new Date(b.timestamp);
      case 'ticker_asc': return a.ticker.localeCompare(b.ticker);
      case 'ticker_desc': return b.ticker.localeCompare(a.ticker);
      default: return 0;
    }
  });

  renderTradeTable(trades);
});

document.getElementById('clearFilters').addEventListener('click', async () => {
  document.getElementById('filterTicker').value = '';
  document.getElementById('filterDirection').value = '';
  document.getElementById('sortBy').value = 'timestamp_desc';
  renderTradeTable(await loadTrades());
});
