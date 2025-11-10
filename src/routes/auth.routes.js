import Joi from 'joi';
import { login, register } from '../controllers/auth.controller.js';
import { isAdmin } from '../middleware/isAdmin.js';

export default [
  {
    method: 'POST',
    path: '/auth/login',
    options: {
      tags: ['api', 'Auth'], // ✅ penting agar muncul di Swagger
      description: 'Login user untuk mendapatkan JWT token',
      notes: 'Hanya user yang sudah terdaftar bisa login',
      handler: login,
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/register',
    options: {
      tags: ['api', 'Auth'],
      description: 'Register akun baru (khusus admin)',
      notes: 'Hanya admin yang bisa mendaftarkan akun baru',
      handler: isAdmin(register),
      validate: {
        payload: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
          role: Joi.string().valid('admin', 'sales').default('sales')
        })
      }
    }
  }
];
