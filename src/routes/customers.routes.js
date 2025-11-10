import Joi from 'joi';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import {
  listCustomers,
  getCustomerDetail,
  updateCustomer,
  createCustomer,
  updateCustomerStatus,
  importBatch
} from '../controllers/customers.controller.js';

export default [
  {
    method: 'POST',
    path: '/customers',
    options: {
      tags: ['api', 'Customers'],
      description: 'Buat nasabah baru dan kirim ke model ML untuk analisis',
      notes: 'Hanya admin yang dapat menambahkan nasabah baru',
      handler: isAdmin(createCustomer),
      validate: {
        payload: Joi.object({
          nama_nasabah: Joi.string().required(),
          nomor_telepon: Joi.string().required(),
          age: Joi.number().required(),
          job: Joi.string().required(),
          marital: Joi.string().required(),
          education: Joi.string().required(),
          default: Joi.string().required(),
          housing: Joi.string().required(),
          loan: Joi.string().required(),
          contact: Joi.string().required(),
          month: Joi.string().required(),
          day_of_week: Joi.string().required(),
          campaign: Joi.number().required(),
          pdays: Joi.number().required(),
          previous: Joi.number().required(),
          poutcome: Joi.string().required()
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/customers',
    options: {
      tags: ['api', 'Customers'],
      description: 'Ambil daftar nasabah (dengan search & filter)',
      handler: protect(listCustomers),
      validate: {
        query: Joi.object({
          search: Joi.string().optional(),
          status: Joi.string().optional(),
          prediction: Joi.string().optional(),
          page: Joi.number().default(1),
          limit: Joi.number().default(20)
        })
      }
    }
  },
  {
    method: 'GET',
    path: '/customers/{id}',
    options: {
      tags: ['api', 'Customers'],
      description: 'Ambil detail nasabah berdasarkan ID',
      handler: protect(getCustomerDetail),
      validate: {
        params: Joi.object({
          id: Joi.string().required()
        })
      }
    }
  },
  {
    method: 'PATCH',
    path: '/customers/{id}',
    options: {
      tags: ['api', 'Customers'],
      description: 'Update status internal nasabah (new/contacted/interested)',
      handler: protect(updateCustomer),
      validate: {
        params: Joi.object({ id: Joi.string().required() }),
        payload: Joi.object({
          status: Joi.string().optional(),
          salesNotes: Joi.string().allow('')
        })
      }
    }
  },
  {
    method: 'PATCH',
    path: '/customers/{id}/status',
    options: {
      tags: ['api', 'Customers'],
      description: 'Update callStatus, decisionStatus, dan catatan nasabah',
      handler: protect(updateCustomerStatus),
      validate: {
        params: Joi.object({ id: Joi.string().required() }),
        payload: Joi.object({
          callStatus: Joi.string().allow(''),
          decisionStatus: Joi.string().allow(''),
          catatan: Joi.string().allow('')
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/customers/import-batch',
    options: {
      tags: ['api', 'Customers'],
      description: 'Import data nasabah dari file CSV/XLSX (batch ML prediction)',
      notes: 'Hanya admin yang dapat mengunggah file batch',
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024
      },
      handler: isAdmin(importBatch)
    }
  }
];
