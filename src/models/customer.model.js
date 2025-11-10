import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  nama_nasabah: String,
  nomor_telepon: String,
  age: Number,
  job: String,
  marital: String,
  education: String,
  default: String,
  housing: String,
  loan: String,
  contact: String,
  month: String,
  day_of_week: String,
  campaign: Number,
  pdays: Number,
  previous: Number,
  poutcome: String,
  prediction: String,
  score: String,
  salesNotes: String,
  catatan: { type: String, default: '' },
  status: {
    type: String,
    default: 'new'
  },
  callStatus: {
    type: String,
    default: 'not_called'
  },
  decisionStatus: {
    type: String,
    default: 'undecided'
  },

}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
