const service = require('../services/salaService');

function reservar(req, res, next) {
  try {
    const funcionarioId = req.user?.id;
    const payload = service.create({
      salaId: req.body.salaId,
      inicio: req.body.inicio,
      fim: req.body.fim,
      funcionarioId
    });

    res.status(201).json({
      sucesso: true,
      data: payload,
      erro: null
    });
  } catch (error) {
    if (error && error.payload) {
      return res.status(error.status || 400).json(error.payload);
    }
    return next(error);
  }
}

module.exports = { reservar };
