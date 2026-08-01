const request = require('supertest');
const app = require('./src/app');

(async () => {
  const auth = await request(app)
    .post('/api/auth/login')
    .send({ email: 'gerente@empresa.com', password: 'Gerente@123' });

  const token = auth.body.token;
  const now = Date.now();
  const firstStart = new Date(now + 120000).toISOString();
  const firstEnd = new Date(now + 180000).toISOString();
  const secondStart = new Date(now + 130000).toISOString();
  const secondEnd = new Date(now + 170000).toISOString();

  const first = await request(app)
    .post('/api/salas/reserva')
    .set('Authorization', `Bearer ${token}`)
    .send({ salaId: 1, inicio: firstStart, fim: firstEnd });

  const second = await request(app)
    .post('/api/salas/reserva')
    .set('Authorization', `Bearer ${token}`)
    .send({ salaId: 1, inicio: secondStart, fim: secondEnd });

  console.log('FIRST', JSON.stringify(first.status), JSON.stringify(first.body, null, 2));
  console.log('SECOND', JSON.stringify(second.status), JSON.stringify(second.body, null, 2));
})();
