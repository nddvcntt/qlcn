# TASKS.md - All Tasks Summary

> **Last Updated:** 2026-06-14 | **Progress:** 14/16 (87.5%)

## Task List

### Foundation Tasks

#### TASK_001: Project Setup ✅ COMPLETED
**Agent**: AGENT_DEV-OPS
**Status**: [x] Completed
**Description**: Setup Next.js 16.2+ với TypeScript, Tailwind, Prisma
**Deliverables**:
- [x] `qlcn-app/` directory structure
- [x] `package.json` với dependencies
- [x] `tailwind.config.ts` với theme colors
- [x] `src/app/` routing structure

#### TASK_002: Database Schema ✅ COMPLETED
**Agent**: AGENT_DEV-OPS
**Status**: [x] Completed
**Description**: Tạo Prisma schema với 14 tables
**Deliverables**:
- [x] `prisma/schema.prisma` - 14 models
- [x] Database migrations
- [x] Seed data script

#### TASK_003: Auth System ✅ COMPLETED
**Agent**: AGENT_AUTH
**Status**: [x] Completed
**Description**: Authentication + RBAC cho 4 cấp
**Deliverables**:
- [x] NextAuth.js config với Credentials provider
- [x] JWT middleware
- [x] RBAC functions
- [x] Login page

### Core Modules

#### TASK_004: UI Components ✅ COMPLETED
**Agent**: AGENT_UI-UX
**Status**: [x] Completed
**Description**: Component library + Layout system
**Deliverables**:
- [x] `src/components/ui/` (Button, Card, Table, Input, Select, Dialog)
- [x] `src/components/layout/` (Sidebar, Topbar)
- [x] Dashboard layout với sidebar navigation
- [x] Theme colors theo SPEC.md

#### TASK_005: Products Module ✅ COMPLETED
**Agent**: AGENT_IMPORT-EXPORT
**Status**: [x] Completed
**Description**: CRUD sản phẩm + bảng giá
**Deliverables**:
- [x] Products API (`/api/products`)
- [x] Products page (`/products`)
- [x] Cấu hình thưởng cơm nắm (≥50 suất = 500đ)
- [x] Cấu hình hoa hồng nước (%)

#### TASK_006: Import/Export Module ✅ COMPLETED
**Agent**: AGENT_IMPORT-EXPORT
**Status**: [x] Completed
**Description**: Phiếu nhập hàng, phiếu xuất hàng
**Deliverables**:
- [x] Import Orders API + UI (`/api/import-orders`, `/import-orders`)
- [x] Export Orders API + UI (`/api/export-orders`, `/export-orders`)
- [x] Auto-update inventory

#### TASK_007: Production Module ✅ COMPLETED
**Agent**: AGENT_PRODUCTION
**Status**: [x] Completed
**Description**: Năng suất lao động, chấm công
**Deliverables**:
- [x] Production API (`/api/production`)
- [x] Production page (`/production`)
- [x] Tính lương tự động theo ngày
- [x] Tính thưởng ≥50 suất

### Secondary Modules

#### TASK_008: Salary Module ✅ COMPLETED
**Agent**: AGENT_SALARY
**Status**: [x] Completed
**Description**: Lương, thưởng, phạt
**Deliverables**:
- [x] Salary API (`/api/salary`) - **với auth + RBAC**
- [x] Salary calculation theo kỳ
- [x] 2-level approval workflow (GD CN → Tổng GD)
- [x] Bảng lương với chi tiết

#### TASK_009: Cost Module ✅ COMPLETED
**Agent**: AGENT_COST
**Status**: [x] Completed
**Description**: Chi phí cố định & biến đổi
**Deliverables**:
- [x] Costs API (`/api/costs`) - **với auth + RBAC**
- [x] Cost categories
- [x] Cost page (`/costs`)

