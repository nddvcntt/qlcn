# AGENTS.md - Multi-Agent Definitions

> **Last Updated:** 2026-06-14 | **Status:** 14/16 tasks done (87.5%)

## Agent Definitions

### AGENT_DEV-OPS
**Phạm vi**: Infrastructure, Setup, Docker
**Tasks**: TASK_001, TASK_002, TASK_011
**Status**: ✅ ALL DONE
**Files tạo**:
- Setup Next.js project structure
- Prisma schema
- `Dockerfile` - Multi-stage Next.js standalone
- `docker-compose.yml` - PostgreSQL + App
- `.dockerignore`, `.env.example`, `.env.production.example`
- `src/app/api/health/route.ts` - Healthcheck

### AGENT_AUTH
**Phạm vi**: Authentication, Authorization, RBAC
**Tasks**: TASK_003, TASK_016
**Status**: ✅ ALL DONE
**Files tạo**:
- `src/lib/auth.ts` - NextAuth config
- `src/proxy.ts` - Auth middleware
- `src/lib/rbac.ts` - RBAC system
- `src/app/api/auth/**`
- `src/app/api/users/**` - Users CRUD API (với BRANCH_DIRECTOR permissions)
- `src/app/(dashboard)/users/**` - Users management UI

### AGENT_UI-UX
**Phạm vi**: UI Components, Layout
**Tasks**: TASK_004
**Status**: ✅ DONE
**Files tạo**:
- `src/components/ui/**` - shadcn components
- `src/components/layout/**` - Sidebar, Topbar
- `src/styles/globals.css`

### AGENT_IMPORT-EXPORT
**Phạm vi**: Nhập hàng, Xuất hàng, Sản phẩm
**Tasks**: TASK_005, TASK_006, TASK_011 (SellingPoints)
**Status**: ✅ ALL DONE
**Files tạo**:
- `src/app/api/import-orders/**`
- `src/app/api/export-orders/**`
- `src/app/api/products/**`
- `src/app/api/selling-points/**`
- `src/app/(dashboard)/nhap-hang/**`
- `src/app/(dashboard)/xuat-hang/**`
- `src/app/(dashboard)/products/**`
- `src/app/(dashboard)/selling-points/**`

### AGENT_INVENTORY
**Phạm vi**: Tồn kho, Inventory tracking
**Tasks**: TASK_005 (tích hợp)
**Status**: ✅ DONE (integrated in import/export)
**Files tạo**:
- `src/app/api/inventory/**`
- `src/app/(dashboard)/ton-kho/**`

### AGENT_PRODUCTION
**Phạm vi**: Năng suất lao động, Chấm công
**Tasks**: TASK_007, TASK_012 (Work Schedule)
**Status**: ✅ ALL DONE
**Files tạo**:
- `src/app/api/production/**`
- `src/app/api/work-schedule/**`
- `src/app/(dashboard)/nang-suat/**`
- `src/app/(dashboard)/work-schedule/**`

### AGENT_SALARY
**Phạm vi**: Lương, Thưởng, Phạt
**Tasks**: TASK_008
**Status**: ✅ DONE
**Files tạo**:
- `src/app/api/salary/**`
- `src/app/(dashboard)/luong/**`

### AGENT_COST
**Phạm vi**: Chi phí, Chi phí cố định/biến đổi
**Tasks**: TASK_009
**Status**: ✅ DONE
**Files tạo**:
- `src/app/api/costs/**`
- `src/app/(dashboard)/chi-phi/**`

### AGENT_REPORTS
**Phạm vi**: Báo cáo, Dashboard
**Tasks**: TASK_010
**Status**: ✅ DONE
**Files tạo**:
- `src/app/api/reports/**`
- `src/app/api/dashboard/**`
- `src/app/(dashboard)/bao-cao/**`
- `src/app/(dashboard)/dashboard/**`

### AGENT_TESTING
**Phạm vi**: E2E tests, Unit tests
**Tasks**: TASK_015
**Status**: ⏳ PENDING
**Files cần tạo**:
- Mở rộng `e2e/full-system.spec.ts` (đã có partial)
- Thêm test cho tất cả modules
- Coverage report

