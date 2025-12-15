import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customers.routes.js';
import importRoutes from './routes/import.routes.js';
import userRoutes from './routes/users.routes.js';

// 🧩 Tambahkan plugin pendukung untuk swagger
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';
import Pack from '../package.json' assert { type: 'json' };

dotenv.config();
await connectDB();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost',
    routes: { cors: true }
  });

  // ⚙️ Swagger setup
  const swaggerOptions = {
    info: {
      title: '📘 Bank Marketing Backend API',
      version: Pack.version,
      description: 'Dokumentasi API untuk sistem prediksi nasabah deposito berjangka.',
    },
    grouping: 'tags',
  };

  // ✅ Register plugins
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  // ✅ Register routes kamu
  server.route([...authRoutes, ...customerRoutes, ...importRoutes, ...userRoutes]);

  await server.start();
  console.log(`🚀 Server running at ${server.info.uri}`);
  console.log(`📘 Swagger docs available at: ${server.info.uri}/documentation`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
