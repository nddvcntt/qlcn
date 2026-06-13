# Task: TASK_002_Database_Schema
## Mô tả
Tạo database schema với Prisma, migrations, và seed data.

## Priority: CRITICAL (Foundation)
## Estimated Time: 3-4 hours
## Agent: AGENT_001_DevOps
## Dependencies: TASK_001_Project_Setup

## Subtasks

### 2.1 Initialize Prisma
```bash
# Di chuyển vào project folder
cd qlcn-app

# Initialize Prisma
npx prisma init
```

### 2.2 Create Prisma Schema
```prisma
// prisma/schema.prisma
// Xem SPEC.md PHẦN XIII cho chi tiết schema đầy đủ
```

### 2.3 Create Database Migrations
```bash
# Tạo migration đầu tiên
npx prisma migrate dev --name init

# Tạo seed data
npx prisma db seed
```

### 2.4 Seed Data (prisma/seed.ts)
```typescript
// prisma/seed.ts
// Xem SPEC.md PHẦN XIII cho chi tiết seed data
```

## Database Tables
1. `Organization` - Tổ chức/Công ty
2. `Branch` - Chi nhánh
3. `Department` - Phòng ban
4. `SellingPoint` - Điểm bán
5. `User` - Người dùng
6. `Product` - Sản phẩm
7. `ImportOrder` - Phiếu nhập hàng
8. `ImportOrderItem` - Chi tiết phiếu nhập
9. `ExportOrder` - Phiếu xuất hàng
10. `ExportOrderItem` - Chi tiết phiếu xuất
11. `Inventory` - Tồn kho
12. `DailyProduction` - Năng suất lao động
13. `SalaryRecord` - Bảng lương
14. `SalaryAdjustment` - Điều chỉnh lương
15. `CostCategory` - Danh mục chi phí
16. `CostRecord` - Chi phí
17. `AuditLog` - Nhật ký kiểm toán
18. `PriceHistory` - Lịch sử giá

## Enums
- `UserRole`: ADMIN, BRANCH_DIRECTOR, DEPARTMENT_HEAD, EMPLOYEE
- `Shift`: SANG, CHIEU
- `OrderStatus`: DRAFT, APPROVED, CANCELLED
- `SalaryStatus`: PENDING, APPROVED_BY_BRANCH, APPROVED_BY_ORG, PAID
- `CostType`: FIXED, VARIABLE
- `AdjustmentType`: BONUS, DEDUCTION, ALLOWANCE, ADJUSTMENT

## Seed Data Required
- 1 Organization mặc định
- 1 Branch mặc định (Chi nhánh Hà Nội)
- 2 Departments (Sản xuất, Kinh doanh)
- 9 SellingPoints (VTD, XL, XD_SAU, CN_A, CN_B, DA, DA_A, DA_B, TP)
- 12 Products (từ SPEC.md)
- 9 CostCategories (từ SPEC.md)
- Admin user mặc định

## Deliverables
- [ ] prisma/schema.prisma với đầy đủ models
- [ ] Database migrations thành công
- [ ] Seed data được tạo
- [ ] Prisma Client generated

## Verification
- [ ] `npx prisma studio` mở được
- [ ] Database tables được tạo đúng
- [ ] Seed data visible in Prisma Studio
- [ ] Admin user có thể login

## Notes
- PostgreSQL 15+ required
- Sử dụng UUID cho primary keys
- Decimal cho tiền tệ
- Timestamps cho audit trail