### AGENT_DATA
**Phạm vi**: Excel import, Data migration
**Tasks**: TASK_016
**Status**: ⏳ PENDING
**Files cần tạo**:
- Excel import UI
- Bulk import API
- Validation rules

---

## Agent Communication Protocol

### Khi start task mới
1. Read SPEC.md sections liên quan
2. Check task file trong `.cursor/tasks/`
3. Read agent definition trong `.cursor/agents/`
4. Update task status trong README.md và TASKS.md

### Khi cần context từ agent khác
- Check file `AGENTS.md` này
- Reference tasks đã hoàn thành
- Nếu cần code từ agent khác, request qua user

### Khi hoàn thành task
1. Verify: build pass, no lint errors
2. Update SPEC.md nếu có changes
3. Update README.md task status
4. Báo user: đã làm gì, cần làm gì tiếp

---

## Shared Components (Agent có thể reference)

### Design System
- Primary: `#5D4037`
- Secondary: `#F9A825`
- Background: `#FFFDF7`
- Font: Inter, JetBrains Mono

### Lương Theo Điểm Bán
- GROUP_1 (Xa): 80,000đ/ca
- GROUP_2 (Gần): 70,000đ/ca
- Thưởng cơm nắm: 500đ/suất nếu bán ≥ 50 suất/ca

### Database (Prisma)
- Dev: SQLite (`prisma/schema.prisma`)
- Prod: PostgreSQL 16 (Docker/Vercel Postgres/Neon)
- Enums: UserRole, Shift, OrderStatus, SalaryStatus
- 14 models: Organization, Branch, Department, SellingPoint, User, Product, ImportOrder, ExportOrder, Inventory, WorkSchedule, DailyProduction, SalaryRecord, CostRecord, AuditLog, PriceHistory

### API Patterns
```typescript
// Standard API response
return NextResponse.json({ 
  success: true, 
  data: result,
  error?: { code, message }
})

// Auth check pattern
const session = await auth()
if (!session) return 401

// Role-based filter
if (userRole !== "ADMIN") {
  where.branchId = userBranchId
}
```

### RBAC Pattern
```typescript
import { hasPermission, canAccessBranch } from '@/lib/rbac'

// Check permission
if (!hasPermission(session.user.role, 'resource.action')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// Check branch access
if (!canAccessBranch(session.user.role, session.user.branchId, targetBranchId)) {
  return NextResponse.json({ error: 'Branch access denied' }, { status: 403 })
}
```

---

## Recent Updates (2026-06-14)

### ✅ API Security Hardening (TASK_016 partial)
- **7 API routes đã được audit + fix:**
  - `api/salary` - Auth + RBAC (Employee chỉ thấy lương mình)
  - `api/work-schedule` - Auth + ownership verification
  - `api/import-orders` - Auth + force `createdById` từ session
  - `api/export-orders` - Auth + verify selling point thuộc branch
  - `api/costs` - Auth + role-based filter
  - `api/dashboard` - Auth + force branchId cho non-admin
  - `api/users` - Refactor consistency
- **Commit:** `4fc0eb0` (pushed to main)

### ✅ Docker Deployment (TASK_011)
- `Dockerfile` - Multi-stage build với Next.js standalone output
- `docker-compose.yml` - PostgreSQL 16 + Next.js app
- `.env.production.example` - Template cho production
- `src/app/api/health/route.ts` - Healthcheck endpoint

### ✅ Users Management (TASK_014)
- BRANCH_DIRECTOR có quyền CRUD DEPARTMENT_HEAD/EMPLOYEE trong chi nhánh mình
- ADMIN có full quyền
- Pattern: chỉ thao tác được tài khoản cùng branch

---

## Status Legend
- [ ] Pending - Chưa bắt đầu
- [x] Done - Hoàn thiện
- [~] In Progress - Đang làm

---

## Next Steps (Tối ưu cho production)

1. **TASK_015: E2E Tests** - Mở rộng Playwright coverage
2. **TASK_016: Excel Import** - UI bulk import từ Excel
3. **Performance:** Optimize Prisma queries, add caching
4. **Monitoring:** Sentry, Vercel Analytics
5. **Documentation:** API docs (Swagger/OpenAPI)
