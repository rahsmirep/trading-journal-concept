

import { loadTrades, deleteAllTrades } from './utils.js';

export async function renderTradeTable() {
  // Ensure the Clear All Trades button is always present above the table
  let clearBtn = document.getElementById('clearAllTradesBtn');
  if (!clearBtn) {
    clearBtn = document.createElement('button');
    clearBtn.id = 'clearAllTradesBtn';
    clearBtn.className = 'btn btn-dark btn-sm';
    clearBtn.textContent = 'Clear All Trades';
    clearBtn.style.marginBottom = '10px';
    const table = document.getElementById('tradeTable');
    if (table && table.parentNode) {
      table.parentNode.insertBefore(clearBtn, table);
    }
    clearBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete all your trades? This cannot be undone.')) {
        const success = await deleteAllTrades();
        if (success) {
          await renderTradeTable();
        } else {
          alert('Failed to delete all trades.');
        }
      }
    });
  }

  // Render the trade history table
  const trades = await loadTrades();
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!trades || trades.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="5" style="text-align:center;">No trades logged yet.</td>`;
    tbody.appendChild(row);
    return;
  }
  trades.forEach(trade => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.ticker || ''}</td>
      <td>${trade.direction || ''}</td>
      <td>${trade.size || ''}</td>
      <td>${(typeof trade.pnl !== 'undefined' && trade.pnl !== null) ? Number(trade.pnl).toFixed(2) : ''}</td>
      <td>${trade.notes || ''}</td>
    `;
    tbody.appendChild(row);
  });
}
