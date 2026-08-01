const service = require('../services/authService');
async function login(req, res, next) { try { res.json(await service.login(req.body.email, req.body.password)); } catch (error) { next(error); } }
module.exports = { login };
