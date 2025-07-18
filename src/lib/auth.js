import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<object>} A promise that resolves with the decoded token payload.
 */
export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

/**
 * Creates a new JWT token.
 * @param {object} payload - The payload to sign into the token.
 * @returns {string} The generated JWT token.
 */
export const createToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
};