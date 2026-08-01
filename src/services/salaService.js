const db = require('../models/database');

class SalaReservaError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
    this.payload = {
      success: false,
      data: null,
      erro: [{ code, menssagem: message }]
    };
  }
}

function normalizeRoomId(value) {
  if (value === undefined || value === null || value === '') return NaN;

  const text = String(value).trim();
  const normalized = text.match(/\d+/);
  return normalized ? Number(normalized[0]) : Number(text);
}

function isSameRoomId(left, right) {
  return normalizeRoomId(left) === normalizeRoomId(right);
}

function normalizeReservationDate(value, fieldName) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new SalaReservaError(400, 'VALIDATION_ERROR', `${fieldName} deve ser uma data ISO 8601 válida.`);
  }

  return date;
}

function create({ salaId, inicio, fim, funcionarioId }) {
  if (salaId === undefined || salaId === null || salaId === '' || !inicio || !fim) {
    throw new SalaReservaError(400, 'VALIDATION_ERROR', 'salaId, inicio e fim são obrigatórios.');
  }

  const salaIdNumber = Number(salaId);
  if (!Number.isInteger(salaIdNumber) || salaIdNumber <= 0) {
    throw new SalaReservaError(400, 'VALIDATION_ERROR', 'salaId deve ser um número inteiro maior que zero.');
  }

  if (!funcionarioId) {
    throw new SalaReservaError(401, 'UNAUTHORIZED', 'Funcionário não identificado no token JWT.');
  }

  const inicioDate = normalizeReservationDate(inicio, 'inicio');
  const fimDate = normalizeReservationDate(fim, 'fim');

  if (fimDate.getTime() <= inicioDate.getTime()) {
    throw new SalaReservaError(400, 'VALIDATION_ERROR', 'A data final deve ser maior que a data inicial.');
  }

  const salaExiste = db.rooms.some(room => isSameRoomId(room.id, salaIdNumber) && room.active !== false);
  if (!salaExiste) {
    throw new SalaReservaError(404, 'ROOM_NOT_FOUND', 'Sala não encontrada.');
  }

  const temConflito = db.reservations.some((reservaAtual) => {
    if (!isSameRoomId(reservaAtual.salaId, salaIdNumber)) return false;

    const reservaInicio = new Date(reservaAtual.inicio);
    const reservaFim = new Date(reservaAtual.fim);

    if (Number.isNaN(reservaInicio.getTime()) || Number.isNaN(reservaFim.getTime())) {
      return false;
    }

    // Interseção de intervalos: a nova reserva conflita quando o fim atual é maior que o início existente
    // e o início atual é menor que o fim existente. Isso cobre sobreposição total, parcial e em bordas.
    return inicioDate < reservaFim && fimDate > reservaInicio;
  });

  if (temConflito) {
    throw new SalaReservaError(
      409,
      'ROOM_ALREADY_BOOKED',
      'A sala já possui uma reserva que conflita com o horário solicitado.'
    );
  }

  const proximoId = (db.reservations.at(-1)?.id ?? 100) + 1;
  const reserva = {
    id: proximoId,
    salaId: salaIdNumber,
    funcionarioId,
    inicio: inicioDate.toISOString(),
    fim: fimDate.toISOString()
  };

  db.reservations.push(reserva);

  return {
    reservaId: reserva.id,
    salaId: reserva.salaId,
    funcionarioId: reserva.funcionarioId,
    inicio: reserva.inicio,
    fim: reserva.fim
  };
}

module.exports = { create };
