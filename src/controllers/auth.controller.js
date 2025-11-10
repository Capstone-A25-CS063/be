import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (request, h) => {
  const { error, value } = loginSchema.validate(request.payload);
  if (error) return h.response({ message: error.message }).code(400);

  const { email, password } = value;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return h.response({ message: 'Invalid credentials' }).code(401);
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  };
};

export const register = async (request, h) => {
  const { error, value } = registerSchema.validate(request.payload);
  if (error) return h.response({ message: error.message }).code(400);

  const { name, email, password, role } = value;

  const existing = await User.findOne({ email });
  if (existing) return h.response({ message: 'Email already registered' }).code(400);

  const user = new User({ name, email, password, role });
  await user.save();

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  return h.response({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }).code(201);
};
