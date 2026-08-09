const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'skillswap_super_secret_jwt_key_2026_x99!', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'skillswap_super_secret_jwt_key_2026_x99!');
};

module.exports = { generateToken, verifyToken };
