import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secret = process.env.JWT_SECRET;

export const protect = (handler) => {
  return async (request, h) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return h.response({ message: 'Unauthorized' }).code(401);

    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, secret);
      request.user = decoded;
      return handler(request, h);
    } catch {
      return h.response({ message: 'Invalid token' }).code(401);
    }
  };
};