#### TASK_010: Reports Module ✅ COMPLETED
**Agent**: AGENT_REPORTS
**Status**: [x] Completed
**Description**: Báo cáo + Dashboard
**Deliverables**:
- [x] Dashboard API (`/api/dashboard`) - **với auth + branch filter**
- [x] Dashboard page (`/dashboard`) với biểu đồ 14 ngày
- [x] Reports page (`/reports`)
- [x] Inventory page (`/inventory`)

### New Modules (From Requirements)

#### TASK_011: Selling Points Module ✅ COMPLETED
**Agent**: AGENT_IMPORT-EXPORT
**Status**: [x] Completed
**Description**: Quản lý điểm bán với GROUP_1/GROUP_2
**Deliverables**:
- [x] Selling Points API (`/api/selling-points`)
- [x] Selling Points page (`/selling-points`)
- [x] GROUP_1: 80,000đ/ca (Xa), GROUP_2: 70,000đ/ca (Gần)

#### TASK_012: Work Schedule Module ✅ COMPLETED
**Agent**: AGENT_PRODUCTION
**Status**: [x] Completed
**Description**: Đăng ký & duyệt lịch làm việc
**Deliverables**:
- [x] Work Schedule API (`/api/work-schedule`) - **với auth + ownership check**
- [x] Work Schedule page (`/work-schedule`)
- [x] Luồng: NV đăng ký → GD duyệt

#### TASK_016: Users Management Module ✅ COMPLETED
**Agent**: AGENT_AUTH
**Status**: [x] Completed
**Date**: 2026-06-13
**Description**: CRUD tài khoản cho BRANCH_DIRECTOR
**Deliverables**:
- [x] Users API (`/api/users`) với full CRUD - **với auth + RBAC**
- [x] Users page (`/users`)
- [x] BRANCH_DIRECTOR có quyền: tạo, sửa, xóa (khóa) tài khoản DEPARTMENT_HEAD, EMPLOYEE trong chi nhánh
- [x] Sidebar navigation cho Users
- [x] RBAC cập nhật: `users.delete` cho BRANCH_DIRECTOR

#### TASK_017: API Security Hardening ✅ COMPLETED
**Agent**: AGENT_AUTH
**Status**: [x] Completed
**Date**: 2026-06-13
**Description**: Audit + fix security cho tất cả API routes
**Deliverables**:
- [x] Audit 7 API routes chính
- [x] `api/salary` - Auth + RBAC + ownership
- [x] `api/work-schedule` - Auth + ownership
- [x] `api/import-orders` - Auth + force createdById
- [x] `api/export-orders` - Auth + verify ownership
- [x] `api/costs` - Auth + role filter
- [x] `api/dashboard` - Auth + branch filter
- [x] `api/users` - Refactor consistency
- [x] Commit: `4fc0eb0` (pushed to main)

### Deployment

#### TASK_013: Docker Deployment ✅ COMPLETED
**Agent**: AGENT_DEV-OPS
**Status**: [x] Completed
**Date**: 2026-06-14
**Description**: Docker + Production deployment
**Deliverables**:
- [x] `Dockerfile` - Multi-stage với Next.js standalone
- [x] `docker-compose.yml` - PostgreSQL 16 + App
- [x] `.dockerignore` - Exclude node_modules, .next, etc.
- [x] `.env.example` (dev) + `.env.production.example`
- [x] `src/app/api/health/route.ts` - Healthcheck endpoint
- [x] `next.config.ts` - `output: "standalone"` + `serverExternalPackages`

### Testing & Data

#### TASK_014: E2E Tests
**Agent**: AGENT_TESTING
**Status**: [~] In Progress (40% done)
**Description**: Playwright E2E tests
**Deliverables**:
- [x] Test file `e2e/full-system.spec.ts` (partial)
- [x] Test login flow (✅ pass)
- [x] Test dashboard navigation (✅ pass)
- [x] Test products CRUD (✅ pass)
- [ ] Mở rộng test cho các modules còn lại
- [ ] Fix remaining selectors

