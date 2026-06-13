# AGENTS.md - Multi-Agent Definitions

## Agent Definitions

### AGENT_DEV-OPS
**Phạm vi**: Infrastructure, Setup, Docker
**Tasks**: TASK_001, TASK_002, TASK_011
**Files tạo**: 
- Setup Next.js project structure
- Prisma schema
- Docker files
- CI/CD pipeline

### AGENT_AUTH
**Phạm vi**: Authentication, Authorization, RBAC
**Tasks**: TASK_003
**Files tạo**:
- `src/lib/auth.ts` - NextAuth config
- `src/middleware.ts` - Auth middleware
- `src/lib/rbac.ts` - RBAC system
- `src/app/api/auth/**`

### AGENT_UI-UX
**Phạm vi**: UI Components, Layout
**Tasks**: TASK_004
**Files tạo**:
- `src/components/ui/**` - shadcn components
- `src/components/layout/**` - Sidebar, Topbar
- `src/styles/globals.css`

### AGENT_IMPORT-EXPORT
**Phạm vi**: Nhập hàng, Xuất hàng, Sản phẩm
**Tasks**: TASK_005, TASK_006
**Files tạo**:
- `src/app/api/import-orders/**`
- `src/app/api/export-orders/**`
- `src/app/api/products/**`
- `src/app/(dashboard)/nhap-hang/**`
- `src/app/(dashboard)/xuat-hang/**`

### AGENT_INVENTORY
**Phạm vi**: Tồn kho, Inventory tracking
**Tasks**: TASK_005 (tích hợp)
**Files tạo**:
- `src/app/api/inventory/**`
- `src/app/(dashboard)/ton-kho/**`

### AGENT_PRODUCTION
**Phạm vi**: Năng suất lao động, Chấm công
**Tasks**: TASK_007
**Files tạo**:
- `src/app/api/production/**`
- `src/app/(dashboard)/nang-suat/**`

### AGENT_SALARY
**Phạm vi**: Lương, Thưởng, Phạt
**Tasks**: TASK_008
**Files tạo**:
- `src/app/api/salary/**`
- `src/app/(dashboard)/luong/**`

### AGENT_COST
**Phạm vi**: Chi phí, Chi phí cố định/biến đổi
**Tasks**: TASK_009
**Files tạo**:
- `src/app/api/costs/**`
- `src/app/(dashboard)/chi-phi/**`

### AGENT_REPORTS
**Phạm vi**: Báo cáo, Dashboard
**Tasks**: TASK_010
**Files tạo**:
- `src/app/api/reports/**`
- `src/app/(dashboard)/bao-cao/**`
- `src/app/(dashboard)/dashboard/**`

---

## Agent Communication Protocol

### Khi start task mới
1. Read SPEC.md sections liên quan
2. Check task file trong `.cursor/tasks/`
3. Read agent definition trong `.cursor/agents/`
4. Update task status trong README.md

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

### Database (Prisma)
- PostgreSQL
- Tables defined in SPEC.md PHẦN XIII
- Enums: UserRole, Shift, OrderStatus, SalaryStatus

### API Patterns
```typescript
// Standard API response
return NextResponse.json({ 
  success: true, 
  data: result,
  error?: { code, message }
})
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

## Status Legend
- [ ] Pending - Chưa bắt đầu
- [x] Done - Hoàn thành
- [~] In Progress - Đang làm
