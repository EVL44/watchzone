import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';

export const hashPassword = (password) => {
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const createToken = (user) => {
  return jwt.sign({ userId: user.id, username: user.username }, jwtSecret, {
    expiresIn: '1h',
  });
};