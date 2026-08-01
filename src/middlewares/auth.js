const jwt = require('jsonwebtoken');
const env = require('../config/env');
function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Acesso negado. Autenticação de funcionário necessária.' });
  }
  try { req.user = jwt.verify(token, env.jwtSecret); next(); }
  catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'O token de acesso expirou. Realize uma nova autenticação.'
      : 'Acesso negado. Autenticação de funcionário necessária.';
    res.status(401).json({ erro: message });
  }
}
function authorize(...roles) { return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ error: { message: 'Perfil sem permissão para esta operação.' } }); }
module.exports = { authenticate, authorize };
