# Hệ Thống Quản Lý Cơm Nắm (QLCN)

## Tổng Quan

Đây là hệ thống phần mềm quản lý chuỗi cơm nắm (cơm cháy) hoạt động theo mô hình **đa chi nhánh**, phục vụ quản lý từ **Tổng Công Ty → Chi Nhánh → Phòng Ban → Nhân Viên**.

Xem [SPEC.md](./SPEC.md) để biết chi tiết đầy đủ về hệ thống.

---

## Cấu Trúc Thư Mục

```
d:\Other\QLCN
├── SPEC.md                      # Tài liệu đặc tả chi tiết
├── README.md                    # File này
├── Untitled spreadsheet.xlsx    # Dữ liệu mẫu từ Excel
│
├── .cursor/
│   ├── agents/                 # Các agents
│   │   ├── AGENT_001_DevOps.md
│   │   ├── AGENT_002_Auth.md
│   │   ├── AGENT_003_UI_UX.md
│   │   ├── AGENT_004_Import_Export.md
│   │   ├── AGENT_005_Inventory.md
│   │   ├── AGENT_006_Production.md
│   │   ├── AGENT_007_Salary.md
│   │   ├── AGENT_008_Cost.md
│   │   └── AGENT_009_Reports.md
│   │
│   └── tasks/                  # Các tasks
│       ├── TASK_001_Project_Setup.md
│       ├── TASK_002_Database_Schema.md
│       ├── TASK_003_Auth_System.md
│       ├── TASK_004_UI_Components.md
│       ├── TASK_005_Products_Module.md
│       ├── TASK_006_Import_Export_Module.md
│       ├── TASK_007_Production_Module.md
│       ├── TASK_008_Salary_Module.md
│       ├── TASK_009_Cost_Module.md
│       ├── TASK_010_Reports_Module.md
│       └── TASK_011_Docker_Deployment.md
│
└── qlcn-app/                   # Project code (sẽ được tạo sau)
```

---

## Danh Sách Agents

| Agent | Mô tả | Phụ trách |
|-------|-------|-----------|
| **AGENT_001_DevOps** | Setup project, Docker, CI/CD | TASK_001, TASK_002, TASK_011 |
| **AGENT_002_Auth** | Authentication & Authorization | TASK_003 |
| **AGENT_003_UI_UX** | UI Components & Layout | TASK_004 |
| **AGENT_004_Import_Export** | Module Nhập/Xuất Hàng | TASK_005, TASK_006 |
| **AGENT_005_Inventory** | Module Tồn Kho | (integrated in TASK_006) |
| **AGENT_006_Production** | Module Năng Suất | TASK_007 |
| **AGENT_007_Salary** | Module Lương & Thưởng | TASK_008 |
| **AGENT_008_Cost** | Module Chi Phí | TASK_009 |
| **AGENT_009_Reports** | Module Báo Cáo & Dashboard | TASK_010 |

---

## Danh Sách Tasks

### Phase 1: Foundation (Critical)

| Task | Tên | Agent | Thời gian | Priority |
|------|------|-------|-----------|----------|
| **TASK_001** | Project Setup | AGENT_001_DevOps | 2-3h | CRITICAL |
| **TASK_002** | Database Schema | AGENT_001_DevOps | 3-4h | CRITICAL |
| **TASK_003** | Auth System | AGENT_002_Auth | 4-5h | CRITICAL |
| **TASK_004** | UI Components | AGENT_003_UI_UX | 5-6h | HIGH |

### Phase 2: Core Modules

| Task | Tên | Agent | Thời gian | Priority |
|------|------|-------|-----------|----------|
| **TASK_005** | Products Module | AGENT_004_Import_Export | 3-4h | HIGH |
| **TASK_006** | Import/Export Module | AGENT_004_Import_Export | 6-8h | HIGH |
| **TASK_007** | Production Module | AGENT_006_Production | 5-6h | HIGH |

### Phase 3: Secondary Modules

| Task | Tên | Agent | Thời gian | Priority |
|------|------|-------|-----------|----------|
| **TASK_008** | Salary Module | AGENT_007_Salary | 5-6h | MEDIUM |
| **TASK_009** | Cost Module | AGENT_008_Cost | 4-5h | MEDIUM |
| **TASK_010** | Reports Module | AGENT_009_Reports | 5-6h | MEDIUM |

### Phase 4: Deployment

| Task | Tên | Agent | Thời gian | Priority |
|------|------|-------|-----------|----------|
| **TASK_011** | Docker Deployment | AGENT_001_DevOps | 3-4h | HIGH |

---

## Thứ Tự Thực Hiện

