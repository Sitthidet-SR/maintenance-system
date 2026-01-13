# 🔧 ระบบแจ้งซ่อมบำรุง (Maintenance System)

ระบบแจ้งซ่อมบำรุงอุปกรณ์สำหรับองค์กร พัฒนาด้วย Go (Backend) และ Next.js (Frontend)

## ✨ ฟีเจอร์หลัก

- 📝 แจ้งซ่อมบำรุงอุปกรณ์ พร้อมระบุหมวดหมู่และความสำคัญ
- 👤 ระบบสมาชิก (ผู้ใช้, ช่าง, แอดมิน)
- 🌐 รองรับ 2 ภาษา (ไทย / อังกฤษ)
- 🔔 แจ้งเตือนแบบ Real-time
- 📊 Dashboard สรุปสถานะงานซ่อม

## 🛠️ เทคโนโลยี

**Backend:**

- Go + Gin Framework
- PostgreSQL + GORM
- JWT Authentication
- WebSocket

**Frontend:**

- Next.js 15 + TypeScript
- Tailwind CSS
- Zustand (State Management)
- shadcn/ui

## 🚀 วิธีรัน

### 1. รัน Database (Docker)

```bash
docker-compose up -d postgres redis
```

### 2. รัน Backend

```bash
cd services/api
cp .env.example .env
go run ./cmd/api
```

### 3. รัน Frontend

```bash
cd apps/web
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## 📁 โครงสร้างโปรเจค

```
maintenance-system/
├── apps/
│   └── web/          # Next.js Frontend
├── services/
│   └── api/          # Go Backend
└── docker-compose.yml
```

## 👨‍💻 ผู้พัฒนา

สร้างโดย **Sitthidet SR**

---

⭐ ถ้าชอบโปรเจคนี้ อย่าลืมกด Star นะครับ!
