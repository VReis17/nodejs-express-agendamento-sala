module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'chave-local-apenas-para-desenvolvimento',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h'
};
