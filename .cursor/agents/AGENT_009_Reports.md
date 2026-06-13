# Agent: Reports Agent
## Mô tả
Agent chịu trách nhiệm xây dựng Module Báo Cáo & Dashboard.

## Responsibilities
- Tạo API routes cho Reports
- Xây dựng Dashboard tổng quan
- Báo cáo NXT (Nhập - Xuất - Tồn)
- Báo cáo doanh thu
- Báo cáo lương
- Báo cáo chi phí
- Báo cáo năng suất
- Export reports to Excel/PDF

## Report Types

### 1. Báo cáo NXT
- Theo ngày / tuần / tháng
- Theo chi nhánh / điểm bán
- Tổng hợp và chi tiết

### 2. Báo cáo doanh thu
- Theo ngày / tuần / tháng
- Theo chi nhánh
- Theo điểm bán
- So sánh với kỳ trước

### 3. Báo cáo lương
- Bảng lương tổng hợp theo chi nhánh
- Chi tiết lương từng nhân viên
- Biểu đồ lương theo tháng

### 4. Báo cáo chi phí
- Tổng chi phí theo tháng
- Chi phí theo loại
- Chi phí trên mỗi nắm

### 5. Báo cáo năng suất
- Tổng năng suất theo ngày/tuần
- Top nhân viên
- So sánh năng suất giữa các điểm bán

### 6. Dashboard Tổng (Chỉ Tổng GD)
- Tổng doanh thu tháng
- Tổng chi phí tháng
- Lợi nhuận gộp
- So sánh chi nhánh

## API Endpoints
- `GET /api/reports/nxt` - Báo cáo NXT
- `GET /api/reports/revenue` - Báo cáo doanh thu
- `GET /api/reports/production` - Báo cáo năng suất
- `GET /api/reports/salary` - Báo cáo lương
- `GET /api/reports/cost` - Báo cáo chi phí
- `GET /api/reports/profit` - Báo cáo lợi nhuận
- `GET /api/reports/dashboard` - Dashboard overview
- `GET /api/reports/export/:type` - Export report

## UI Pages
- `/dashboard/bao-cao` - Trang báo cáo
- `/dashboard/bao-cao/nxt` - Báo cáo NXT
- `/dashboard/bao-cao/doanh-thu` - Báo cáo doanh thu
- `/dashboard/bao-cao/nang-suat` - Báo cáo năng suất
- `/dashboard/bao-cao/luong` - Báo cáo lương
- `/dashboard/bao-cao/chi-phi` - Báo cáo chi phí
- `/dashboard` - Dashboard chính

## Charts Library
- Recharts hoặc Chart.js
- Line charts cho xu hướng
- Bar charts cho so sánh
- Pie charts cho tỷ lệ

## Export Formats
- Excel (.xlsx) - sử dụng xlsx library
- PDF - sử dụng react-pdf

## Dependencies
- Task: TASK_001_Project_Setup
- Task: TASK_002_Database_Schema
- Task: TASK_003_Auth
- Agent: AGENT_004_Import_Export
- Agent: AGENT_006_Production
- Agent: AGENT_007_Salary
- Agent: AGENT_008_Cost

## Notes
- Role-based report access
- Date range filtering
- Branch filtering
- Export functionality
- Charts and visualizations
