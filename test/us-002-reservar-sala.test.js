const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/models/database');

function buildIso(offsetMinutes = 60) {
  return new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString();
}

async function login(email, password) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  assert.equal(response.status, 200);
  return response.body.token;
}

test('US 002 - cria reserva com sucesso em horário sem conflito', async () => {
  const token = await login('funcionario@empresa.com', 'Funcionario@123');
  const inicio = buildIso(30);
  const fim = buildIso(90);

  const response = await request(app)
    .post('/api/salas/reserva')
    .set('Authorization', `Bearer ${token}`)
    .send({ salaId: 1, inicio, fim });

  assert.equal(response.status, 201);
  assert.equal(response.body.sucesso, true);
  assert.equal(response.body.data.salaId, 1);
  assert.equal(response.body.data.funcionarioId, 'func-2');
  assert.equal(response.body.erro, null);
  assert.equal(db.reservations.length > 0, true);
});

test('US 002 - bloqueia conflito de horário para a mesma sala', async () => {
  const token = await login('gerente@empresa.com', 'Gerente@123');
  const inicio = buildIso(120);
  const fim = buildIso(180);

  await request(app)
    .post('/api/salas/reserva')
    .set('Authorization', `Bearer ${token}`)
    .send({ salaId: 1, inicio, fim });

  const response = await request(app)
    .post('/api/salas/reserva')
    .set('Authorization', `Bearer ${token}`)
    .send({ salaId: 1, inicio: buildIso(130), fim: buildIso(170) });

  assert.equal(response.status, 409);
  assert.equal(response.body.success, false);
  assert.equal(response.body.data, null);
  assert.equal(response.body.erro[0].code, 'ROOM_ALREADY_BOOKED');
  assert.match(response.body.erro[0].menssagem, /já possui uma reserva/i);
});

test('US 002 - rejeita entrada inválida', async () => {
  const token = await login('funcionario@empresa.com', 'Funcionario@123');

  const response = await request(app)
    .post('/api/salas/reserva')
    .set('Authorization', `Bearer ${token}`)
    .send({ salaId: 1, inicio: '2026-08-01T15:00:00Z' });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});
