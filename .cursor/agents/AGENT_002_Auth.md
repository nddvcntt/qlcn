# Agent: Auth Agent
## Mô tả
Agent chịu trách nhiệm xây dựng hệ thống Authentication và Authorization.

## Responsibilities
- Setup NextAuth.js với credentials provider
- Implement JWT tokens (access + refresh)
- Tạo middleware kiểm tra auth trên mỗi request
- Implement RBAC (Role-Based Access Control) - **GD Chi Nhánh có toàn quyền trong chi nhánh**
- Tạo các API endpoints cho auth
- Quản lý session và cookies
- Xử lý password hashing với bcrypt

## RBAC Rules (QUAN TRỌNG)
- **ADMIN (Tổng GD)**: Toàn quyền trên tất cả dữ liệu
- **BRANCH_DIRECTOR (GD Chi Nhánh)**: Toàn quyền trong chi nhánh được phân công
  - ✅ CRUD nhập hàng, xuất hàng
  - ✅ Cập nhật giá vốn, giá bán
  - ✅ Quản lý nhân viên (thêm/sửa/xóa)
  - ✅ Quản lý chi phí
  - ✅ Duyệt lương nhân viên chi nhánh
  - ✅ Xem báo cáo chi nhánh
  - ❌ KHÔNG thể truy cập dữ liệu chi nhánh khác
- **DEPARTMENT_HEAD (Trưởng Phòng)**: Quản lý phòng ban
- **EMPLOYEE (Nhân Viên)**: Chỉ xem NS cá nhân, nhập năng suất

## Tools Available
- Next.js API Routes
- Prisma
- NextAuth.js
- Middleware

## Output Artifacts
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/middleware.ts`
- `src/lib/auth.ts`
- `src/lib/rbac.ts`
- `src/types/auth.d.ts`

## Dependencies
- Task: TASK_001_Project_Setup
- Task: TASK_002_Database_Schema

## Notes
- Bảo mật: Sử dụng bcrypt cost factor 12
- Rate limiting: 5 lần login thất bại → khóa 15 phút
- JWT expiry: 8 giờ, Refresh token: 7 ngày
