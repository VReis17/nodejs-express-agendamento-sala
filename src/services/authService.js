const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const env = require('../config/env');
const HttpError = require('../utils/httpError');
async function login(email, password) {
  if (!email || !password) throw new HttpError(400, 'E-mail e senha são obrigatórios.');
  const employee = db.employees.find(item => item.email.toLowerCase() === String(email).toLowerCase());
  if (!employee || !(await bcrypt.compare(password, employee.passwordHash))) throw new HttpError(401, 'Credenciais inválidas.');
  const user = { id: employee.id, name: employee.name, email: employee.email, role: employee.role };
  return { token: jwt.sign(user, env.jwtSecret, { expiresIn: env.jwtExpiresIn }), tokenType: 'Bearer', expiresIn: env.jwtExpiresIn, user };
}
module.exports = { login };
