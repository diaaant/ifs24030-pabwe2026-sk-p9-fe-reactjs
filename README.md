# Delcom Blog — Frontend (ReactJS + Vite)

SPA multi-tier (Publik, Penulis `/author`, Admin `/admin`) dengan Tailwind CSS,
Toast UI Editor/Viewer, SweetAlert2, dan Tabler Icons.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5174 (proxy /api -> http://localhost:8081)
```

Pastikan backend berjalan di port 8081.

## Pengujian (100% statements, branches, functions, lines)

```bash
npm test
```

## Build

```bash
npm run build      # hasil di dist/, siap di-host statis (Vercel/Netlify/S3)
```

Untuk deploy terpisah dari backend, arahkan `/api` ke server API melalui reverse
proxy hosting statis Anda (CORS backend sudah aktif).
