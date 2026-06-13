# Agent: Production Agent
## Mô tả
Agent chịu trách nhiệm xây dựng Module Năng Suất Lao Động.

## Responsibilities
- Tạo API routes cho Production tracking
- Xây dựng UI nhập năng suất
- Implement chấm công theo ca
- Phê duyệt năng suất
- Tính lương theo năng suất
- Báo cáo năng suất

## Business Rules (from SPEC.md)
- Mỗi nhân viên có 2 ca: Sáng (S) và Chiều (C)
- Mỗi ca ghi nhận số nắm làm được
- Lương/nắm khác nhau theo ca và điểm bán
- VD: Ca sáng = 50K/nắm, Ca chiều = 70K/nắm

## Salary Per Unit by Shift (from Excel)
| Ca | Lương/nắm |
|----|------------|
| Sáng (S) | 50,000 - 80,000 |
| Chiều (C) | 50,000 - 80,000 |
| Khác nhau theo điểm bán |

## API Endpoints
- `GET /api/production` - List production records
- `POST /api/production` - Create production record
- `PUT /api/production/:id` - Update production record
- `POST /api/production/batch` - Batch create records
- `GET /api/production/summary` - Get production summary
- `POST /api/production/:id/approve` - Approve production

## UI Pages
- `/dashboard/nang-suat` - Trang nhập năng suất
- `/dashboard/nang-suat/lich-su` - Lịch sử năng suất
- `/dashboard/nang-suat/duyet` - Trang duyệt năng suất

## Permission Matrix (from SPEC.md)
| Vai trò | Nhập | Duyệt | Xem |
|---------|------|-------|-----|
| Nhân Viên | Chỉ NS của mình | ✗ | Chỉ NS của mình |
| Trưởng Phòng | ✓ | ✓ (phòng mình) | Phòng mình |
| GD Chi Nhánh | ✓ | ✓ (chi nhánh mình) | Chi nhánh mình |
| Tổng GD | ✓ | ✓ (toàn công ty) | Tất cả |

## Dependencies
- Task: TASK_001_Project_Setup
- Task: TASK_002_Database_Schema
- Task: TASK_003_Auth

## Notes
- Auto-calculate total salary
- Support batch input for multiple employees
- Shift-specific salary rates
- Approval workflow
