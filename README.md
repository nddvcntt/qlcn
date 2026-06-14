# Hệ Thống Quản Lý Cơm Nắm (QLCN)

> **Status:** ✅ Production-Ready Demo | Version 0.1.0 | Last Updated: 2026-06-14

## Tổng Quan

Hệ thống quản lý chuỗi cơm nắm đa chi nhánh, phục vụ quản lý từ **Tổng Công Ty → Chi Nhánh → Phòng Ban → Nhân Viên**.

Xem [SPEC.md](./SPEC.md) để biết chi tiết đầy đủ.

---

## 🎯 Tình Trạng Dự Án (2026-06-14)

| Module | Status | Hoàn thiện |
|--------|--------|------------|
| **Foundation** (Setup, DB, Auth, UI) | ✅ Done | 100% |
| **Products** (Module 005) | ✅ Done | 100% |
| **Import/Export Orders** (Module 006) | ✅ Done | 100% |
| **Production/Salary** (Module 007-008) | ✅ Done | 100% |
| **Costs** (Module 009) | ✅ Done | 100% |
| **Reports & Dashboard** (Module 010) | ✅ Done | 100% |
| **Users Management** (Module 014) | ✅ Done | 100% |
| **API Security Hardening** (Module 016) | ✅ Done | 100% |
| **Docker Deployment** (Module 011) | ✅ Done | 100% |
| **E2E Tests** (Module 015) | ⏳ Pending | 0% |
| **Excel Import** (Module 016) | ⏳ Pending | 0% |

**Build:** ✅ PASS (28 routes) | **Lint:** ✅ 0 errors | **Security:** ✅ Auth + RBAC + Branch isolation

---

## 🚀 Quick Start (3 cách)

### Option 1: Local Development (SQLite - Nhanh nhất)

```bash
cd qlcn-app
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
# → http://localhost:3000
```

**Default accounts:**
- `admin` / `admin123` (Tổng GD)
- `gdcn` / `gdcn123` (GD Chi Nhánh)

### Option 2: Docker Production (PostgreSQL)

```bash
cd qlcn-app

# 1. Generate secrets
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.production
# Edit .env.production - đổi POSTGRES_PASSWORD

# 2. Build và run
docker-compose --env-file .env.production up -d

# 3. Run migrations (first time only)
docker-compose exec app npx prisma db push

# 4. Seed data (optional)
docker-compose exec app npx prisma db seed

# 5. Xem logs
docker-compose logs -f app
```

**App:** http://localhost:3000

### Option 3: Deploy Demo lên Vercel (Free) ⭐

Xem chi tiết ở **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)**

```bash
# Cài Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd qlcn-app
vercel
```

