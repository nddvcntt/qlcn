# Hướng Dẫn Deploy Demo Next.js lên Vercel

> ⏱️ **Thời gian ước tính:** 15-20 phút (chưa tính thời gian setup database)
> 💰 **Chi phí:** $0 (free tier) - đủ cho demo

---

## 🎯 Tổng Quan

Vercel là nơi deploy Next.js tốt nhất (cũng là công ty tạo ra Next.js). Hỗ trợ:
- ✅ Auto-detect Next.js project
- ✅ Free SSL, CDN global
- ✅ Auto-deploy từ Git
- ✅ Preview URLs cho mỗi PR

**Điều kiện cần:**
- Tài khoản GitHub (project đã push lên rồi ✅)
- Tài khoản Vercel (đăng ký miễn phí bằng GitHub)
- Database PostgreSQL cloud (Vercel Postgres, Neon, hoặc Supabase)

---

## 📋 Bước 1: Chuẩn Bị Database Cloud

Vì Vercel không hỗ trợ SQLite lâu dài (ephemeral filesystem), bạn **cần PostgreSQL cloud**. Options:

### Option A: Neon.tech (Khuyến nghị - Free tier tốt nhất)

1. Vào https://neon.tech → **Sign up** bằng GitHub
2. Click **Create Project** → đặt tên `qlcn-demo`
3. Chọn region: **Singapore** (gần VN nhất)
4. Lấy **Connection String**:
   - Click vào project → **Connection Details**
   - Chọn **Connection string** (không phải Pooler cho serverless)
   - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/qlcn?sslmode=require`
   - **Lưu lại** chuỗi này

### Option B: Vercel Postgres (Đơn giản nhất)

1. Sau khi tạo Vercel project (Bước 2), vào tab **Storage**
2. Click **Create Database** → chọn **Postgres**
3. Vercel tự động add `POSTGRES_URL` vào env

### Option C: Supabase

1. Vào https://supabase.com → **New Project**
2. Lấy connection string từ **Settings → Database**

---

## 📋 Bước 2: Tạo Vercel Project

### Cách 1: Qua Web UI (Khuyến nghị cho lần đầu)

1. Vào https://vercel.com → **Sign Up** bằng GitHub
2. Click **Add New... → Project**
3. **Import** repository `nddvcntt/qlcn`
4. Cấu hình:
   - **Framework Preset:** Next.js (auto-detect)
   - **Root Directory:** `qlcn-app` ← **QUAN TRỌNG!**
   - **Build Command:** `prisma generate && next build` ← **Sửa lại**
   - **Output Directory:** `.next` (mặc định)
   - **Install Command:** `npm install`

### Cách 2: Qua CLI (Nhanh hơn)

```bash
# Cài Vercel CLI
npm i -g vercel

# Login
vercel login

# Trong thư mục qlcn-app
cd qlcn-app
vercel

# Trả lời:
# ? Set up and deploy? Y
# ? Which scope? [Your account]
# ? Link to existing project? N
# ? What's your project's name? qlcn-demo
# ? In which directory is your code located? ./
# ? Override settings? Y
# ? Build Command: prisma generate && next build
# ? Output Directory: .next
# ? Development Command: next dev
```

---

## 📋 Bước 3: Cấu Hình Environment Variables

Trong Vercel Dashboard → Project → **Settings** → **Environment Variables**, thêm:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Connection string từ Neon | `postgresql://user:pass@ep-xxx.region.aws.neon.tech/qlcn?sslmode=require` |
| `NEXTAUTH_SECRET` | Random 32 chars | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL Vercel project | `https://qlcn-demo.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | URL Vercel project | `https://qlcn-demo.vercel.app` |

**Lưu ý:** Áp dụng cho cả 3 môi trường (Production, Preview, Development).

---

## 📋 Bước 4: Update Prisma Schema cho PostgreSQL

⚠️ **QUAN TRỌNG:** Schema hiện đang dùng SQLite. Cần đổi sang PostgreSQL cho Vercel.

### Cách 1: Tạo schema riêng cho production (An toàn)

Tạo file `prisma/schema.production.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... copy toàn bộ models từ schema.prisma
```

Sau đó dùng:
```bash
DATABASE_URL="your-postgres-url" npx prisma db push --schema=prisma/schema.production.prisma
```

### Cách 2: Sửa schema chính (Đơn giản hơn)

Sửa `prisma/schema.prisma`:

