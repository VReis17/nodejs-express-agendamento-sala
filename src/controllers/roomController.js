const service = require('../services/roomService');
function list(req, res, next) { try { res.json({ rooms: service.list() }); } catch (error) { next(error); } }
function create(req, res, next) { try { res.status(201).json(service.create(req.body)); } catch (error) { next(error); } }
function availability(req, res, next) {
  try {
    const rooms = service.availability(req.query);
    if (rooms.error) {
      return res.status(400).json({ erros: [{ codigo: 'INTERVALO_INVALIDO', mensagem: 'A data final deve ser maior que a data inicial.' }] });
    }
    res.json(rooms);
  } catch (error) { next(error); }
}
module.exports = { list, create, availability };