⚠️ **Lưu ý Vercel:**
- Vercel **không hỗ trợ SQLite** lâu dài - cần dùng database cloud (Vercel Postgres, Neon, Supabase)
- Cho demo nhanh: dùng **Neon.tech** (PostgreSQL free tier) - xem hướng dẫn chi tiết trong [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

---

## 📁 Cấu Trúc Thư Mục

```
d:\Other\QLCN
├── SPEC.md                        # Tài liệu đặc tả chi tiết
├── README.md                      # File này
├── DEPLOY_VERCEL.md               # Hướng dẫn deploy Vercel
├── AGENTS.md                      # Multi-agent definitions
├── CLAUDE.md                      # Claude/AI context
├── TASKS.md                       # Task status
├── E2E_TEST_REPORT.md             # Báo cáo test
│
├── qlcn-app/                      # Next.js application
│   ├── Dockerfile                 # Production Docker
│   ├── docker-compose.yml         # Postgres + App
│   ├── .env.example               # Dev env template
│   ├── .env.production.example    # Prod env template
│   ├── next.config.ts             # Standalone output
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (SQLite for dev)
│   │   └── seed.ts                # Seed data
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/       # Protected routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   ├── import-orders/
│   │   │   │   ├── export-orders/
│   │   │   │   ├── production/
│   │   │   │   ├── salary/
│   │   │   │   ├── costs/
│   │   │   │   ├── reports/
│   │   │   │   ├── users/
│   │   │   │   ├── selling-points/
│   │   │   │   └── work-schedule/
│   │   │   ├── api/               # API routes (auth-protected)
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── products/
│   │   │   │   ├── import-orders/
│   │   │   │   ├── export-orders/
│   │   │   │   ├── production/
│   │   │   │   ├── salary/
│   │   │   │   ├── costs/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── work-schedule/
│   │   │   │   ├── selling-points/
│   │   │   │   └── health/
│   │   │   ├── login/
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   ├── lib/                   # auth, prisma, rbac
│   │   └── proxy.ts               # NextAuth middleware
│   └── e2e/                       # Playwright tests
```

---

## 🔒 Bảo Mật

| Layer | Implementation |
|-------|----------------|
| **Auth** | NextAuth.js v5 (Credentials Provider + JWT) |
| **Session** | Encrypted JWT, 7-day expiry |
| **Password** | bcryptjs, 10 rounds |
| **RBAC** | 4 roles: ADMIN, BRANCH_DIRECTOR, DEPARTMENT_HEAD, EMPLOYEE |
| **Branch Isolation** | `canAccessBranch(userRole, userBranchId, targetBranchId)` |
| **API Protection** | All routes check `auth()` + role + ownership |
| **Middleware** | `src/proxy.ts` redirects unauth users to `/login` |
| **CORS/CSRF** | NextAuth built-in |

**Pattern chuẩn cho mọi API route:**
```typescript
const session = await auth()
if (!session) return 401

// Force branchId từ session, không nhận từ client
const userBranchId = session.user.branchId
if (userRole !== "ADMIN" && targetBranchId !== userBranchId) {
  return 403
}
```

---

## 👥 Phân Quyền (RBAC)

| Role | Quyền hạn |
|------|-----------|
| **ADMIN** (Tổng GD) | Toàn quyền tất cả dữ liệu, tất cả chi nhánh |
| **BRANCH_DIRECTOR** | Toàn quyền trong chi nhánh được phân công |
| **DEPARTMENT_HEAD** | Quản lý phòng ban trong chi nhánh |
| **EMPLOYEE** | Chỉ NS cá nhân, xem lương cá nhân |

**BRANCH_DIRECTOR có thể CRUD:**
- ✅ DEPARTMENT_HEAD (trong chi nhánh mình)
- ✅ EMPLOYEE (trong chi nhánh mình)
- ❌ ADMIN, BRANCH_DIRECTOR khác

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16.2.9 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, Radix UI, shadcn/ui pattern |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | SQLite (dev) / PostgreSQL 16 (prod) |
| **ORM** | Prisma 6.8 |
| **Auth** | NextAuth.js v5 (beta), JWT |
| **State** | TanStack Query 5, Zustand 5 |
| **Forms** | React Hook Form 7, Zod validation |
| **Charts** | Recharts 3 |
| **Testing** | Vitest (unit), Playwright (E2E - partial) |
| **Deployment** | Docker, Vercel, Nginx |

---

## 📊 Công Thức Lương

**Lương cơ bản theo ca (SellingPoint.group):**
- `GROUP_1` (Xa): 80,000đ/ca
- `GROUP_2` (Gần): 70,000đ/ca

**Thưởng cơm nắm (Product.bonusPerUnit):**
- Bán ≥ 50 suất/ca → 500đ × số suất bán được

**Công thức tổng lương:**
```
totalSalary = baseSalary + bonusAmount + commissionAmount
netSalary   = totalSalary + allowances - deductions - advanceAmount
```

---

## 🧪 Test

```bash
# Unit tests
npm run test

# E2E tests (partial)
npx playwright test

# Build verification
npm run build && npm run lint
```

**Current status:**
- ✅ Build: PASS
- ✅ Lint: 0 errors (149 warnings - pre-existing)
- ⏳ E2E: partial (login + dashboard)

---

## 🌐 Environment Variables

### Development (`.env` - SQLite)
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Production (`.env.production` - PostgreSQL)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://your-domain.com"
```

Xem `.env.production.example` để biết đầy đủ.

---

## 🐛 Known Issues / Limitations

| # | Issue | Workaround |
|---|-------|------------|
| 1 | 149 lint warnings (mostly `any` types) | Pre-existing, không block production |
| 2 | E2E tests chưa full coverage | Manual test cho production |
| 3 | Excel import chưa có UI | Dùng `scripts/importExcel.ts` |
| 4 | Vercel deployment cần PostgreSQL cloud | Dùng Neon.tech free tier |
| 5 | AuditLog/PriceHistory chưa wire UI | Schema ready, chưa expose |

---

## 📝 License

Private project - Internal use only.

---

## 🤝 Liên Hệ & Hỗ Trợ

1. Đọc [SPEC.md](./SPEC.md) và [AGENTS.md](./AGENTS.md)
2. Kiểm tra [TASKS.md](./TASKS.md) cho task status
3. Xem [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) cho hướng dẫn deploy
4. Xem [E2E_TEST_REPORT.md](./E2E_TEST_REPORT.md) cho test report

---

*Phiên bản: 0.1.0 | Ngày cập nhật: 2026-06-14*
