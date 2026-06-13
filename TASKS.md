# TASKS.md - All Tasks Summary

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
**Description**: Tạo Prisma schema với 18 tables
**Deliverables**:
- [x] `prisma/schema.prisma` - 18 tables
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
- [x] Tính lương tự động theo ngày (0đ → 50k → 70-80k)
- [x] Tính thưởng ≥50 suất

### Secondary Modules

#### TASK_008: Salary Module ✅ COMPLETED
**Agent**: AGENT_SALARY
**Status**: [x] Completed
**Description**: Lương, thưởng, phạt
**Deliverables**:
- [x] Salary API (`/api/salary`)
- [x] Salary calculation theo kỳ
- [x] 2-level approval workflow (GD CN → Tổng GD)
- [x] Bảng lương với chi tiết

#### TASK_009: Cost Module ✅ COMPLETED
**Agent**: AGENT_COST
**Status**: [x] Completed
**Description**: Chi phí cố định & biến đổi
**Deliverables**:
- [x] Costs API (`/api/costs`)
- [x] Cost categories
- [x] Cost page (`/costs`)

#### TASK_010: Reports Module ✅ COMPLETED
**Agent**: AGENT_REPORTS
**Status**: [x] Completed
**Description**: Báo cáo + Dashboard
**Deliverables**:
- [x] Dashboard API (`/api/dashboard`)
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
- [x] GROUP_1: 80,000đ/ca, GROUP_2: 75,000đ/ca

#### TASK_012: Work Schedule Module ✅ COMPLETED
**Agent**: AGENT_PRODUCTION
**Status**: [x] Completed
**Description**: Đăng ký & duyệt lịch làm việc
**Deliverables**:
- [x] Work Schedule API (`/api/work-schedule`)
- [x] Work Schedule page (`/work-schedule`)
- [x] Luồng: NV đăng ký → GD duyệt

#### TASK_016: Users Management Module ✅ COMPLETED
**Agent**: AGENT_AUTH
**Status**: [x] Completed
**Date**: 2026-06-13
**Description**: CRUD tài khoản cho BRANCH_DIRECTOR
**Deliverables**:
- [x] Users API (`/api/users`) với full CRUD
- [x] Users page (`/users`)
- [x] BRANCH_DIRECTOR có quyền: tạo, sửa, xóa (khóa) tài khoản DEPARTMENT_HEAD, EMPLOYEE trong chi nhánh
- [x] Sidebar navigation cho Users
- [x] RBAC cập nhật: `users.delete` cho BRANCH_DIRECTOR

### Deployment

#### TASK_013: Docker Deployment ✅ COMPLETED
**Agent**: AGENT_DEV-OPS
**Status**: [x] Completed
**Description**: Docker + CI/CD
**Deliverables**:
- [x] `Dockerfile`
- [x] `docker-compose.yml`
- [x] `nginx/nginx.conf`
- [x] Environment variables template

### Testing & Data

#### TASK_014: E2E Tests
**Agent**: AGENT_TESTING
**Status**: [ ] Pending
**Description**: Playwright E2E tests
**Deliverables**:
- [x] Test file `e2e/full-system.spec.ts`
- [x] Test login flow (✅ pass)
- [x] Test dashboard navigation (✅ pass)
- [x] Test products CRUD (✅ pass)
- [ ] Fix remaining selectors for other modules

#### TASK_015: Excel Import ✅ COMPLETED
**Agent**: AGENT_DATA
**Status**: [x] Completed
**Description**: Import dữ liệu từ Excel
**Deliverables**:
- [x] Excel reader script (`src/scripts/importExcel.ts`)
- [x] Data mapping functions
- [x] Batch import to DB

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
                         TASK_015 (Excel) ✅
```

---

## Quick Reference

### Completed Modules
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

### Default Users (after seed)
- Admin: `admin` / `admin123` (Tổng GD)
- GD CN: `gdcn` / `gdcn123`
- Trưởng Phòng: `tp` / `tp123`
- Nhân Viên: `nv` / `nv123`

### Build Status
```
✓ npm run build - SUCCESS (13.1s)
✓ Compiled successfully
✓ 26 routes generated
```

### Recent Optimizations (2026-06-13)
- Gỡ transition toàn cục trong globals.css (tăng FPS)
- Sửa lỗi layout Dashboard (ml-[240px] thừa)
- Sửa React Hook trong ThemeProvider
- Rename middleware.ts → proxy.ts (Next.js 16.2 convention)
- Fix user delete self-protection logic

---

*Last Updated: 2026-06-13*
