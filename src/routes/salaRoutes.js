const router = require('express').Router();
const controller = require('../controllers/salaController');
const { authenticate } = require('../middlewares/auth');

router.post('/reserva', authenticate, controller.reservar);

module.exports = router;
