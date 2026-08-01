const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');
const env = require('../src/config/env');
const db = require('../src/models/database');

const ownReservation = {
  id: 7,
  salaId: 'sala-1',
  funcionarioId: 'func-2',
  dataInicio: '2026-08-03T12:00:00.000Z',
  dataFim: '2026-08-03T13:00:00.000Z',
  status: 'ATIVA'
};

function token(employeeId = 'func-2') {
  return jwt.sign({ id: employeeId, role: 'employee' }, env.jwtSecret, { expiresIn: '5m' });
}

test.beforeEach(() => {
  db.reservations.splice(0, db.reservations.length, { ...ownReservation });
});

test('cancela a própria reserva sem remover o registro', async () => {
  const before = { ...db.reservations[0] };

  const response = await request(app)
    .patch('/api/reservas/7/cancelar')
    .set('Authorization', `Bearer ${token()}`);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    mensagem: 'Reserva cancelada com sucesso.',
    reserva: { id: 7, status: 'CANCELADA' }
  });
  assert.equal(db.reservations.length, 1);
  assert.deepEqual(db.reservations[0], { ...before, status: 'CANCELADA' });
});

test('retorna 404 quando a reserva não existe', async () => {
  const response = await request(app)
    .patch('/api/reservas/inexistente/cancelar')
    .set('Authorization', `Bearer ${token()}`);

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { erro: 'Reserva não encontrada.' });
});

test('retorna 403 quando a reserva pertence a outro funcionário', async () => {
  const response = await request(app)
    .patch('/api/reservas/7/cancelar')
    .set('Authorization', `Bearer ${token('func-1')}`);

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, { erro: 'Você não tem permissão para cancelar esta reserva.' });
  assert.equal(db.reservations[0].status, 'ATIVA');
});

test('retorna 409 quando a reserva já está cancelada', async () => {
  db.reservations[0].status = 'CANCELADA';

  const response = await request(app)
    .patch('/api/reservas/7/cancelar')
    .set('Authorization', `Bearer ${token()}`);

  assert.equal(response.status, 409);
  assert.deepEqual(response.body, { erro: 'Reserva não pode ser cancelada (status atual: CANCELADA).' });
});

test('retorna 401 quando o token não é informado', async () => {
  const response = await request(app).patch('/api/reservas/7/cancelar');

  assert.equal(response.status, 401);
  assert.equal(db.reservations[0].status, 'ATIVA');
});

test('cria novas reservas com status ATIVA', async () => {
  const response = await request(app)
    .post('/api/reservations')
    .set('Authorization', `Bearer ${token()}`)
    .send({
      roomId: 'sala-2',
      title: 'Planejamento',
      date: '2026-08-04',
      startTime: '09:00',
      endTime: '10:00'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.status, 'ATIVA');
  assert.equal(response.body.funcionarioId, 'func-2');
  assert.equal(response.body.salaId, 'sala-2');
});
