import { parse } from 'csv-parse/sync';
import Customer from '../models/customer.model.js';
import { computeScore } from '../utils/scoring.js';

export const importCsv = async (request, h) => {
  const csvText = request.payload?.toString();
  if (!csvText) return h.response({ message: 'No CSV payload' }).code(400);

  const records = parse(csvText, { columns: true, skip_empty_lines: true });

  const docs = records.map(r => ({
    age: Number(r.age),
    job: r.job,
    marital: r.marital,
    education: r.education,
    housing: r.housing,
    loan: r.loan,
    month: r.month,
    duration: Number(r.duration),
    dayOfWeek: r.day_of_week,
    euribor3m: Number(r.euribor3m),
    y: r.y,
    score: computeScore(r)
  }));

  await Customer.insertMany(docs);
  return { imported: docs.length };
};