```prisma
// Trước:
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Sau:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Cảnh báo:** Nếu sửa cách này, dev local cũng phải dùng PostgreSQL. Nên dùng **Cách 1** để giữ SQLite cho dev.

### Cách 3: Dùng multiple schema files (Best practice)

Trong `package.json`:
```json
{
  "scripts": {
    "db:push:dev": "prisma db push --schema=prisma/schema.dev.prisma",
    "db:push:prod": "prisma db push --schema=prisma/schema.prod.prisma",
    "build": "prisma generate --schema=prisma/schema.prod.prisma && next build"
  }
}
```

---

## 📋 Bước 5: Deploy

### Auto-deploy từ Git (Khuyến nghị)

Mỗi lần push code, Vercel tự động deploy:
```bash
git add .
git commit -m "feat: production config"
git push origin main
# → Vercel tự động build & deploy
# → URL: https://qlcn-demo.vercel.app
```

### Manual deploy

```bash
cd qlcn-app
vercel --prod
```

---

## 📋 Bước 6: Run Migrations & Seed Data

### Cách 1: Qua Vercel CLI (Nhanh)

```bash
# Pull env từ Vercel
vercel env pull .env.production.local

# Chạy migration
npx prisma db push

# Seed data
npx prisma db seed
```

### Cách 2: Qua Neon SQL Editor

1. Vào Neon Dashboard → SQL Editor
2. Paste nội dung `prisma/migrations/xxx_init.sql` (nếu có)
3. Hoặc dùng `prisma db push` để tự generate SQL

### Cách 3: Qua script seed tự động

Tạo file `prisma/auto-seed.ts` chạy sau migration.

---

## 📋 Bước 7: Verify

Sau khi deploy xong:

1. **Truy cập URL** (ví dụ `https://qlcn-demo.vercel.app`)
2. **Login** với `admin` / `admin123` (nếu đã seed)
3. **Test các module:**
   - ✅ Dashboard
   - ✅ Products
   - ✅ Import/Export Orders
   - ✅ Production
   - ✅ Salary
   - ✅ Costs
   - ✅ Reports
   - ✅ Users Management

---

## 🔧 Troubleshooting

### Lỗi: "PrismaClientInitializationError"

**Nguyên nhân:** `DATABASE_URL` sai hoặc schema chưa push.

**Fix:**
```bash
vercel env pull .env.production.local
npx prisma db push
```

### Lỗi: "Module not found: Can't resolve '@prisma/client'"

**Nguyên nhân:** Build command không chạy `prisma generate`.

**Fix:** Sửa Build Command trong Vercel:
```
prisma generate && next build
```

### Lỗi: "Application error: a server-side exception"

**Nguyên nhân:** Thường do Prisma binary không tương thích Vercel runtime.

**Fix:** Thêm vào `next.config.ts`:
```typescript
serverExternalPackages: ["@prisma/client", "bcryptjs"]
```

### Lỗi: "Function execution timed out"

**Nguyên nhân:** Vercel free tier timeout 10s.

**Fix:** Upgrade Vercel Pro (có 60s timeout) hoặc optimize queries.

### Database connection pool exhausted

**Fix:** Dùng **Connection Pooler URL** thay vì direct connection. Neon cung cấp:
- `-pooler` suffix: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/qlcn?sslmode=require`

---

## 📊 Free Tier Limits

| Service | Limit | Đủ cho demo? |
|---------|-------|--------------|
| **Vercel** | 100GB bandwidth/tháng | ✅ |
| **Vercel Functions** | 100GB-hours | ✅ |
| **Neon** | 0.5GB storage, 190 compute hours | ✅ |
| **Vercel Postgres** | 256MB, 60h compute | ✅ |

---

## 🚀 Production Hardening (Optional)

Khi muốn lên production thật:

1. **Domain riêng:** Vercel → Settings → Domains (free)
2. **SSL:** Auto (Vercel cung cấp Let's Encrypt)
3. **Monitoring:** Vercel Analytics (free tier)
4. **Error tracking:** Sentry (`@sentry/nextjs`)
5. **Backup database:** Neon tự động backup 7 ngày
6. **Rate limiting:** Vercel tích hợp sẵn
7. **SEO:** Next.js Metadata API (đã có sẵn)

---

## 💡 Tips

- **Demo URL share:** Mỗi PR tạo preview URL riêng → share cho stakeholder
- **Custom domain:** Mua ở Namecheap (~200k/năm) hoặc Cloudflare Registrar
- **CI/CD:** Auto-deploy từ Git đã có sẵn
- **Rollback:** Vercel → Deployments → Click version cũ → Promote

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Next.js Deployment:** https://nextjs.org/docs/app/building-your-application/deploying
- **Prisma + Vercel:** https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel

---

*Happy deploying! 🚀*
