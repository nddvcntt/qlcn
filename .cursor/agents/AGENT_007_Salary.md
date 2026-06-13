# Agent: Salary Agent
## Mô tả
Agent chịu trách nhiệm xây dựng Module Lương & Thưởng.

## Responsibilities
- Tạo API routes cho Salary management
- Xây dựng UI bảng lương
- Implement tính lương tự động
- Quản lý phụ cấp, thưởng, phạt
- Quản lý tạm ứng lương
- Workflow phê duyệt 2 cấp
- Xuất báo cáo lương

## Business Rules (from SPEC.md)
```
Tổng lương = Lương năng suất + Phụ cấp - Tạm ứng
Lương năng suất = Σ(số nắm × lương/nắm) - điều chỉnh
Điều chỉnh = (thực tế - chuẩn) × 500 (nếu thực tế < chuẩn)
```

## Allowances (from SPEC.md)
| Loại | Giá trị |
|------|---------|
| Làm xa | 50,000/tuần |
| Ca sáng gần | 50,000/tuần |
| Ca chiều gần | 50,000/tuần |
| Chuyên cần | 200,000/tuần |
| HV buổi đầu | 50,000 |

## Salary Status Flow
```
PENDING → APPROVED_BY_BRANCH → APPROVED_BY_ORG → PAID
```

## API Endpoints
- `GET /api/salary` - List salary records
- `POST /api/salary/calculate` - Calculate salary for period
- `POST /api/salary/:id/approve-branch` - Approve by branch director
- `POST /api/salary/:id/approve-org` - Approve by org admin
- `POST /api/salary/:id/mark-paid` - Mark as paid
- `POST /api/salary/:id/adjust` - Add adjustment
- `GET /api/salary/payslip/:employeeId/:periodId` - Get payslip

## UI Pages
- `/dashboard/luong` - Bảng lương
- `/dashboard/luong/tinh` - Tính lương
- `/dashboard/luong/duyet` - Duyệt lương
- `/dashboard/luong/chi-tiet/:id` - Chi tiết lương
- `/dashboard/luong/phieu-luong/:employeeId/:periodId` - Phiếu lương

## Salary Calculation Formula
```typescript
// Pseudocode
totalProductionSalary = sum(production.quantity * production.salaryPerUnit)
totalAllowances = sum(allowances.amount)
totalBonuses = sum(bonuses.amount)
totalDeductions = sum(deductions.amount)
grossSalary = totalProductionSalary + totalAllowances + totalBonuses - totalDeductions
netSalary = grossSalary - advanceAmount
```

## Dependencies
- Task: TASK_001_Project_Setup
- Task: TASK_002_Database_Schema
- Task: TASK_003_Auth
- Task: TASK_006_Production

## Notes
- Auto-calculate from production data
- 2-level approval workflow
- Support adjustments (bonus, deduction, allowance)
- Advance payment tracking
