import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  nama_nasabah: Joi.string().optional(),
  nomor_telepon: Joi.string().optional(),

  age: Joi.number().integer().min(17).max(100).required(),
  job: Joi.string().required(),
  marital: Joi.string().required(),
  education: Joi.string().required(),
  default: Joi.string().required(),
  housing: Joi.string().required(),
  loan: Joi.string().required(),

  contact: Joi.string().required(),
  month: Joi.string().required(),
  day_of_week: Joi.string().required(),
  campaign: Joi.number().integer().min(1).required(),
  pdays: Joi.number().integer().min(0).required(),
  previous: Joi.number().integer().min(0).required(),
  poutcome: Joi.string().required()
});
