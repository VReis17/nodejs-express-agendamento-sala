const { randomUUID } = require('node:crypto');
const db = require('../models/database');
const HttpError = require('../utils/httpError');
function interval(date, startTime, endTime) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime || '')) throw new HttpError(400, 'Use date em YYYY-MM-DD e horários em HH:mm.');
  const start = new Date(`${date}T${startTime}:00`); const end = new Date(`${date}T${endTime}:00`);
  if (Number.isNaN(start.getTime()) || end <= start) throw new HttpError(400, 'O horário final deve ser posterior ao inicial.');
  return { start, end };
}
function conflicts(roomId, start, end) { return db.reservations.some(r => r.roomId === roomId && r.status === 'active' && start < new Date(r.endAt) && end > new Date(r.startAt)); }
function availability(query) {
  const { start, end } = interval(query.date, query.startTime, query.endTime); const capacity = query.capacity === undefined ? 1 : Number(query.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) throw new HttpError(400, 'Capacidade deve ser um inteiro maior que zero.');
  return db.rooms.filter(room => room.active && room.capacity >= capacity && !conflicts(room.id, start, end));
}
function create(data, user) {
  if (!data.roomId || !String(data.title || '').trim()) throw new HttpError(400, 'Sala e título são obrigatórios.');
  if (!db.rooms.some(room => room.id === data.roomId && room.active)) throw new HttpError(404, 'Sala não encontrada.');
  const { start, end } = interval(data.date, data.startTime, data.endTime);
  if (conflicts(data.roomId, start, end)) throw new HttpError(409, 'A sala já está reservada nesse período.');
  const reservation = { id: randomUUID(), roomId: data.roomId, employeeId: user.id, title: String(data.title).trim(), startAt: start.toISOString(), endAt: end.toISOString(), status: 'active', createdAt: new Date().toISOString() };
  db.reservations.push(reservation); return reservation;
}
function list(user) { return user.role === 'manager' ? db.reservations : db.reservations.filter(r => r.employeeId === user.id); }
function cancel(id, user) {
  const reservation = db.reservations.find(r => r.id === id);
  if (!reservation) throw new HttpError(404, 'Reserva não encontrada.');
  if (reservation.employeeId !== user.id && user.role !== 'manager') throw new HttpError(403, 'Você não pode cancelar esta reserva.');
  if (reservation.status === 'cancelled') throw new HttpError(409, 'A reserva já foi cancelada.');
  reservation.status = 'cancelled'; reservation.cancelledAt = new Date().toISOString(); return reservation;
}
module.exports = { availability, create, list, cancel };
