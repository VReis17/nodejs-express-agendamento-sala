const router = require('express').Router();
const controller = require('../controllers/reservationController');
router.get('/', controller.list);
router.post('/', controller.create);
router.delete('/:id', controller.cancel);
module.exports = router;
