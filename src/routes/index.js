const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const roomController = require('../controllers/roomController');
router.use('/auth', require('./authRoutes'));
router.use('/rooms', authenticate, require('./roomRoutes'));
router.get('/salas/disponibilidade', roomController.availability);
router.use('/reservations', authenticate, require('./reservationRoutes'));
module.exports = router;
