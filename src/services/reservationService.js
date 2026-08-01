const { randomUUID } = require('node:crypto');
const db = require('../models/database');
const { RESERVATION_STATUS } = require('../models/reservation');
const HttpError = require('../utils/httpError');
function interval(date, startTime, endTime) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime || '')) throw new HttpError(400, 'Use date em YYYY-MM-DD e horários em HH:mm.');
  const start = new Date(`${date}T${startTime}:00`); const end = new Date(`${date}T${endTime}:00`);
  if (Number.isNaN(start.getTime()) || end <= start) throw new HttpError(400, 'O horário final deve ser posterior ao inicial.');
  return { start, end };
}
function conflicts(roomId, start, end) {
  return db.reservations.some(reservation => {
    const reservationRoomId = reservation.salaId ?? reservation.roomId;
    const reservationStart = reservation.dataInicio ?? reservation.startAt;
    const reservationEnd = reservation.dataFim ?? reservation.endAt;
    const isActive = reservation.status === RESERVATION_STATUS.ACTIVE;

    return reservationRoomId === roomId
      && isActive
      && start < new Date(reservationEnd)
      && end > new Date(reservationStart);
  });
}
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
  const reservation = {
    id: randomUUID(),
    salaId: data.roomId,
    funcionarioId: user.id,
    dataInicio: start.toISOString(),
    dataFim: end.toISOString(),
    status: RESERVATION_STATUS.ACTIVE,
    titulo: String(data.title).trim(),
    criadaEm: new Date().toISOString()
  };
  db.reservations.push(reservation); return reservation;
}
function list(user) {
  return user.role === 'manager'
    ? db.reservations
    : db.reservations.filter(reservation => (reservation.funcionarioId ?? reservation.employeeId) === user.id);
}
function cancel(id, funcionario) {
  const reservation = db.reservations.find(item => String(item.id) === String(id));
  if (!reservation) {
    const message = 'Reserva não encontrada.';
    throw new HttpError(404, message, { erro: message });
  }

  const funcionarioId = reservation.funcionarioId ?? reservation.employeeId;
  if (funcionarioId !== funcionario.id) {
    const message = 'Você não tem permissão para cancelar esta reserva.';
    throw new HttpError(403, message, { erro: message });
  }

  if (reservation.status !== RESERVATION_STATUS.ACTIVE) {
    const message = `Reserva não pode ser cancelada (status atual: ${reservation.status}).`;
    throw new HttpError(409, message, { erro: message });
  }

  reservation.status = RESERVATION_STATUS.CANCELLED;
  return reservation;
}
module.exports = { availability, create, list, cancel };
