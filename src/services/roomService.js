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
module.exports = { list, create };
