import request from 'supertest';
import app from '../src/app.js';

describe('System Health API', () => {
  it('GET /api/health should return 200 with comprehensive telemetry', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('uptimeHuman');
    expect(res.body).toHaveProperty('memory');
    expect(res.body.memory).toHaveProperty('heapUsedMb');
    expect(res.body).toHaveProperty('dbDetails');
    expect(res.body).toHaveProperty('service', 'omnilog-api');
  });

  it('GET /health root alias should return 200 equivalent to /api/health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/health/live should return 200 for liveness probe', async () => {
    const res = await request(app).get('/api/health/live');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('live');
    expect(res.body).toHaveProperty('uptime');
  });

  it('GET /api/health/ready should return 200 with db readiness check', async () => {
    const res = await request(app).get('/api/health/ready');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
    expect(res.body).toHaveProperty('latencyMs');
  });

  it('GET /api/unknown-route should return 404', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
