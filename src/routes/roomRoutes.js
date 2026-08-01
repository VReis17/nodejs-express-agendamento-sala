const router = require('express').Router();
const controller = require('../controllers/roomController');
const reservations = require('../controllers/reservationController');
const { authorize } = require('../middlewares/auth');
router.get('/', controller.list);
router.get('/availability', reservations.availability);
router.post('/', authorize('manager'), controller.create);
module.exports = router;
