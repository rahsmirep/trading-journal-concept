const request = require('supertest');
const app = require('../backend/server');

describe('Trades API', () => {
  it('should accept native payload POST /api/trades', async () => {
    const payload = {
      ticker: 'TEST1',
      entry: 100.5,
      exit: 105.25,
      size: 1,
      direction: 'long',
      notes: 'test native payload'
    };

    const res = await request(app).post('/api/trades').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.ticker).toBe('TEST1');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should accept legacy payload POST /trades and persist fields', async () => {
    const payload = {
      symbol: 'TEST2',
      entry_date: '2025-11-20',
      exit_date: '2025-11-21',
      pnl: 10.25,
      strategy: 'swing'
    };

    const res = await request(app).post('/trades').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.ticker).toBe('TEST2');
    expect(res.body.strategy).toBe('swing');
    expect(res.body).toHaveProperty('entry_date');
  });
});