```
TASK_001 (Project Setup)
        │
        ▼
TASK_002 (Database Schema)
        │
        ▼
TASK_003 (Auth System) ──────────┐
        │                          │
        ▼                          │
TASK_004 (UI Components)          │
        │                          │
        ▼                          │
TASK_005 (Products)               │
        │                          │
        ▼                          │
TASK_006 (Import/Export) ─────────┼──► All Modules
        │                          │
        ▼                          │
TASK_007 (Production)             │
        │                          │
        ▼                          │
TASK_008 (Salary)                 │
        │                          │
        ▼                          │
TASK_009 (Cost)                   │
        │                          │
        ▼                          │
TASK_010 (Reports)                │
        │                          │
        ▼                          │
TASK_011 (Docker Deployment)
```

---

## Lộ Trình Phát Triển

| Phase | Nội dung | Tasks | Thời gian |
|-------|----------|-------|-----------|
| **Phase 1** | Foundation + Auth + UI | 001, 002, 003, 004 | 14-18h |
| **Phase 2** | Core Modules | 005, 006, 007 | 14-18h |
| **Phase 3** | Secondary Modules | 008, 009, 010 | 14-17h |
| **Phase 4** | Deployment | 011 | 3-4h |
| **Tổng** | | **11 tasks** | **44-57h** |

---

## Công Nghệ Sử Dụng

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16.2+ (App Router), TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL 15+ |
| **Auth** | NextAuth.js v5, JWT |
| **State** | TanStack Query (React Query), Zustand |
| **UI** | Radix UI, shadcn/ui |
| **Deployment** | Docker, Docker Compose, Nginx |

---

## Phân Quyền Hệ Thống

| Cấp bậc | Vai trò | Quyền hạn chính |
|----------|---------|-------------------|
| **Cấp 1** | Tổng Giám Đốc (ADMIN) | Toàn quyền trên tất cả |
| **Cấp 2** | Giám Đốc Chi Nhánh (BRANCH_DIRECTOR) | Quản lý chi nhánh được phân công |
| **Cấp 3** | Trưởng Phòng (DEPARTMENT_HEAD) | Quản lý phòng ban |
| **Cấp 4** | Nhân Viên (EMPLOYEE) | Chỉ nhập năng suất, xem lương cá nhân |

---

## Các Module Chính

1. **Nhập Hàng** - Quản lý nhập nguyên liệu/sản phẩm
2. **Xuất Hàng** - Quản lý bán hàng, doanh thu
3. **Tồn Kho** - Theo dõi tồn kho theo thời gian thực
4. **Năng Suất** - Chấm công theo ca, số nắm làm được
5. **Lương & Thưởng** - Tính lương, phụ cấp, thưởng/phạt
6. **Chi Phí** - Quản lý chi phí cố định và biến đổi
7. **Báo Cáo** - Báo cáo NXT, doanh thu, lương, chi phí
8. **Dashboard** - Tổng quan hoạt động kinh doanh

---

## Quick Start

### Yêu Cầu
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (hoặc dùng Docker)

### Setup Development

```bash
# 1. Create Next.js project
npx create-next-app@latest qlcn-app \
  --typescript --tailwind --eslint \
  --app --src-dir --import-alias "@/*" --use-npm

# 2. Install dependencies
cd qlcn-app
npm install prisma @prisma/client next-auth@beta bcryptjs zod
npm install @tanstack/react-query zustand recharts date-fns
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-table

# 3. Initialize Prisma
npx prisma init

# 4. Copy schema từ SPEC.md vào prisma/schema.prisma

# 5. Setup environment
cp .env.example .env

# 6. Run migrations
npx prisma migrate dev --name init

# 7. Seed data
npx prisma db seed

# 8. Start development
npm run dev
```

### Docker Deployment

```bash
# Build và run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed data
docker-compose exec app npx prisma db seed

# Xem logs
docker-compose logs -f
```

---

## Default Credentials (Sau khi seed)

| Vai trò | Username | Password |
|---------|----------|---------|
| Admin (Tổng GD) | admin | admin123 |
| GD Chi Nhánh | gdcn | gdcn123 |

**Important:** Thay đổi mật khẩu ngay sau khi đăng nhập lần đầu!

---

## Tài Liệu Tham Khảo

- [SPEC.md](./SPEC.md) - Tài liệu đặc tả chi tiết
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [NextAuth.js Documentation](https://authjs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Liên Hệ & Hỗ Trợ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng:
1. Đọc kỹ SPEC.md và README này
2. Kiểm tra task tương ứng để hiểu rõ requirements
3. Xem lại code mẫu trong từng task file

---

*Lưu ý: Document này sẽ được cập nhật trong quá trình phát triển.*
*Phiên bản: 1.0*
*Ngày tạo: 2026-06-13*
