# QLCN - Hệ Thống Quản Lý Cơm Nắm

## Project Overview
- Multi-agent project cho hệ thống quản lý chuỗi cơm nắm
- Tech stack: Next.js 16.2+, TypeScript, PostgreSQL, Prisma, Docker
- 4 cấp tổ chức: Tổng GD > GD Chi Nhánh > Trưởng Phòng > Nhân Viên
- Chi nhánh hạch toán độc lập

## Phân Quyền (Đọc trước khi sửa code)
- **ADMIN (Tổng GD)**: Toàn quyền tất cả dữ liệu
- **BRANCH_DIRECTOR (GD CN)**: Toàn quyền trong chi nhánh được phân công
- **DEPARTMENT_HEAD (Trưởng Phòng)**: Quản lý phòng ban
- **EMPLOYEE (Nhân Viên)**: Chỉ NS cá nhân, xem lương cá nhân

## Quy Tắc Chung

1. **Đọc SPEC.md trước** - Mọi thay đổi phải match với SPEC.md
2. **Không lặp lại context** - Không re-read file đã đọc trừ khi có thay đổi
3. **Targeted edits** - Ưu tiên sửa nhỏ, không rewrite nguyên file
4. **Một agent một task** - Mỗi agent chỉ làm việc trên task được assign
5. **Test trước khi kết thúc** - Chạy build/lint trước khi báo done
6. **No fluff** - Không preamble/closing, trả lời ngắn gọn

## Cấu Trúc Thư Mục

```
d:\Other\QLCN
├── SPEC.md                    # Tài liệu đặc tả CHÍNH
├── CLAUDE.md                 # File này
├── README.md                 # Hướng dẫn tổng hợp
├── .cursor/
│   ├── agents/              # Agent definitions
│   │   └── AGENT_*.md
│   └── tasks/               # Task definitions
│       └── TASK_*.md
└── qlcn-app/                # Source code (sẽ tạo)
    ├── src/
    ├── prisma/
    └── docker/
```

## Tasks Priority

| # | Task | Agent | Status |
|---|------|-------|--------|
| 1 | Project Setup | DevOps | [x] Done |
| 2 | Database Schema | DevOps | [x] Done |
| 3 | Auth System | Auth | [x] Done |
| 4 | UI Components | UI/UX | [x] Done |
| 5 | Products Module | Import/Export | [x] Done |
| 6 | Import/Export Module | Import/Export | [x] Done |
| 7 | Production Module | Production | [x] Done |
| 8 | Salary Module | Salary | [x] Done |
| 9 | Cost Module | Cost | [x] Done |
| 10 | Reports Module | Reports | [x] Done |
| 11 | Selling Points Module | Import/Export | [x] Done |
| 12 | Work Schedule Module | Production | [x] Done |
| 13 | Docker Deployment | DevOps | [x] Done |
| 14 | Users Management | Auth | [x] Done |
| 15 | E2E Tests | Testing | [ ] Pending |
| 16 | Excel Import | Data | [ ] Pending |

## Database Key Tables

- `Organization` - Tổng công ty
- `Branch` - Chi nhánh (hạch toán độc lập)
- `Department` - Phòng ban
- `SellingPoint` - Điểm bán
- `User` - Người dùng (4 role)
- `Product` - Sản phẩm (12 loại từ Excel)
- `ImportOrder` / `ExportOrder` - Phiếu nhập/xuất
- `Inventory` - Tồn kho
- `DailyProduction` - Năng suất (Sáng/Chiều)
- `SalaryRecord` - Bảng lương
- `CostRecord` - Chi phí

## RBAC Implementation

```typescript
// Branch isolation: GD CN chỉ truy cập chi nhánh mình
canAccessBranch(userRole, userBranchId, targetBranchId) {
  if (userRole === 'ADMIN') return true
  return userBranchId === targetBranchId
}
```

## Override Rule
User instructions always override these rules.

## Khi báo done
1. Build pass
2. No lint errors  
3. Đã update SPEC.md nếu có thay đổi architecture
4. Update TASKS.md với task status mới
5. Mô tả ngắn gì đã làm, gì cần làm tiếp

## Recent Updates (2026-06-13)
- TASK_016: Users Management Module ✅ - BRANCH_DIRECTOR có quyền CRUD DEPARTMENT_HEAD/EMPLOYEE
- Lương: GROUP_1 (Xa) = 80k/ca, GROUP_2 (Gần) = 70k/ca
