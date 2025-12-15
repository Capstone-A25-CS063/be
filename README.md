# Bank Marketing Backend API

Backend API untuk sistem **prioritisasi nasabah deposito berjangka** berbasis Machine Learning.  
Aplikasi ini dipakai oleh tim sales & admin bank untuk mengelola data nasabah, melihat skor potensi, dan mencatat hasil panggilan.

## Fitur Utama
- Manajemen nasabah (CRUD dasar)
- Integrasi dengan ML API untuk prediksi potensi nasabah
- Otentikasi JWT untuk akses endpoint
- Import massal CSV/Excel untuk prediksi batch
- Dokumentasi API via Swagger

## Tech Stack
- Node.js
- Hapi.js (web framework)
- MongoDB + Mongoose
- JWT Authentication
- Swagger (hapi-swagger)
- External ML API (FastAPI)

## Persiapan & Menjalankan Proyek (Quick Start)

1. Clone repository
```bash
git clone https://github.com/Capstone-A25-CS063/be.git
cd be
```

2. Install dependensi
```bash
npm install
```

3. Salin file environment dan sesuaikan
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi: DB, JWT_SECRET, ML_API_URL, dll.
```

4. Jalankan server (development)
```bash
npm run start
```

5. Buka dokumentasi Swagger
```
http://localhost:3000/documentation
```

## Struktur Endpoint (Ringkasan)

Authentication
- POST /auth/login — Login dan dapatkan JWT
- POST /auth/register — Registrasi user baru (khusus admin)

Customer Endpoints
- POST /customers — Tambah nasabah baru (otomatis panggil ML API untuk prediksi)
- GET /customers — Ambil daftar nasabah (support: search, filter, pagination)
- GET /customers/{id} — Detail nasabah
- PATCH /customers/{id}/status — Update status: callStatus, decisionStatus
- POST /customers/import-batch — Upload CSV/Excel untuk prediksi massal (admin only)