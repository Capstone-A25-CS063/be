import jwt from 'jsonwebtoken';

export const isAdmin = (handler) => {
  return async (request, h) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return h.response({ message: 'Missing token' }).code(401);
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== 'admin') {
        return h.response({ message: 'Access denied: admin only' }).code(403);
      }

      // inject user info
      request.auth = decoded;

      return handler(request, h);
    } catch (err) {
      console.error('JWT Error:', err);
      return h.response({ message: 'Unauthorized' }).code(401);
    }
  };
};
