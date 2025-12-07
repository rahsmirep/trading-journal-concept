// components/analytics.js
import { loadTrades } from './utils.js';

// Keep chart instances so we can update them with animation instead of recreating
let pnlChartInstance = null;
let freqChartInstance = null;

// Helper: get pnl value for a trade. Prefer explicit `pnl` if present, otherwise compute.
function getTradePnL(trade) {
  if (typeof trade.pnl === 'number') return Number(trade.pnl);
  if (typeof trade.pnl === 'string' && trade.pnl.trim() !== '') return parseFloat(trade.pnl);
  if (typeof trade.exit_price !== 'undefined' && typeof trade.entry !== 'undefined' && typeof trade.size !== 'undefined') {
    return (Number(trade.exit_price) - Number(trade.entry)) * Number(trade.size) * (trade.direction === 'long' ? 1 : -1);
  }
  return 0;
}

export async function renderAnalytics() {
  console.log('[analytics] renderAnalytics() start');
  const trades = await loadTrades();
  console.log('[analytics] loaded trades:', Array.isArray(trades) ? trades.length : 0);
  if (!trades || trades.length === 0) {
    document.getElementById('stats').innerHTML = '<p>No trades to analyze yet.</p>';
    return;
  }

  const stats = calculateStats(trades);
  
  // Update stats display
  const statsDiv = document.getElementById('stats');
  statsDiv.innerHTML = `
    <strong>Trading Statistics</strong><br>
    Total Trades: ${trades.length}<br>
    Wins: ${stats.wins} | Losses: ${stats.losses}<br>
    Win Rate: ${((stats.wins / trades.length) * 100).toFixed(2)}%<br>
    Total P&L: $${stats.totalPnL.toFixed(2)}<br>
    Average Trade: $${(stats.totalPnL / trades.length).toFixed(2)}
  `;

  // Render cumulative earnings chart (by date)
  renderCumulativeEarningsChartByDate(trades);
  // Render cumulative frequency distribution (per-trade)
  renderCumulativeFrequencyChart(trades);
}

function calculateStats(trades) {
  let wins = 0, losses = 0, totalPnL = 0;

  trades.forEach(trade => {
    const pnl = getTradePnL(trade);
    if (pnl > 0) wins++;
    else if (pnl < 0) losses++;
    totalPnL += pnl;
  });

  return {
    wins,
    losses,
    totalPnL,
  };
}

// Group trades by date (YYYY-MM-DD) and compute cumulative PnL over dates
function renderCumulativeEarningsChartByDate(trades) {
  const ctx = document.getElementById('pnlChart')?.getContext('2d');
  if (!ctx) return;

  // Aggregate PnL by trade date. Prefer `entry_date`, fallback to timestamp.
  const dailyMap = new Map();
  trades.forEach(trade => {
    const rawDate = trade.entry_date || trade.timestamp || trade.date || null;
    let dateKey;
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d)) dateKey = d.toISOString().slice(0,10);
    }
    if (!dateKey) dateKey = new Date().toISOString().slice(0,10);

    const pnl = getTradePnL(trade);
    dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + pnl);
  });

  // Sort dates ascending
  const dates = Array.from(dailyMap.keys()).sort((a,b) => new Date(a) - new Date(b));
  const dailySums = dates.map(d => dailyMap.get(d));

  // Compute cumulative sum
  const cumulative = [];
  let running = 0;
  for (let v of dailySums) {
    running += v;
    cumulative.push(running);
  }

  console.log('[analytics] cumulative dates:', dates.length, 'values:', dailySums);
  // Determine y-axis bounds aligned to 500
  const allY = cumulative.slice();
  allY.push(0);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const yMin = Math.floor(minY / 500) * 500;
  let yMax = Math.ceil(maxY / 500) * 500;
  if (yMin === yMax) yMax = yMin + 500;

  const chartConfig = {
    type: 'line',
    data: {
      labels: dates.map(d => new Date(d).toLocaleDateString()),
      datasets: [{
        label: 'Cumulative P&L',
        data: cumulative,
        borderColor: '#000',
        backgroundColor: 'rgba(0,0,0,0.06)',
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        pointBackgroundColor: cumulative.map(p => p >= 0 ? '#059669' : '#dc2626'),
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: { display: true, text: 'Cumulative P&L by Date' },
        legend: { display: false }
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      transitions: {
        active: {
          animation: {
            duration: 400
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: 'Profit ($)' },
          min: yMin,
          max: yMax,
          ticks: {
            stepSize: 500,
            callback: function(value) { return `$${value}`; }
          }
        },
        x: {
          title: { display: true, text: 'Date' }
        }
      }
    }
  };

  if (pnlChartInstance) {
    // Update existing chart data and options then animate
    console.log('[analytics] updating existing pnlChartInstance');
    pnlChartInstance.data.labels = chartConfig.data.labels;
    pnlChartInstance.data.datasets = chartConfig.data.datasets;
    pnlChartInstance.options.scales.y.min = yMin;
    pnlChartInstance.options.scales.y.max = yMax;
    pnlChartInstance.update();
  } else {
    console.log('[analytics] creating new pnlChartInstance');
    pnlChartInstance = new Chart(ctx, chartConfig);
  }
}

function renderCumulativeFrequencyChart(trades) {
  const ctx = document.getElementById('winRateChart')?.getContext('2d');
  if (!ctx) return;

  // Calculate P&L for each trade (per-trade values)
  const pnlValues = trades.map(trade => getTradePnL(trade));

  // Sort P&L values for cumulative frequency
  const sortedPnL = [...pnlValues].sort((a, b) => a - b);
  
  // Create cumulative frequency data (percent)
  const cumulativeFrequency = sortedPnL.map((_, index) => ((index + 1) / sortedPnL.length) * 100);

  const freqConfig = {
    type: 'line',
    data: {
      labels: sortedPnL.map(pnl => `$${pnl.toFixed(2)}`),
      datasets: [{
        label: 'Cumulative Frequency (%)',
        data: cumulativeFrequency,
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2,132,199,0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: { display: true, text: 'Cumulative Frequency Distribution of Earnings' },
        legend: { display: false }
      },
      animation: { duration: 800, easing: 'easeOutQuart' }
    }
  };

  if (freqChartInstance) {
    console.log('[analytics] updating existing freqChartInstance');
    freqChartInstance.data = freqConfig.data;
    freqChartInstance.update();
  } else {
    console.log('[analytics] creating new freqChartInstance');
    freqChartInstance = new Chart(ctx, freqConfig);
  }
}