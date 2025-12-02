import Joi from 'joi';
import User from '../models/user.model.js';
import { isAdmin } from '../middleware/isAdmin.js';

// Get all users
const getAllUsers = async (request, h) => {
  try {
    const users = await User.find().select('-password');
    return h.response(users).code(200);
  } catch (error) {
    return h.response({ error: error.message }).code(500);
  }
};

// Get user by ID
const getUserById = async (request, h) => {
  try {
    const user = await User.findById(request.params.id).select('-password');
    if (!user) {
      return h.response({ error: 'User tidak ditemukan' }).code(404);
    }
    return h.response(user).code(200);
  } catch (error) {
    return h.response({ error: error.message }).code(500);
  }
};

// Update user
const updateUser = async (request, h) => {
  try {
    const { id } = request.params;
    const { name, email, role } = request.payload;
    
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return h.response({ error: 'User tidak ditemukan' }).code(404);
    }
    return h.response(user).code(200);
  } catch (error) {
    return h.response({ error: error.message }).code(500);
  }
};

// Delete user
const deleteUser = async (request, h) => {
  try {
    const user = await User.findByIdAndDelete(request.params.id);
    if (!user) {
      return h.response({ error: 'User tidak ditemukan' }).code(404);
    }
    return h.response({ message: 'User berhasil dihapus' }).code(200);
  } catch (error) {
    return h.response({ error: error.message }).code(500);
  }
};

export default [
  {
    method: 'GET',
    path: '/users',
    handler: getAllUsers,
    options: {
      tags: ['api', 'Users'],
      description: 'Dapatkan semua users',
    },
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: getUserById,
    options: {
      tags: ['api', 'Users'],
      description: 'Dapatkan user berdasarkan ID',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: 'PUT',
    path: '/users/{id}',
    handler: isAdmin(updateUser),
    options: {
      tags: ['api', 'Users'],
      description: 'Update user (khusus admin)',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          name: Joi.string(),
          email: Joi.string().email(),
          role: Joi.string().valid('admin', 'sales'),
        }),
      },
    },
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: isAdmin(deleteUser),
    options: {
      tags: ['api', 'Users'],
      description: 'Hapus user (khusus admin)',
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
  },
];
