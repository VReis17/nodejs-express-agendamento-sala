function notFound(req, res) { res.status(404).json({ error: { message: 'Rota não encontrada.' } }); }
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  const body = error.body || { error: { message: status === 500 ? 'Erro interno do servidor.' : error.message } };
  res.status(status).json(body);
}
module.exports = { notFound, errorHandler };
