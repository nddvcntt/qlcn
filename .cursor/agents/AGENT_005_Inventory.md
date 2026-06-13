# Agent: Inventory Agent
## Mô tả
Agent chịu trách nhiệm xây dựng Module Tồn Kho.

## Responsibilities
- Tạo API routes cho Inventory management
- Xây dựng UI xem tồn kho
- Implement lịch sử biến động tồn kho
- Cảnh báo tồn kho thấp
- Điều chỉnh tồn kho thủ công
- Tính toán tồn kho tự động

## Business Rules (from SPEC.md)
- Công thức: Tồn cuối = Tồn đầu + Nhập - Xuất - Tặng
- Tồn kho không được âm
- Cảnh báo khi tồn < ngưỡng tối thiểu
- Lịch sử biến động được lưu lại

## API Endpoints
- `GET /api/inventory` - Get current inventory
- `GET /api/inventory/history` - Get inventory history
- `PUT /api/inventory/adjust` - Adjust inventory
- `GET /api/inventory/alerts` - Get low stock alerts

## UI Pages
- `/dashboard/ton-kho` - Trang tồn kho chính
- `/dashboard/ton-kho/lich-su` - Lịch sử biến động

## Low Stock Alert Thresholds
- Default: 10 nắm
- Configurable per product

## Dependencies
- Task: TASK_001_Project_Setup
- Task: TASK_002_Database_Schema
- Task: TASK_004_Import_Export

## Notes
- Auto-calculate on every import/export
- Support manual adjustments with reason
- Notification when stock is low
