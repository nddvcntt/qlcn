# Agent: Import/Export Agent
## Mô tả
Agent chịu trách nhiệm xây dựng Module Nhập Hàng và Module Xuất Hàng.

## Responsibilities
- Tạo API routes cho Import Orders
- Tạo API routes cho Export Orders
- Xây dựng UI form nhập hàng
- Xây dựng UI form xuất hàng
- Implement tự động cập nhật tồn kho
- Tính toán thành tiền tự động
- Validation input data
- Permission checks

## Business Rules (from SPEC.md)
- Tồn kho không được âm
- Sửa phiếu chỉ trong cùng ngày
- Cần approval sau khi tạo
- Phân biệt hàng nhập bán và hàng tặng

## API Endpoints
- `GET /api/import-orders` - List import orders
- `POST /api/import-orders` - Create import order
- `PUT /api/import-orders/:id` - Update import order
- `DELETE /api/import-orders/:id` - Delete import order
- `POST /api/import-orders/:id/approve` - Approve import order
- `GET /api/export-orders` - List export orders
- `POST /api/export-orders` - Create export order
- `PUT /api/export-orders/:id` - Update export order
- `DELETE /api/export-orders/:id` - Delete export order

## UI Pages
- `/dashboard/nhap-hang` - Trang nhập hàng
- `/dashboard/xuat-hang` - Trang xuất hàng
- `/dashboard/nhap-hang/[id]` - Chi tiết phiếu nhập
- `/dashboard/xuat-hang/[id]` - Chi tiết phiếu xuất

## Dependencies
- Task: TASK_001_Project_Setup
- Task: TASK_002_Database_Schema
- Task: TASK_003_Auth
- Agent: AGENT_002_Auth (for permissions)

## Notes
- Auto-update inventory on save
- Calculate total amount client-side first
- Server-side validation is mandatory
- Role-based access control
