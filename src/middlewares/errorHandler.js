function notFound(req, res) { res.status(404).json({ error: { message: 'Rota não encontrada.' } }); }
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  res.status(status).json({ error: { message: status === 500 ? 'Erro interno do servidor.' : error.message } });
}
module.exports = { notFound, errorHandler };
