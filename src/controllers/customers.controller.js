import axios from 'axios';
import Customer from '../models/customer.model.js';
import Joi from 'joi';
import FormData from 'form-data';
import { createCustomerSchema } from '../schemas/customer-input.schema.js';

export const listCustomers = async (request, h) => {
  try {
    const {
      search,
      status,
      prediction,
      callStatus,
      decisionStatus,
      minScore,
      maxScore,
      minAge,
      maxAge,
      limit = 20,
      page = 1,
    } = request.query;

    const query = {};

    if (search) {
      query.$or = [
        { nama_nasabah: { $regex: search, $options: 'i' } },
        { nomor_telepon: { $regex: search, $options: 'i' } },
        { job: { $regex: search, $options: 'i' } },
        { education: { $regex: search, $options: 'i' } },
        { prediction: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
        { callStatus: { $regex: search, $options: 'i' } },
        { decisionStatus: { $regex: search, $options: 'i' } },
      ];
    }

    //  Filter spesifik berdasarkan parameter
    if (status) query.status = status;
    if (prediction) query.prediction = prediction;
    if (callStatus) query.callStatus = callStatus;
    if (decisionStatus) query.decisionStatus = decisionStatus;

    // Filter umur
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = Number(minAge);
      if (maxAge) query.age.$lte = Number(maxAge);
    }

    // Filter skor (angka dari string "44.3%")
    const scoreFilter = {};
    if (minScore) scoreFilter.$gte = parseFloat(minScore);
    if (maxScore) scoreFilter.$lte = parseFloat(maxScore);

    const skip = (page - 1) * limit;
    const pipeline = [
      {
        $addFields: {
          scoreNum: {
            $toDouble: {
              $substr: [
                "$score",
                0,
                { $subtract: [{ $strLenCP: "$score" }, 1] }
              ]
            }
          }
        }
      },
      { $match: { ...query, ...(Object.keys(scoreFilter).length ? { scoreNum: scoreFilter } : {}) } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) }
    ];

    const [items, totalCount] = await Promise.all([
      Customer.aggregate(pipeline),
      Customer.countDocuments(query)
    ]);

    return h.response({
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      count: items.length,
      data: items
    }).code(200);

  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    return h.response({ message: 'Failed to fetch customers', error: error.message }).code(500);
  }
};



export const getCustomerDetail = async (request, h) => {
  const customer = await Customer.findById(request.params.id);
  if (!customer) return h.response({ message: 'Not found' }).code(404);
  return customer;
};

export const updateCustomer = async (request, h) => {
  const schema = Joi.object({
    status: Joi.string().valid('new','contacted','interested','not_interested'),
    salesNotes: Joi.string().allow('')
  });

  const { error, value } = schema.validate(request.payload);
  if (error) return h.response({ message: error.message }).code(400);

  const updated = await Customer.findByIdAndUpdate(
    request.params.id,
    { ...value, lastCalledAt: new Date() },
    { new: true }
  );
  if (!updated) return h.response({ message: 'Not found' }).code(404);

  return updated;
};

export const createCustomer = async (request, h) => {
  const { error, value } = createCustomerSchema.validate(request.payload);
  if (error) return h.response({ message: error.message }).code(400);

  try {
    const response = await axios.post(process.env.MODEL_API_URL, value, {
      timeout: 8000
    });

    const hasil = response.data;
    const hasilAnalisis = hasil?.hasil_analisis || {};

    const prediction = hasilAnalisis.rekomendasi || 'UNKNOWN';
    const skor = hasilAnalisis.skor_potensi || null;
    const notes = hasilAnalisis.catatan_penting?.join(', ') || null;

    // === Simpan ke MongoDB ===
    const customer = new Customer({
      ...value,
      prediction,       // “HUBUNGI SEGERA” / “JANGAN PRIORITASKAN”
      score: skor,      // “85.2%” kalau mau simpan potensi
      salesNotes: notes // catatan penting dari ML
    });

    await customer.save();

    // === Return hasil lengkap ===
    return h.response({
      message: 'Customer created and analyzed successfully',
      modelResult: hasil,
      data: customer
    }).code(201);

  } catch (err) {
    console.error('❌ Error memanggil model ML:', err.message);

    // fallback kalau model down
    const customer = new Customer({
      ...value,
      prediction: 'UNKNOWN',
      score: null,
      salesNotes: 'Model ML tidak respons'
    });
    await customer.save();

    return h.response({
      message: 'Customer disimpan, tapi model ML gagal dihubungi',
      error: err.message,
      data: customer
    }).code(502);
  }
};

export const importBatch = async (request, h) => {
  try {
    const file = request.payload.file;
    if (!file || !file.hapi) {
      return h.response({ message: 'File tidak ditemukan' }).code(400);
    }

    // Buat form-data untuk dikirim ke ML API
    const formData = new FormData();
    formData.append('file', file._data, {
      filename: file.hapi.filename,
      contentType: file.hapi.headers['content-type']
    });

    // Kirim ke ML API batch endpoint
    const response = await axios.post(`${process.env.MODEL_API_BATCH_URL}`, formData, {
      headers: formData.getHeaders(),
      timeout: 20000
    });

    const hasil = response.data;
    if (!hasil?.hasil_batch) {
      return h.response({ message: 'Tidak ada hasil batch dari model' }).code(400);
    }

    // Simpan hasil prediksi ke MongoDB
    const docs = hasil.hasil_batch.map((row) => ({
      age: Number(row.age),
      job: row.job,
      marital: row.marital,
      education: row.education,
      default: row.default,
      housing: row.housing,
      loan: row.loan,
      contact: row.contact,
      month: row.month,
      day_of_week: row.day_of_week,
      campaign: row.campaign,
      pdays: row.pdays,
      previous: row.previous,
      poutcome: row.poutcome,
      prediction: row.PREDIKSI_REKOMENDASI,
      score: (row.SKOR_PROBABILITAS * 100).toFixed(1) + '%',
      salesNotes: row.CATATAN
    }));

    await Customer.insertMany(docs);

    return h.response({
      message: 'Batch upload sukses',
      imported: docs.length,
      modelSummary: {
        total_data: hasil.total_data,
        data_ekonomi_digunakan: hasil.data_ekonomi_digunakan
      }
    }).code(201);

  } catch (err) {
    console.error('❌ Error saat import batch:', err.message);
    return h.response({ message: 'Gagal import batch', error: err.message }).code(500);
  }
};

export const updateCustomerStatus = async (request, h) => {
  const schema = Joi.object({
    callStatus: Joi.string().allow(''),
    decisionStatus: Joi.string().allow(''),
    catatan: Joi.string().allow('') // 🆕 tambahkan validasi catatan
  });

  const { error, value } = schema.validate(request.payload);
  if (error) return h.response({ message: error.message }).code(400);

  const updated = await Customer.findByIdAndUpdate(request.params.id, value, { new: true });
  if (!updated) return h.response({ message: 'Customer not found' }).code(404);

  return h.response({ message: 'Status updated', data: updated }).code(200);
};
