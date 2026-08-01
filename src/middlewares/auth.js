const jwt = require('jsonwebtoken');
const env = require('../config/env');
function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: { message: 'Token de acesso ausente ou malformado.' } });
  try {
    const funcionario = jwt.verify(token, env.jwtSecret);
    req.funcionario = funcionario;
    req.user = funcionario;
    next();
  }
  catch { res.status(401).json({ error: { message: 'Token de acesso inválido ou expirado.' } }); }
}
function authorize(...roles) { return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ error: { message: 'Perfil sem permissão para esta operação.' } }); }
module.exports = { authenticate, authorize };
