# Agent: Cost Agent
## Mô tả
Agent chịu trách nhiệm xây dựng Module Chi Phí.

## Responsibilities
- Tạo API routes cho Cost management
- Xây dựng UI quản lý chi phí
- Quản lý danh mục chi phí
- Phân loại chi phí cố định / biến đổi
- Báo cáo chi phí

## Business Rules (from SPEC.md)
- Chi phí cố định: đồng phục, quầy kệ, lò vi sóng, thùng đá
- Chi phí biến đổi: vận chuyển, điện, quà, túi

## Cost Categories (from SPEC.md)
| Loại | Tên | Đơn giá | Loại |
|------|------|---------|-------|
| Đồng phục | 200,000 | /bộ | FIXED |
| Quầy kệ | 1,000,000 | /cái | FIXED |
| Lò vi sóng | 1,450,000-1,700,000 | /cái | FIXED |
| Thùng đá | 300,000 | /cái | FIXED |
| Túi nilon | 43,000 | /kg | VARIABLE |
| Đồ chơi | 3,450 | /cái | VARIABLE |
| Vận chuyển | 83/nắm | /nắm | VARIABLE |
| Quà | 1,000/nắm | /nắm | VARIABLE |
| Điện | 100/nắm | /nắm | VARIABLE |

## API Endpoints
- `GET /api/costs` - List cost records
- `POST /api/costs` - Create cost record
- `PUT /api/costs/:id` - Update cost record
- `DELETE /api/costs/:id` - Delete cost record
- `GET /api/cost-categories` - List categories
- `POST /api/cost-categories` - Create category

## UI Pages
- `/dashboard/chi-phi` - Trang chi phí chính
- `/dashboard/chi-phi/danh-muc` - Quản lý danh mục
- `/dashboard/chi-phi/bao-cao` - Báo cáo chi phí

## Permission Matrix (from SPEC.md)
| Vai trò | Thêm | Sửa | Xóa | Xem |
|---------|------|------|------|------|
| Tổng GD | ✓ | ✓ | ✓ | Tất cả |
| GD Chi Nhánh | ✓ | ✓ | ✓ | Chi nhánh mình |
| Trưởng Phòng | ✗ | ✗ | ✗ | ✗ |
| Nhân Viên | ✗ | ✗ | ✗ | ✗ |

## Dependencies
- Task: TASK_001_Project_Setup
- Task: TASK_002_Database_Schema
- Task: TASK_003_Auth

## Notes
- Support both fixed and variable costs
- Calculate total cost per period
- Per-product cost allocation (future)