#### TASK_015: Excel Import ⏳ PENDING
**Agent**: AGENT_DATA
**Status**: [ ] Pending
**Description**: Bulk import dữ liệu từ Excel
**Deliverables**:
- [x] Excel reader script (`scripts/importExcel.py`) - ở root
- [ ] UI bulk import
- [ ] Validation rules
- [ ] Error reporting

---

## Dependency Graph

```
TASK_001 (Setup) ✅
    │
    ├── TASK_002 (Schema) ✅ ──→ TASK_003 (Auth) ✅
    │                              │
    │                              ▼
    │                         TASK_004 (UI) ✅
    │                              │
    │                              ▼
    │                    ┌──────────┴──────────┐
    │                    ▼                     ▼
    │              TASK_005 (Products) ✅  TASK_006 (Import/Export) ✅
    │                    │                     │
    │                    │                     │
    │                    ▼                     │
    │              TASK_007 (Production) ✅ ──┤
    │                    │                     │
    │                    ▼                     ▼
    │              TASK_008 (Salary) ✅  TASK_009 (Cost) ✅
    │                    │                     │
    │                    └─────────┬───────────┘
    │                          ▼
    │                    TASK_010 (Reports) ✅
    │                          │
    └──────────────────────────┘
                              │
                         TASK_013 (Docker) ✅
                              │
                         TASK_014 (E2E) 🔄
                         TASK_015 (Excel) ⏳
```

---

## Quick Reference

### Completed Modules (URLs)
- Dashboard: `/dashboard` - Biểu đồ 14 ngày
- Điểm Bán: `/selling-points` - GROUP_1/GROUP_2
- Sản Phẩm: `/products` - Thưởng cơm nắm, hoa hồng nước
- Nhập Hàng: `/import-orders`
- Xuất Hàng: `/export-orders`
- Tồn Kho: `/inventory`
- Lịch Làm Việc: `/work-schedule`
- Năng Suất: `/production`
- Lương: `/salary`
- Chi Phí: `/costs`
- Báo Cáo: `/reports`
- Users: `/users` (Admin + BRANCH_DIRECTOR)

### API Routes (28)
- Auth: `/api/auth/*` (NextAuth)
- Resources: `/api/{users,products,import-orders,export-orders,inventory,production,salary,costs,reports,dashboard,work-schedule,selling-points}`
- System: `/api/health`

### Default Users (after seed)
- Admin: `admin` / `admin123` (Tổng GD)
- GD CN: `gdcn` / `gdcn123`
- Trưởng Phòng: `tp` / `tp123`
- Nhân Viên: `nv` / `nv123`

### Build Status (2026-06-14)
```
✓ npm run build - SUCCESS (~20s)
✓ Compiled successfully
✓ 28 routes generated
✓ npm run lint - 0 errors (149 warnings)
```

### Recent Updates (2026-06-14)
- ✅ API Security Hardening - 7 routes audited + fixed
- ✅ Docker Production Setup - Multi-stage build, PostgreSQL
- ✅ Healthcheck endpoint - `/api/health`
- ✅ Next.js standalone output - cho Docker
- ✅ Comprehensive README - Status, quick start 3 cách
- ✅ DEPLOY_VERCEL.md - Hướng dẫn deploy Vercel chi tiết

### Recent Updates (2026-06-13)
- ✅ Users Management Module - BRANCH_DIRECTOR CRUD
- ✅ Selling Points - GROUP_1 (80k) / GROUP_2 (70k)
- ✅ Work Schedule - Luồng đăng ký → duyệt
- ✅ Gỡ transition toàn cục trong globals.css (tăng FPS)
- ✅ Sửa lỗi layout Dashboard (ml-[240px] thừa)
- ✅ Sửa React Hook trong ThemeProvider
- ✅ Rename middleware.ts → proxy.ts (Next.js 16.2 convention)
- ✅ Fix user delete self-protection logic

---

*Last Updated: 2026-06-14*
