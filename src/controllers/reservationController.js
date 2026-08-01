const service = require('../services/reservationService');
function availability(req, res, next) { try { res.json({ rooms: service.availability(req.query) }); } catch (error) { next(error); } }
function create(req, res, next) { try { res.status(201).json(service.create(req.body, req.user)); } catch (error) { next(error); } }
function list(req, res, next) { try { res.json({ reservations: service.list(req.user) }); } catch (error) { next(error); } }
function cancel(req, res, next) {
  try {
    const reservation = service.cancel(req.params.id, req.funcionario || req.user);
    res.json({
      mensagem: 'Reserva cancelada com sucesso.',
      reserva: { id: reservation.id, status: reservation.status }
    });
  } catch (error) {
    next(error);
  }
}
module.exports = { availability, create, list, cancel };
