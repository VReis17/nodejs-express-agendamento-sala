const { randomUUID } = require('node:crypto');
const db = require('../models/database');
const HttpError = require('../utils/httpError');
function list() { return db.rooms.filter(room => room.active); }
function create(data) {
  const name = String(data.name || '').trim();
  const capacity = Number(data.capacity);
  if (!name || !Number.isInteger(capacity) || capacity < 1) throw new HttpError(400, 'Nome e capacidade inteira maior que zero são obrigatórios.');
  if (db.rooms.some(room => room.name.toLowerCase() === name.toLowerCase())) throw new HttpError(409, 'Já existe uma sala com esse nome.');
  const room = { id: randomUUID(), name, capacity, resources: Array.isArray(data.resources) ? data.resources : [], active: true };
  db.rooms.push(room); return room;
}
function availability({ inicio, fim }) {
  const start = new Date(inicio);
  const end = new Date(fim);

  if (!inicio || !fim || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return { error: true };
  }

  return db.rooms.filter(room => room.active).map(room => {
    const reservation = db.reservations.find(item => (
      item.roomId === room.id && item.status === 'active'
      && start < new Date(item.endAt) && end > new Date(item.startAt)
    ));
    const employee = reservation && db.employees.find(item => item.id === reservation.employeeId);
    return { id: room.id, nome: room.name, disponivel: !reservation, reservaDe: employee ? employee.name : null };
  });
}
module.exports = { list, create, availability };
