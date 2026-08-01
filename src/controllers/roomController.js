const service = require('../services/roomService');
function list(req, res, next) { try { res.json({ rooms: service.list() }); } catch (error) { next(error); } }
function create(req, res, next) { try { res.status(201).json(service.create(req.body)); } catch (error) { next(error); } }
module.exports = { list, create };
