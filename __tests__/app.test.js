const request = require('supertest');
const app = require('../index');
describe('Health', () => {
  it('GET /healthz returns ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.text).toContain('ok');
  });
});
