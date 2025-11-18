// analytics.js
import { loadTrades } from './utils.js';

export async function renderAnalytics() {
  const trades = await loadTrades();
  const stats = calculateStats(trades);
  const container = document.getElementById('analytics');

  container.innerHTML = `
    <p>Win/Loss Ratio: ${stats.winLossRatio.toFixed(2)}</p>
    <p>Average R: ${stats.averageR.toFixed(2)}</p>
    <canvas id="equityChart" width="400" height="200"></canvas>
    <canvas id="rHistogram" width="400" height="200"></canvas>
    <canvas id="tickerChart" width="400" height="200"></canvas>
  `;

  renderEquityChart(stats.equityCurve);
  renderRDistribution(trades);
  renderPerformanceByTicker(trades);
}

function calculateStats(trades) {
  let wins = 0, losses = 0, totalR = 0;
  const equityCurve = [];
  let equity = 0;

  trades.forEach(trade => {
    const r = (trade.exit - trade.entry) * trade.size * (trade.direction === 'long' ? 1 : -1);
    if (r > 0) wins++;
    else losses++;
    totalR += r;
    equity += r;
    equityCurve.push({ timestamp: trade.timestamp, equity });
  });

  return {
    winLossRatio: wins / (losses || 1),
    averageR: totalR / trades.length || 0,
    equityCurve
  };
}

function renderEquityChart(data) {
  const ctx = document.getElementById('equityChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
      datasets: [{
        label: 'Equity Curve',
        data: data.map(d => d.equity),
        borderColor: 'blue',
        fill: false
      }]
    },
    options: { responsive: true }
  });
}

function renderRDistribution(trades) {
  const rValues = trades.map(t => (t.exit - t.entry) * t.size * (t.direction === 'long' ? 1 : -1));
  const ctx = document.getElementById('rHistogram').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rValues.map((_, i) => `Trade ${i + 1}`),
      datasets: [{
        label: 'R Distribution',
        data: rValues,
        backgroundColor: rValues.map(r => r > 0 ? 'green' : 'red')
      }]
    },
    options: { responsive: true }
  });
}

function renderPerformanceByTicker(trades) {
  const tickerMap = {};
  trades.forEach(t => {
    const r = (t.exit - t.entry) * t.size * (t.direction === 'long' ? 1 : -1);
    tickerMap[t.ticker] = (tickerMap[t.ticker] || 0) + r;
  });

  const labels = Object.keys(tickerMap);
  const data = Object.values(tickerMap);
  const ctx = document.getElementById('tickerChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Performance by Ticker',
        data,
        backgroundColor: data.map(r => r > 0 ? 'blue' : 'orange')
      }]
    },
    options: { responsive: true }
  });
}
