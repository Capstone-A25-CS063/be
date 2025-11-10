import { protect } from '../middleware/auth.js';
import { importCsv } from '../controllers/import.controller.js';

export default [
  {
    method: 'POST',
    path: '/import/csv',
    options: { payload: { parse: true, allow: 'application/octet-stream' } },
    handler: protect(importCsv)
  }
];
