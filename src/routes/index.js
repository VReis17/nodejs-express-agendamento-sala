const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
router.use('/auth', require('./authRoutes'));
router.use('/rooms', authenticate, require('./roomRoutes'));
router.use('/reservations', authenticate, require('./reservationRoutes'));
router.use('/reservas', authenticate, require('./reservationRoutes'));
module.exports = router;
