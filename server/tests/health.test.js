import request from 'supertest';
import app from '../src/app.js';

describe('System Health API', () => {
  it('GET /api/health should return 200 with healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('database');
  });

  it('GET /api/unknown-route should return 404', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
