# SPEC.md — Hệ Thống Quản Lý Cơm Nắm (QLCN)

---

## PHẦN I: TỔNG QUAN HỆ THỐNG

---

### 1.1 Giới thiệu

Đây là hệ thống phần mềm quản lý chuỗi cơm nắm (cơm cháy) hoạt động theo mô hình **đa chi nhánh**, phục vụ quản lý từ **Tổng Công Ty → Chi Nhánh → Phòng Ban → Nhân Viên**.

Hệ thống thay thế hoàn toàn việc quản lý bằng file Excel rời rạc, đảm bảo:
- Dữ liệu tập trung, nhất quán
- Phân quyền rõ ràng theo cấp bậc
- Báo cáo đa cấp, chính xác
- Mở rộng linh hoạt khi công ty phát triển

---

### 1.2 Các cấp tổ chức & phân quyền

| Cấp bậc | Vai trò | Phạm vi hoạt động |
|----------|---------|-------------------|
| **Cấp 1** | Tổng Giám Đốc (Admin Tổng) | Toàn bộ hệ thống: tất cả chi nhánh, phê duyệt báo cáo tổng hợp, quản lý giá vốn/giá bán toàn công ty |
| **Cấp 2** | Giám Đốc Chi Nhánh | **Toàn quyền trong chi nhánh được phân công**: nhập/xuất hàng, quản lý giá cả, quản lý nhân viên, quản lý chi phí, xem báo cáo chi nhánh |
| **Cấp 3** | Trưởng Phòng | Quản lý phòng ban: xem báo cáo phòng, duyệt năng suất lao động nhân viên, điều phối nhân sự cấp dưới |
| **Cấp 4** | Nhân Viên | Chỉ nhập năng suất lao động hàng ngày, xem lương cá nhân |

**Quan hệ:** Tổng Giám Đốc > Giám Đốc Chi Nhánh > Trưởng Phòng > Nhân Viên

**Quyền hạn Chi Nhánh (quan trọng):**
- Giám Đốc Chi Nhánh có **toàn quyền** trong chi nhánh của mình, bao gồm:
  - ✅ Nhập hàng / Xuất hàng
  - ✅ Cập nhật giá vốn / giá bán (cho chi nhánh)
  - ✅ Quản lý nhân viên (tuyển, phân công, sa thải)
  - ✅ Quản lý chi phí chi nhánh
  - ✅ Duyệt lương nhân viên chi nhánh
  - ✅ Xem báo cáo chi nhánh

**Ràng buộc quan trọng:**
- **Chi nhánh hạch toán độc lập**: Mỗi chi nhánh có sổ sách, báo cáo tài chính riêng
- Giám Đốc Chi Nhánh A **KHÔNG THỂ** truy cập dữ liệu Chi Nhánh B
- Giá cả có thể khác nhau giữa các chi nhánh (GD Chi Nhánh tự quyết)
- Tổng Giám Đốc có quyền xem tất cả dữ liệu mọi chi nhánh

---

### 1.3 Nghiệp vụ lương nhân viên (TỪ EXCEL)

**Quy tắc tính lương theo ngày làm việc:**

| Ngày làm | Trạng thái | Mức lương | Ghi chú |
|-----------|-----------|-----------|---------|
| Ngày 1 | Học việc | 0đ/ca | Không lương |
| Ngày 2-3 | Thử việc | 50,000đ/ca | |
| Ngày 4+ | Chính thức | 70,000đ/ca hoặc 80,000đ/ca | Tùy vị trí/điểm bán |

**Quy tắc về điểm bán (Selling Points):**

| Nhóm | Mức lương/ca | Ghi chú |
|------|---------------|---------|
| Nhóm 1 | 80,000đ/ca | Điểm bán xa/khó khăn hơn |
| Nhóm 2 | 75,000đ/ca | Điểm bán gần/hỗ trợ tốt hơn |

**Quy tắc thưởng sản lượng:**

| Sản phẩm | Điều kiện | Thưởng |
|----------|-----------|--------|
| Cơm nắm | ≥ 50 suất/ca | 500đ/suất |
| Nước | Theo % hoa hồng | Cơ chế riêng (xem chi tiết module) |

**Quy tắc đăng ký lịch làm việc:**
- Nhân viên tự đăng ký lịch làm việc (chọn ngày, ca, điểm bán)
- Giám đốc chi nhánh duyệt lịch
- Lịch được duyệt mới được tính vào công

---

### 1.4 Các điểm bán (danh sách mẫu)

Dựa trên dữ liệu Excel, các điểm bán bao gồm:

| Mã | Tên đầy đủ | Nhóm | Lương/ca |
|----|-------------|------|----------|
| VTD | Xuân La | Nhóm 1 | 80,000đ |
| XL | Xuân Đỉnh | Nhóm 2 | 75,000đ |
| XD_SAU | Xuân Đỉnh Sau | Nhóm 2 | 75,000đ |
| CN_A | Cổ Nhuế A | Nhóm 2 | 75,000đ |
| CN_B | Cổ Nhuế B | Nhóm 2 | 75,000đ |
| DA | Đông Ngạc | Nhóm 2 | 75,000đ |
| DA_A | Đông Ngạc A | Nhóm 1 | 80,000đ |
| DA_B | Đông Ngạc B | Nhóm 1 | 80,000đ |
| TP | Thụy Phương | Nhóm 2 | 75,000đ |

---

## PHẦN II: THIẾT KẾ GIAO DIỆN

---

### 2.1 Bảng màu chủ đạo

**Theme: Warm Food & Professional**

| Mục đích | Màu | Hex | Sử dụng |
|-----------|-----|-----|---------|
| **Primary** | Nâu Đậm (Gạo Rang) | `#5D4037` | Header chính, nút CTA, sidebar |
| **Primary Light** | Nâu Caramel | `#8D6E63` | Hover state, border phụ |
| **Secondary** | Vàng Lúa Mì | `#F9A825` | Accent, badge, icon nổi bật |
| **Secondary Light** | Vàng Nhạt | `#FFF8E1` | Background nhẹ, highlight |
| **Success** | Xanh Lục | `#43A047` | Trạng thái thành công, số dương |
| **Danger** | Đỏ Gạch | `#E53935` | Trạng thái lỗi, số âm |
| **Warning** | Cam Ổi | `#FB8C00` | Cảnh báo, chờ duyệt |
| **Background** | Kem Sữa | `#FFFDF7` | Nền trang chính |
| **Surface** | Trắng Ngà | `#FFFFFF` | Card, modal, form |
| **Text Primary** | Nâu Đen | `#3E2723` | Văn bản chính |
| **Text Secondary** | Xám Nhạt | `#795548` | Văn bản phụ, label |
| **Border** | Nâu Cà Phê | `#D7CCC8` | Đường kẻ, divider |

### 2.2 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Heading H1 | Inter / Noto Sans | 28px | 700 |
| Heading H2 | Inter / Noto Sans | 22px | 600 |
| Heading H3 | Inter / Noto Sans | 18px | 600 |
| Body Text | Inter / Noto Sans | 14px | 400 |
| Small / Label | Inter / Noto Sans | 12px | 500 |
| Numbers / Data | JetBrains Mono / Roboto Mono | 14px | 500 |
| Currency | JetBrains Mono / Roboto Mono | 16px | 600 |

### 2.3 Bố cục & Component Library

**Layout chính:**
```
┌─────────────────────────────────────────────────┐
│  TOPBAR: Logo | Tên Chi Nhánh | User | Notif   │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ SIDEBAR  │         MAIN CONTENT AREA            │
│          │                                      │
│ - Dashboard│    (Grid / Table / Form)           │
│ - Nhập Hàng│                                    │
│ - Xuất Hàng│                                    │
│ - Tồn Kho │                                      │
│ - Bán Hàng│                                      │
│ - Lương  │                                      │
│ - Chi Phí │                                      │
│ - Báo Cáo│                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

**Sidebar:** Fixed left, 240px width, màu `#5D4037`, icon + text trắng
**Topbar:** Fixed top, 60px height, shadow nhẹ
**Content Area:** Scrollable, padding 24px, background `#FFFDF7`
**Cards:** Border-radius 12px, shadow `0 2px 8px rgba(0,0,0,0.08)`, padding 20px
**Tables:** Header màu `#5D4037`, row hover `#FFF8E1`, border `#D7CCC8`
**Buttons:**
  - Primary: bg `#F9A825`, text `#3E2723`, hover darken 10%
  - Secondary: bg `#FFFFFF`, border `#5D4037`, text `#5D4037`
  - Danger: bg `#E53935`, text white
  - Disabled: bg `#D7CCC8`, text `#9E9E9E`

---

## PHẦN III: KIẾN TRÚC & CÔNG NGHỆ

---

### 3.1 Tech Stack đề xuất

**Frontend:** Next.js 16.2+ (App Router) + TypeScript + Tailwind CSS + Shadcn UI
**Backend:** Next.js API Routes (Serverless) + Prisma ORM
**Database:** PostgreSQL 15+ (relational, tốt cho dữ liệu tài chính)
**Authentication:** NextAuth.js v5 + JWT + Role-Based Access Control (RBAC)
**State Management:** Zustand hoặc TanStack Query (React Query)
**Charts:** Recharts hoặc Chart.js
**File Storage:** Local storage (development) / S3-compatible (production)
**Deployment:** Docker + Docker Compose + Nginx (reverse proxy)

### 3.2 Docker Architecture

```
┌─────────────────────────────────────────────────────┐
│                    NGINX (Port 80/443)              │
│              Reverse Proxy + SSL Termination         │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐         ┌───────────────┐
│   Next.js App │         │  PostgreSQL   │
│   (Port 3000) │◄──────►│   (Port 5432) │
│   Container   │         │   Container   │
└───────────────┘         └───────────────┘
```

### 3.3 Docker Compose Services

```yaml
# docker-compose.yml structure
services:
  - app: Next.js application
  - db: PostgreSQL 15
  - nginx: Reverse proxy + SSL
  volumes:
    - postgres_data: Persistent database
    - app_data: File uploads
```

### 3.4 Environment Variables Template

```env
# .env.example - Template for environment variables

# Application
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/qlcn?schema=public

# Authentication
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# JWT
JWT_SECRET=your-jwt-secret-key-min-32-chars
JWT_EXPIRES_IN=8h

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Upload (optional for S3)
# AWS_S3_BUCKET=your-bucket-name
# AWS_S3_REGION=ap-southeast-1
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 3.5 Database Schema Overview

```
Organizations (Tổng Công Ty)
├── Branches (Chi Nhánh) — thuộc 1 Organization
│   ├── Departments (Phòng Ban) — thuộc 1 Branch
│   │   └── Employees (Nhân Viên) — thuộc 1 Department
│   ├── Products (Danh Mục Sản Phẩm) — thuộc 1 Branch
│   ├── ImportOrders (Phiếu Nhập Hàng) — thuộc 1 Branch
│   ├── ExportOrders (Phiếu Xuất Hàng) — thuộc 1 Branch
│   ├── InventorySnapshots (Tồn Kho) — thuộc 1 Branch
│   ├── DailyProduction (Năng Suất Lao Động) — thuộc 1 Branch
│   ├── SalaryRecords (Bảng Lương) — thuộc 1 Branch
│   ├── CostRecords (Chi Phí) — thuộc 1 Branch
│   └── SalesRecords (Nhật Ký Bán Hàng) — thuộc 1 Branch
└── GlobalPriceLists (Bảng Giá Toàn Công Ty) — thuộc Organization
```

---

## PHẦN IV: PHÂN TÍCH NGHIỆP VỤ CHI TIẾT

---

### 4.1 Các Sheet Excel hiện tại → Ánh xạ thành Module

| Sheet Excel | Module Phần mềm | Mô tả |
|------------|-----------------|--------|
| `Nhập Hàng` | **Module Nhập Hàng** | Phiếu nhập hàng theo ngày: tên món, vốn, số lượng nhập, tặng, thành tiền |
| `Nhập hàng New` | **Module Nhập Hàng (Nâng cao)** | Sheet mở rộng với nhiều điểm bán cùng lúc |
| `Chi Phí` | **Module Chi Phí** | Chi phí cố định: đồng phục, quầy kệ, lò vi sóng, túi nilon... |
| `Giá NhậpXuất` | **Module Danh Mục & Bảng Giá** | Danh mục sản phẩm: tên, giá vốn, giá bán; chi phí trên mỗi nắm |
| `Lương NV` | **Module Lương & Năng Suất** | Chấm công theo tuần, tính lương, phụ cấp |
| `Nhật ký bán hàng T4/T3` | **Module Bán Hàng** | Nhật ký bán hàng theo ngày, theo điểm bán |
| `Lương&Thưởng` | **Module Lương & Thưởng** | Tổng hợp lương, thưởng, phạt |

---

### 4.2 Module Nhập Hàng

**Mục đích:** Quản lý việc nhập nguyên liệu/sản phẩm vào chi nhánh.

**Nghiệp vụ từ Excel:**
- Nhập hàng theo ngày
- Mỗi dòng: Tên sản phẩm | Giá vốn | Số lượng nhập | Số lượng tặng | Thành tiền (= giá vốn × số lượng nhập)
- Tính tổng vốn nhập hàng trong ngày
- Phân biệt: hàng nhập **bán** và hàng nhập **tặng** (không tính vào doanh thu)

**Danh mục sản phẩm (từ Excel):**
| STT | Mặt Hàng | Giá Vốn | Giá Bán |
|-----|-----------|---------|---------|
| 1 | Thanh cua trứng Mayo | 13,000 | 20,000 |
| 2 | Pate phô mai kéo sợi | 13,000 | 20,000 |
| 3 | Heo cao bồi xúc xích | 13,000 | 20,000 |
| 4 | Gà tomyum | 13,000 | 20,000 |
| 5 | Gà teriyaki | 13,000 | 20,000 |
| 6 | Bò BBQ | 13,000 | 20,000 |
| 7 | Tôm đút lò | 13,000 | 20,000 |
| 8 | Cá ngừ | 16,000 | 22,000 |
| 9 | Chả cá xốt cay | 13,000 | 20,000 |
| 10 | Trứng xúc xích mayo | 13,000 | 20,000 |
| 11 | Cá hồi mayo | 16,000 | 20,000 |
| 12 | Xúc xích siêu phomai | 13,000 | 20,000 |

**Chi phí trên mỗi nắm:**
| Loại | Chi phí |
|------|---------|
| Vận chuyển | ~83/nắm |
| Quà | 1,000/nắm |
| Túi | 50/nắm |
| Điện | 100/nắm |
| Đồ chơi | 3,450/nắm → bán 4,099 |

**Luồng nghiệp vụ:**
```
1. Giám Đốc Chi Nhánh chọn ngày nhập hàng
2. Chọn sản phẩm từ danh mục
3. Nhập số lượng nhập, số lượng tặng
4. Hệ thống tự động tính thành tiền = giá vốn × số lượng
5. Tính tổng vốn nhập ngày
6. Cập nhật tồn kho tự động
7. Lưu phiếu nhập hàng
```

**Use Cases:**
- **UC_NH_01:** Tạo phiếu nhập hàng mới
- **UC_NH_02:** Sửa phiếu nhập hàng (chỉ cùng ngày, cùng chi nhánh)
- **UC_NH_03:** Xóa phiếu nhập hàng (chỉ Tổng GD hoặc GD Chi Nhánh)
- **UC_NH_04:** Xem lịch sử nhập hàng theo ngày/tháng
- **UC_NH_05:** In phiếu nhập hàng

**Ai được phép:**
| Vai trò | Tạo | Sửa | Xóa | Xem |
|---------|------|------|------|------|
| Tổng GD | ✓ | ✓ | ✓ | Tất cả |
| GD Chi Nhánh | ✓ | ✓ | ✓ | Chi nhánh mình |
| Trưởng Phòng | ✗ | ✗ | ✗ | Phòng mình |
| Nhân Viên | ✗ | ✗ | ✗ | ✗ |

---

### 4.3 Module Xuất Hàng (Bán Hàng)

**Mục đích:** Quản lý xuất hàng bán và xuất hàng tặng.

**Nghiệp vụ từ Excel:**
- Mỗi dòng: Tên sản phẩm | Giá bán | Số lượng xuất | Thành tiền (= giá bán × số lượng)
- Tính tổng doanh thu bán hàng trong ngày
- Phân biệt: hàng bán (tính doanh thu) vs hàng tặng (không tính doanh thu)

**Luồng nghiệp vụ:**
```
1. Giám Đốc Chi Nhánh chọn ngày xuất hàng
2. Chọn điểm bán (các điểm thuộc chi nhánh)
3. Nhập số lượng bán cho mỗi sản phẩm tại mỗi điểm bán
4. Hệ thống tự động tính thành tiền
5. Tính tổng doanh thu theo điểm bán và tổng chi nhánh
6. Cập nhật tồn kho tự động
```

**Use Cases:**
- **UC_XH_01:** Tạo phiếu xuất hàng (bán)
- **UC_XH_02:** Ghi nhận hàng tặng
- **UC_XH_03:** Xem doanh thu theo điểm bán
- **UC_XH_04:** Xem doanh thu theo ngày/tuần/tháng

**Các điểm bán (xuất từ dữ liệu Excel):**
- VTD (Xuân La)
- XL (Xuân Đỉnh)
- XĐ Sau (Xuân Đỉnh Sau)
- Cổ Nhuế A
- Cổ Nhuế B
- Đông Ngạc
- Đông Ngạc A
- Đông Ngạc B
- Thụy Phương

---

### 4.4 Module Tồn Kho

**Mục đích:** Theo dõi tồn kho theo thời gian thực.

**Công thức:**
```
Tồn kho cuối ngày = Tồn kho đầu ngày + Nhập trong ngày - Xuất (bán + tặng)
```

**Nghiệp vụ:**
- Mỗi sản phẩm có số lượng tồn
- Cảnh báo khi tồn kho < ngưỡng tối thiểu
- Lịch sử biến động tồn kho (nhập, xuất, điều chỉnh)

**Use Cases:**
- **UC_TK_01:** Xem tồn kho hiện tại
- **UC_TK_02:** Xem lịch sử biến động tồn kho
- **UC_TK_03:** Điều chỉnh tồn kho (GD Chi Nhánh+)
- **UC_TK_04:** Cảnh báo tồn kho thấp

---

### 4.5 Module Năng Suất Lao Động & Lịch Làm Việc

**Mục đích:** Ghi nhận năng suất làm việc và quản lý lịch của nhân viên.

**Nghiệp vụ từ Excel:**
- Mỗi nhân viên có 2 ca làm: **Sáng (S)** và **Chiều (C)**
- Mỗi ca ghi nhận số nắm làm được
- Tính tổng năng suất theo tuần

**Cấu trúc dữ liệu:**
```typescript
WorkSchedule {
  employeeId: string
  branchId: string
  sellingPointId: string        // VTD, XL, CN_A...
  workDate: date
  shift: 'SANG' | 'CHIEU'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  approvedById: string | null
}

DailyProduction {
  employeeId: string
  branchId: string
  sellingPointId: string
  workDate: date
  shift: 'SANG' | 'CHIEU'
  quantity: number              // số nắm làm được
  
  // Lương tính theo ngày làm việc
  employeeStatus: 'PROBATION' | 'TRIAL' | 'OFFICIAL'  // Theo ngày vào làm
  baseSalary: Decimal           // Lương cơ bản = 0/50k/70k-80k tùy ngày
  bonusAmount: Decimal          // Thưởng = 500đ × số nắm (nếu ≥ 50 suất)
  commissionAmount: Decimal      // Hoa hồng nước (nếu có)
  totalSalary: Decimal          // Tổng lương ca này
}
```

**Quy tắc tính lương theo ngày:**
```typescript
function calculateDailySalary(startDate: Date, workDate: Date, sellingPoint: SellingPoint) {
  const daysWorked = differenceInDays(workDate, startDate) + 1;
  
  if (daysWorked === 1) {
    return { status: 'PROBATION', baseSalary: 0 }; // Học việc, không lương
  } else if (daysWorked <= 3) {
    return { status: 'TRIAL', baseSalary: 50000 }; // Thử việc 50k/ca
  } else {
    // Chính thức: lương theo nhóm điểm bán
    const salaryPerShift = sellingPoint.group === 'GROUP_1' ? 80000 : 75000;
    return { status: 'OFFICIAL', baseSalary: salaryPerShift };
  }
}
```

**Quy tắc thưởng cơm nắm:**
```typescript
function calculateBonus(quantity: number, productType: 'COM_NAM' | 'WATER') {
  if (productType === 'COM_NAM' && quantity >= 50) {
    return quantity * 500; // 500đ/suất nếu bán >= 50 suất
  }
  return 0;
}
```

**Luồng nghiệp vụ:**
```
1. Nhân viên đăng ký lịch làm việc (chọn ngày, ca, điểm bán)
2. Giám đốc duyệt lịch → status = APPROVED
3. Cuối ca, nhập số nắm làm được → tự động tính lương
4. Hệ thống tự động tính thưởng nếu ≥ 50 suất
5. Tính tổng năng suất theo ngày, theo tuần
```

**Use Cases:**
- **UC_NS_01:** Đăng ký lịch làm việc (Nhân Viên)
- **UC_NS_02:** Duyệt lịch làm việc (Giám Đốc)
- **UC_NS_03:** Nhập năng suất hàng ngày (Tất cả vai trò)
- **UC_NS_04:** Xem năng suất theo nhân viên/ngày/tuần
- **UC_NS_05:** Phê duyệt năng suất (Trưởng Phòng+)
- **UC_NS_06:** Xuất báo cáo năng suất

**Ai được phép:**
| Vai trò | Đăng ký lịch | Duyệt lịch | Nhập NS | Duyệt NS | Xem |
|---------|--------------|------------|---------|----------|-----|
| Nhân Viên | ✓ (chỉ mình) | ✗ | Chỉ NS của mình | ✗ | Chỉ NS của mình |
| Trưởng Phòng | ✓ | ✓ (phòng mình) | ✓ | ✓ (phòng mình) | Phòng mình |
| GD Chi Nhánh | ✓ | ✓ (chi nhánh) | ✓ | ✓ (chi nhánh) | Chi nhánh |
| Tổng GD | ✓ | ✓ (toàn công ty) | ✓ | ✓ (toàn công ty) | Tất cả |

---

### 4.6 Module Lương & Thưởng

**Mục đích:** Tính lương, thưởng cho nhân viên theo kỳ (tuần/tháng).

**Nghiệp vụ từ Excel:**
- Lương cơ bản = tổng lương các ca đã làm (0/50k/70-80k tùy ngày)
- Thưởng sản lượng = số nắm × 500đ (nếu ≥ 50 suất/ca)
- Hoa hồng nước = % doanh số nước
- Phụ cấp: xa, gần, chuyên cần
- Phạt: đi muộn, về sớm
- Tạm ứng lương
- Lương được tính theo tuần

**Công thức tính lương:**
```
Tổng lương = Lương theo ca + Thưởng sản lượng + Hoa hồng + Phụ cấp - Tạm ứng - Phạt
```

**Các loại phụ cấp:**
| Loại | Giá trị | Ghi chú |
|------|---------|---------|
| Làm xa | 50,000/tuần | Điểm bán xa |
| Ca sáng gần | 50,000/tuần | |
| Ca chiều gần | 50,000/tuần | |
| Chuyên cần | 200,000/tuần | Không đi muộn, về sớm |
| HV buổi đầu | 50,000 | Ngày đầu tiên |

**Luồng nghiệp vụ:**
```
1. Nhân viên đăng ký lịch → Giám đốc duyệt
2. Cuối ca, nhập năng suất → hệ thống tự tính lương ca
3. Cuối tuần, hệ thống tổng hợp lương từng nhân viên
4. GD Chi Nhánh duyệt bảng lương
5. Tổng GD phê duyệt tổng thể
6. Thanh toán lương
```

**Use Cases:**
- **UC_LUONG_01:** Tính lương tự động cuối kỳ
- **UC_LUONG_02:** Duyệt bảng lương (Trưởng Phòng/GD)
- **UC_LUONG_03:** Phê duyệt bảng lương (Tổng GD)
- **UC_LUONG_04:** Cập nhật tạm ứng lương
- **UC_LUONG_05:** Cập nhật thưởng/phạt
- **UC_LUONG_06:** Xem phiếu lương cá nhân
- **UC_LUONG_07:** Xuất bảng lương Excel/PDF

---

### 4.7 Module Chi Phí

**Mục đích:** Quản lý chi phí hoạt động của chi nhánh.

**Nghiệp vụ từ Excel:**
- Chi phí cố định: đồng phục, quầy kệ, lò vi sóng, thùng đá, túi nilon, đồ chơi, túi mù
- Chi phí theo ngày: vận chuyển, điện
- Tính tổng chi phí theo tháng

**Danh mục chi phí:**
| Loại | Đơn giá | Ghi chú |
|------|---------|---------|
| Đồng phục | 200,000 | /bộ |
| Quầy kệ | 1,000,000 | /cái |
| Lò vi sóng | 1,450,000-1,700,000 | /cái |
| Thùng đá | 300,000 | /cái |
| Túi nilon | 43,000 | /kg |
| Đồ chơi | 3,450 | /cái |
| Túi mù | 1,240 | /cái |
| Vận chuyển | 83/nắm | |
| Quà | 1,000/nắm | |
| Điện | 100/nắm | |

**Use Cases:**
- **UC_CP_01:** Thêm chi phí cố định
- **UC_CP_02:** Thêm chi phí theo ngày/sản lượng
- **UC_CP_03:** Xem tổng chi phí theo tháng/chi nhánh
- **UC_CP_04:** Phân bổ chi phí cho từng sản phẩm

**Ai được phép:**
| Vai trò | Thêm | Sửa | Xóa | Xem |
|---------|------|------|------|------|
| Tổng GD | ✓ | ✓ | ✓ | Tất cả |
| GD Chi Nhánh | ✓ | ✓ | ✓ | Chi nhánh mình |
| Trưởng Phòng | ✗ | ✗ | ✗ | ✗ |
| Nhân Viên | ✗ | ✗ | ✗ | ✗ |

---

### 4.8 Module Báo Cáo & Thống Kê

**Các loại báo cáo:**

**1. Dashboard Chiến Lược (MỚI - Quan trọng)**
- Biểu đồ doanh số theo ngày (14 ngày gần nhất tính từ ngày chọn)
- Cho phép chọn ngày bắt đầu để theo dõi chiến lược
- Lọc theo: điểm bán, sản phẩm
- Hiển thị: doanh số, lãi ròng
- So sánh với ngày hôm trước, tuần trước

**2. Báo cáo nhập-xuất-tồn**
- Theo ngày / tuần / tháng
- Theo chi nhánh / điểm bán
- Tổng hợp và chi tiết

**3. Báo cáo doanh thu**
- Theo ngày / tuần / tháng
- Theo chi nhánh
- Theo điểm bán
- So sánh với kỳ trước

**4. Báo cáo lương**
- Bảng lương tổng hợp theo chi nhánh
- Chi tiết lương từng nhân viên
- Biểu đồ lương theo tháng

**5. Báo cáo chi phí**
- Tổng chi phí theo tháng
- Chi phí theo loại
- Chi phí trên mỗi nắm

**6. Báo cáo năng suất**
- Tổng năng suất theo ngày/tuần
- Top nhân viên
- So sánh năng suất giữa các điểm bán

**7. Dashboard Tổng**
- (Chỉ Tổng GD) Tổng quan toàn công ty
- Biểu đồ doanh thu, chi phí, lợi nhuận
- So sánh chi nhánh

**7. Dashboard Chiến Lược (MỚI - Quan trọng)**
- **Biểu đồ doanh số 14 ngày**: Hiển thị doanh số theo từng ngày, tính từ ngày nhập vào trở về trước
- **Mục đích**: Theo dõi chiến lược kinh doanh theo thời gian
- **Tùy biến**: Chọn ngày bắt đầu, lọc theo điểm bán, sản phẩm
- **So sánh**: So sánh doanh số với ngày trước đó, tuần trước

---

## PHẦN V: DATA MODEL CHI TIẾT

---

### 5.1 Bảng Users (Người dùng)

```typescript
User {
  id: UUID
  username: string           // đăng nhập
  password: string           // bcrypt hash
  fullName: string           // họ tên đầy đủ
  role: ENUM('ADMIN', 'BRANCH_DIRECTOR', 'DEPARTMENT_HEAD', 'EMPLOYEE')
  branchId: UUID | null       // chi nhánh (null cho Tổng GD)
  departmentId: UUID | null   // phòng ban (null cho Tổng GD/GD CN)
  email: string
  phone: string
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 5.2 Bảng Organizations

```typescript
Organization {
  id: UUID
  name: string                // "Cơm Nắm ABC"
  logo: string
  address: string
  phone: string
  taxCode: string
  createdAt: timestamp
}
```

### 5.3 Bảng Branches (Chi nhánh)

```typescript
Branch {
  id: UUID
  organizationId: UUID
  name: string                // "Chi nhánh Hà Nội 1"
  code: string                // "CN01"
  address: string
  isActive: boolean
  createdAt: timestamp
}
```

### 5.4 Bảng Departments (Phòng ban)

```typescript
Department {
  id: UUID
  branchId: UUID
  name: string                // "Phòng Sản Xuất", "Phòng Kinh Doanh"
  code: string
  managerId: UUID             // Trưởng phòng
  isActive: boolean
}
```

### 5.5 Bảng SellingPoints (Điểm bán)

```typescript
SellingPoint {
  id: UUID
  branchId: UUID
  name: string                // "VTD", "XL", "Cổ Nhuế A"
  code: string
  address: string
  group: ENUM('GROUP_1', 'GROUP_2')  // Nhóm 1 = 80k, Nhóm 2 = 75k
  salaryPerShift: Decimal      // 80000 hoặc 75000
  isActive: boolean
}
```

**Quy tắc lương theo nhóm:**
- **GROUP_1**: 80,000đ/ca (điểm bán xa/khó khăn hơn)
- **GROUP_2**: 75,000đ/ca (điểm bán gần/hỗ trợ tốt hơn)

### 5.6 Bảng Products (Danh mục sản phẩm)

```typescript
Product {
  id: UUID
  branchId: UUID | null       // null = áp dụng toàn công ty
  name: string
  code: string
  costPrice: number            // giá vốn (VNĐ)
  sellingPrice: number         // giá bán (VNĐ)
  unit: string                 // "nắm", "cái"
  image: string
  type: ENUM('COM_NAM', 'WATER', 'OTHER')  // Loại sản phẩm
  isActive: boolean
  createdAt: timestamp
  
  // Cơ chế thưởng cho cơm nắm
  bonusThreshold: number       @default(50)   // Số suất tối thiểu để được thưởng
  bonusPerUnit: Decimal         @default(500)  // Thưởng 500đ/suất nếu bán >= 50
  
  // Cơ chế hoa hồng cho nước
  commissionRate: Decimal       @default(0)    // % hoa hồng
}
```

**Quy tắc thưởng:**
- **Cơm nắm (COM_NAM)**: Thưởng 500đ/suất nếu bán được ≥ 50 suất/ca
- **Nước (WATER)**: Hoa hồng theo % doanh số

### 5.7 Bảng ImportOrders (Phiếu nhập hàng)

```typescript
ImportOrder {
  id: UUID
  branchId: UUID
  importDate: date
  totalAmount: number          // tổng tiền vốn
  note: string
  createdBy: UUID
  approvedBy: UUID | null
  status: ENUM('DRAFT', 'APPROVED')
  createdAt: timestamp
}

ImportOrderItem {
  id: UUID
  importOrderId: UUID
  productId: UUID
  quantity: number             // số lượng nhập
  giftedQuantity: number       // số lượng tặng
  unitPrice: number            // giá vốn
  totalAmount: number          // = quantity × unitPrice
}
```

### 5.8 Bảng ExportOrders (Phiếu xuất hàng)

```typescript
ExportOrder {
  id: UUID
  branchId: UUID
  sellingPointId: UUID
  exportDate: date
  totalRevenue: number         // tổng doanh thu
  note: string
  createdBy: UUID
  status: ENUM('DRAFT', 'APPROVED')
  createdAt: timestamp
}

ExportOrderItem {
  id: UUID
  exportOrderId: UUID
  productId: UUID
  quantity: number             // số lượng bán
  giftedQuantity: number       // số lượng tặng
  unitPrice: number            // giá bán
  totalAmount: number          // = quantity × unitPrice
}
```

### 5.9 Bảng Inventory (Tồn kho)

```typescript
Inventory {
  id: UUID
  branchId: UUID
  productId: UUID
  date: date
  openingStock: number         // tồn đầu ngày
  importQuantity: number       // nhập trong ngày
  exportQuantity: number       // xuất trong ngày
  giftedQuantity: number       // tặng trong ngày
  closingStock: number         // tồn cuối ngày
  updatedAt: timestamp
}
```

### 5.10 Bảng WorkSchedule (Lịch làm việc - MỚI)

```typescript
WorkSchedule {
  id: UUID
  employeeId: UUID
  branchId: UUID
  sellingPointId: UUID
  workDate: date
  shift: ENUM('SANG', 'CHIEU', 'FULL')
  status: ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
  approvedById: UUID | null
  note: string
  createdAt: timestamp
}
```

**Quy tắc:**
- Nhân viên đăng ký lịch → Giám đốc duyệt → Mới được tính công
- Mỗi nhân viên chỉ đăng ký 1 ca/ngày
- Link với DailyProduction khi được duyệt

### 5.11 Bảng DailyProduction (Năng suất lao động)

```typescript
DailyProduction {
  id: UUID
  employeeId: UUID
  branchId: UUID
  sellingPointId: UUID
  productionDate: date
  shift: ENUM('SANG', 'CHIEU')
  quantity: number             // số nắm làm được
  
  // Lương tính theo ngày làm việc
  employeeStatus: ENUM('PROBATION', 'TRIAL', 'OFFICIAL')  // Theo ngày vào làm
  baseSalary: Decimal          // Lương cơ bản = 0/50k/70k-80k tùy ngày
  bonusAmount: Decimal         // Thưởng = 500đ × số nắm (nếu ≥ 50 suất)
  commissionAmount: Decimal     // Hoa hồng nước (nếu có)
  totalSalary: Decimal         // Tổng lương ca này
  
  workScheduleId: UUID | null   // Link đến lịch đã duyệt
  isApproved: boolean
  approvedById: UUID | null
  note: string
  createdAt: timestamp
}
```

### 5.11 Bảng SalaryRecords (Bảng lương)

```typescript
SalaryRecord {
  id: UUID
  employeeId: UUID
  branchId: UUID
  periodType: ENUM('WEEKLY', 'MONTHLY')
  periodStart: date
  periodEnd: date
  totalProductionSalary: number
  allowances: number           // tổng phụ cấp
  bonuses: number              // tổng thưởng
  deductions: number           // tổng khấu trừ
  advanceAmount: number        // tạm ứng
  grossSalary: number          // tổng lương gross
  netSalary: number            // lương thực nhận
  status: ENUM('PENDING', 'APPROVED_BY_BRANCH', 'APPROVED_BY_ORG', 'PAID')
  approvedByBranch: UUID | null
  approvedByOrg: UUID | null
  createdAt: timestamp
}

SalaryAdjustment {
  id: UUID
  salaryRecordId: UUID
  type: ENUM('BONUS', 'DEDUCTION', 'ALLOWANCE', 'ADJUSTMENT')
  amount: number
  reason: string
  createdBy: UUID
}
```

### 5.12 Bảng CostRecords (Chi phí)

```typescript
CostCategory {
  id: UUID
  name: string                // "Đồng phục", "Quầy kệ", "Vận chuyển"
  type: ENUM('FIXED', 'VARIABLE')
  unit: string               // "cái", "kg", "nắm"
  defaultUnitPrice: number
  isActive: boolean
}

CostRecord {
  id: UUID
  branchId: UUID
  categoryId: UUID
  costDate: date
  quantity: number
  unitPrice: number
  totalAmount: number
  note: string
  createdBy: UUID
  createdAt: timestamp
}
```

---

## PHẦN VI: USE CASE TỔNG HỢP

---

### 6.1 Ma trận Use Cases

| UC | Tên Use Case | Tổng GD | GD CN *(toàn quyền trong chi nhánh)* | TP | NV |
|----|-------------|---------|-------|----|----|
| **UC_AUTH** | | | | | |
| UC_01 | Đăng nhập | ✓ | ✓ | ✓ | ✓ |
| UC_02 | Đăng xuất | ✓ | ✓ | ✓ | ✓ |
| UC_03 | Đổi mật khẩu | ✓ | ✓ | ✓ | ✓ |
| **UC_USER** | | | | | |
| UC_04 | Quản lý người dùng | ✓ | ✓ (chi nhánh) | ✗ | ✗ |
| UC_05 | Phân quyền | ✓ | ✗ | ✗ | ✗ |
| **UC_BRANCH** | | | | | |
| UC_06 | Tạo chi nhánh | ✓ | ✗ | ✗ | ✗ |
| UC_07 | Cập nhật chi nhánh | ✓ | ✗ | ✗ | ✗ |
| **UC_PRODUCT** | | | | | |
| UC_08 | Thêm sản phẩm | ✓ | ✓ | ✗ | ✗ |
| UC_09 | Cập nhật sản phẩm | ✓ | ✓ | ✗ | ✗ |
| UC_10 | Xóa sản phẩm | ✓ | ✓ (chi nhánh) | ✗ | ✗ |
| UC_11 | Cập nhật bảng giá | ✓ | ✓ | ✗ | ✗ |
| **UC_IMPORT** | | | | | |
| UC_12 | Tạo phiếu nhập hàng | ✓ | ✓ | ✗ | ✗ |
| UC_13 | Sửa phiếu nhập | ✓ | ✓ | ✗ | ✗ |
| UC_14 | Xóa phiếu nhập | ✓ | ✓ | ✗ | ✗ |
| UC_15 | Duyệt phiếu nhập | ✓ | ✓ | ✗ | ✗ |
| UC_16 | Xem lịch sử nhập hàng | ✓ | ✓ | ✗ | ✗ |
| **UC_EXPORT** | | | | | |
| UC_17 | Tạo phiếu xuất hàng | ✓ | ✓ | ✗ | ✗ |
| UC_18 | Ghi nhận hàng tặng | ✓ | ✓ | ✗ | ✗ |
| UC_19 | Xem doanh thu | ✓ | ✓ | ✗ | ✗ |
| **UC_INVENTORY** | | | | | |
| UC_20 | Xem tồn kho | ✓ | ✓ | ✓ | ✓ |
| UC_21 | Điều chỉnh tồn kho | ✓ | ✓ | ✗ | ✗ |
| UC_22 | Cảnh báo tồn kho | ✓ | ✓ | ✓ | ✓ |
| **UC_PRODUCTION** | | | | | |
| UC_23 | Nhập năng suất | ✓ | ✓ | ✓ | ✓ |
| UC_24 | Duyệt năng suất | ✓ | ✓ | ✓ | ✗ |
| UC_25 | Xem năng suất NV | ✓ | ✓ | ✓ | Chỉ mình |
| **UC_SALARY** | | | | | |
| UC_26 | Tính lương tự động | ✓ | ✓ | ✗ | ✗ |
| UC_27 | Duyệt bảng lương (CN) | ✓ | ✓ | ✗ | ✗ |
| UC_28 | Phê duyệt lương (TGĐ) | ✓ | ✗ | ✗ | ✗ |
| UC_29 | Cập nhật tạm ứng | ✓ | ✓ | ✗ | ✗ |
| UC_30 | Cập nhật thưởng/phạt | ✓ | ✓ | ✗ | ✗ |
| UC_31 | Xem phiếu lương | ✓ | ✓ | ✓ | Chỉ mình |
| **UC_COST** | | | | | |
| UC_32 | Thêm chi phí | ✓ | ✓ | ✗ | ✗ |
| UC_33 | Sửa chi phí | ✓ | ✓ | ✗ | ✗ |
| UC_34 | Xem chi phí | ✓ | ✓ (chi nhánh) | ✗ | ✗ |
| **UC_EMPLOYEE** *(MỚI)* | | | | | |
| UC_35 | Thêm nhân viên | ✓ | ✓ (chi nhánh) | ✗ | ✗ |
| UC_36 | Sửa thông tin nhân viên | ✓ | ✓ (chi nhánh) | ✗ | ✗ |
| UC_37 | Xóa nhân viên | ✓ | ✓ (chi nhánh) | ✗ | ✗ |
| UC_38 | Phân công nhân viên vào phòng | ✓ | ✓ (chi nhánh) | ✓ (phòng mình) | ✗ |
| UC_39 | Cập nhật lương/nắm nhân viên | ✓ | ✓ (chi nhánh) | ✗ | ✗ |
| **UC_REPORT** | | | | | |
| UC_35 | Báo cáo NXT | ✓ | ✓ | ✓ | ✗ |
| UC_36 | Báo cáo doanh thu | ✓ | ✓ | ✓ | ✗ |
| UC_37 | Báo cáo lương | ✓ | ✓ | ✓ | ✗ |
| UC_38 | Báo cáo chi phí | ✓ | ✓ | ✗ | ✗ |
| UC_39 | Báo cáo năng suất | ✓ | ✓ | ✓ | ✗ |
| UC_40 | Dashboard tổng | ✓ | ✓ | ✓ | ✗ |
| **UC_SELLING_POINT** | | | | | |
| UC_41 | Quản lý điểm bán | ✓ | ✓ | ✗ | ✗ |
| UC_42 | Thêm/Sửa/Xóa điểm bán | ✓ | ✓ (chi nhánh) | ✗ | ✗ |
| **UC_WORK_SCHEDULE** *(MỚI)* | | | | | |
| UC_43 | Đăng ký lịch làm việc | ✗ | ✓ (chỉ mình) | ✓ (chỉ mình) | ✓ (chỉ mình) |
| UC_44 | Duyệt lịch làm việc | ✓ | ✓ (chi nhánh) | ✓ (phòng mình) | ✗ |
| UC_45 | Hủy lịch làm việc | ✗ | ✓ (chỉ mình) | ✓ (chỉ mình) | ✓ (chỉ mình) |
| UC_46 | Xem lịch làm việc | ✓ (tất cả) | ✓ (chi nhánh) | ✓ (phòng mình) | Chỉ mình |
| **UC_BONUS** *(MỚI)* | | | | | |
| UC_47 | Tính thưởng cơm nắm | ✓ | ✓ | ✗ | ✗ |
| UC_48 | Tính hoa hồng nước | ✓ | ✓ | ✗ | ✗ |

---

## PHẦN VII: CÁC LUỒNG NGHIỆP VỤ CHÍNH

---

### 7.1 Luồng: Nhập hàng hàng ngày

```
Actor: Giám Đốc Chi Nhánh
Trigger: Hàng ngày, trước khi mở cửa

1. GD Chi Nhánh đăng nhập hệ thống
2. Chọn module "Nhập Hàng"
3. Chọn ngày nhập (mặc định = ngày hiện tại)
4. Hệ thống hiển thị danh sách sản phẩm với giá vốn
5. GD nhập số lượng nhập cho từng sản phẩm
6. GD nhập số lượng tặng (nếu có)
7. Hệ thống tự động:
   a. Tính thành tiền = số lượng × giá vốn
   b. Cập nhật tồn kho đầu ngày
   c. Tính tổng vốn nhập
8. GD xác nhận & lưu phiếu
9. Hệ thống gửi thông báo (nếu tồn kho thấp)
```

### 7.2 Luồng: Bán hàng & ghi nhận doanh thu

```
Actor: Giám Đốc Chi Nhánh
Trigger: Cuối ngày

1. GD đăng nhập, chọn module "Bán Hàng"
2. Chọn ngày, chọn điểm bán
3. Nhập số lượng bán cho mỗi sản phẩm tại điểm bán đó
4. Nhập số lượng tặng (nếu có)
5. Hệ thống tự động:
   a. Tính doanh thu = số lượng bán × giá bán
   b. Cập nhật tồn kho
   c. Tính lợi nhuận gộp = doanh thu - vốn
6. Lưu phiếu xuất hàng
7. (Đặc biệt) Nếu có điểm bán mới từ dữ liệu Excel → tự động tạo điểm bán mới
```

### 7.3 Luồng: Nhập năng suất lao động

```
Actor: Nhân Viên / Trưởng Phòng / GD Chi Nhánh
Trigger: Sau mỗi ca làm việc

Cách 1: Nhân viên tự nhập
1. NV đăng nhập
2. Chọn "Nhập Năng Suất"
3. Chọn ngày, ca (Sáng/Chiều)
4. Chọn điểm bán làm việc
5. Nhập số nắm làm được
6. Hệ thống hiển thị lương dự kiến = số nắm × lương/nắm
7. NV xác nhận & lưu

Cách 2: TP/GD nhập hộ
1. TP/GD đăng nhập
2. Chọn module "Năng Suất"
3. Chọn ngày, ca, điểm bán
4. Nhập năng suất cho từng nhân viên
5. Lưu
```

### 7.4 Luồng: Tính và phê duyệt lương

```
Trigger: Cuối tuần (thứ 6) hoặc cuối tháng

Phase 1: Tính lương tự động
1. Hệ thống chạy job tự động vào 23:00 thứ 6
2. Tổng hợp năng suất từng nhân viên trong tuần
3. Tính lương năng suất = Σ(số nắm × lương/nắm theo ca)
4. Áp dụng điều chỉnh (nếu số nắm < chuẩn)
5. Cộng phụ cấp, thưởng
6. Trừ tạm ứng
7. Tạo bản ghi SalaryRecord với status = PENDING

Phase 2: Duyệt bởi GD Chi Nhánh
8. GD Chi Nhánh đăng nhập, xem bảng lương
9. GD duyệt → status = APPROVED_BY_BRANCH
10. Hệ thống thông báo Tổng GD

Phase 3: Phê duyệt bởi Tổng GD
11. Tổng GD đăng nhập, xem tổng hợp lương các chi nhánh
12. Tổng GD phê duyệt → status = APPROVED_BY_ORG
13. Hệ thống thông báo GD Chi Nhánh

Phase 4: Thanh toán
14. Kế toán thực hiện thanh toán
15. Cập nhật status = PAID
16. Nhân viên nhận lương
```

### 7.5 Luồng: Dashboard Chiến Lược 14 Ngày (MỚI)

```
Actor: Giám Đốc Chi Nhánh / Tổng Giám Đốc
Trigger: Người dùng vào Dashboard

1. Chọn ngày bắt đầu (mặc định = ngày hiện tại)
2. Hệ thống tự động lấy 14 ngày trước ngày được chọn
3. Hiển thị biểu đồ đường doanh số theo từng ngày
4. Cho phép lọc theo:
   - Điểm bán (tùy chọn)
   - Sản phẩm (tùy chọn)
5. Hiển thị thêm:
   - Doanh số tổng 14 ngày
   - So sánh với 14 ngày trước đó (% tăng/giảm)
   - Điểm bán/doanh số cao nhất
   - Xu hướng (tăng/giảm)
```

### 7.6 Luồng: Đăng ký & Duyệt Lịch Làm Việc (MỚI)

```
Actor: Nhân Viên / Giám Đốc Chi Nhánh

=== Nhân viên đăng ký lịch ===
1. NV đăng nhập
2. Vào mục "Lịch Làm Việc"
3. Chọn ngày muốn làm
4. Chọn ca (Sáng/Chiều)
5. Chọn điểm bán
6. Nhấn "Đăng ký"
7. Trạng thái = PENDING (chờ duyệt)

=== Giám đốc duyệt lịch ===
8. GD đăng nhập
9. Vào mục "Duyệt Lịch"
10. Xem danh sách lịch chờ duyệt
11. Duyệt/Từ chối từng lịch
12. Trạng thái = APPROVED/REJECTED

=== Cuối ca, nhập năng suất ===
13. Sau ca làm, nhập số nắm làm được
14. Hệ thống tự động tính lương:
    - Ngày 1 → 0đ (học việc)
    - Ngày 2-3 → 50,000đ
    - Ngày 4+ → 70,000-80,000đ (tùy điểm bán)
15. Nếu bán >= 50 suất → cộng thưởng 500đ/suất
```

### 7.7 Luồng: Báo cáo tổng hợp (Tổng GD)

```
1. Tổng GD đăng nhập
2. Vào Dashboard → thấy tổng quan:
   - Tổng doanh thu tháng
   - Tổng chi phí tháng
   - Lợi nhuận gộp
   - So sánh với tháng trước
3. Drill down theo chi nhánh
4. Drill down theo ngày
5. Drill down theo sản phẩm
6. Export báo cáo PDF/Excel
```

---

## PHẦN VIII: API DESIGN (RESTful)

---

### 8.1 Authentication APIs

```
POST   /api/auth/login         { username, password } → { token, user }
POST   /api/auth/logout        { } → { success }
GET    /api/auth/me            → { user }
PUT    /api/auth/password      { oldPassword, newPassword } → { success }
```

### 8.2 User & Role APIs

```
GET    /api/users              → [User] (phân trang, lọc theo branch/dept)
POST   /api/users              { ...userData } → { user }
PUT    /api/users/:id          { ...userData } → { user }
DELETE /api/users/:id          → { success }
PUT    /api/users/:id/role     { role } → { user }
```

### 8.3 Branch APIs

```
GET    /api/branches           → [Branch]
POST   /api/branches           { ...branchData } → { branch }
PUT    /api/branches/:id       { ...branchData } → { branch }
DELETE /api/branches/:id       → { success }
GET    /api/branches/:id/summary → { stats }
```

### 8.4 Product APIs

```
GET    /api/products           → [Product] (lọc theo branch)
POST   /api/products           { ...productData } → { product }
PUT    /api/products/:id        { ...productData } → { product }
DELETE /api/products/:id       → { success }
PUT    /api/products/:id/price  { costPrice, sellingPrice } → { product }
```

### 8.5 Import Order APIs

```
GET    /api/import-orders      ?branchId&dateFrom&dateTo → [ImportOrder]
POST   /api/import-orders      { branchId, date, items[] } → { order }
PUT    /api/import-orders/:id  { items[] } → { order }
DELETE /api/import-orders/:id  → { success }
POST   /api/import-orders/:id/approve → { order }
GET    /api/import-orders/:id  → { order, items[] }
```

### 8.6 Export Order APIs

```
GET    /api/export-orders      ?branchId&sellingPointId&dateFrom&dateTo
POST   /api/export-orders      { branchId, sellingPointId, date, items[] }
PUT    /api/export-orders/:id  { items[] } → { order }
DELETE /api/export-orders/:id  → { success }
GET    /api/export-orders/:id  → { order, items[] }
```

### 8.7 Inventory APIs

```
GET    /api/inventory          ?branchId&date → [InventorySnapshot]
GET    /api/inventory/history  ?productId&branchId&dateFrom&dateTo
PUT    /api/inventory/adjust   { productId, branchId, newQuantity, reason }
GET    /api/inventory/alerts   ?branchId → [LowStockAlert]
```

### 8.8 Production APIs

```
GET    /api/production         ?branchId&employeeId&dateFrom&dateTo
POST   /api/production         { employeeId, sellingPointId, date, shift, quantity }
PUT    /api/production/:id     { quantity } → { record }
POST   /api/production/batch   [{ ... }] → [records]
GET    /api/production/summary ?branchId&dateFrom&dateTo
POST   /api/production/:id/approve → { record }
```

### 8.9 Salary APIs

```
GET    /api/salary             ?employeeId&branchId&periodStart&periodEnd
POST   /api/salary/calculate   { periodStart, periodEnd, branchId? } → { records[] }
POST   /api/salary/:id/approve-branch → { record }
POST   /api/salary/:id/approve-org   → { record }
POST   /api/salary/:id/mark-paid      → { record }
POST   /api/salary/:id/adjust   { type, amount, reason }
GET    /api/salary/payslip/:employeeId/:periodId → { payslip }
```

### 8.10 Cost APIs

```
GET    /api/costs              ?branchId&categoryId&dateFrom&dateTo
POST   /api/costs              { branchId, categoryId, date, quantity, unitPrice }
PUT    /api/costs/:id          { ...data } → { record }
DELETE /api/costs/:id         → { success }
GET    /api/cost-categories    → [CostCategory]
POST   /api/cost-categories    { name, type, unit, defaultUnitPrice }
```

### 8.11 Report APIs

```
GET    /api/reports/nxt        ?branchId&dateFrom&dateTo → { data }
GET    /api/reports/revenue    ?branchId&dateFrom&dateTo&groupBy → { data }
GET    /api/reports/production ?branchId&dateFrom&dateTo → { data }
GET    /api/reports/salary     ?branchId&period → { data }
GET    /api/reports/cost       ?branchId&dateFrom&dateTo → { data }
GET    /api/reports/profit     ?branchId&dateFrom&dateTo → { data }
GET    /api/reports/dashboard  → { overview }
```

---

## PHẦN IX: SECURITY & AUTHORIZATION

---

### 9.1 Authentication

- JWT tokens với expiry 8 giờ (access token) + refresh token 7 ngày
- Mật khẩu hashed với bcrypt (cost factor 12)
- Rate limiting: 5 lần login thất bại → khóa 15 phút
- Session tracking: lưu last login, IP

### 9.2 Authorization Matrix

```typescript
// Middleware kiểm tra quyền trên mỗi route
function checkPermission(action: string, resource: string) {
  // Ví dụ:
  // 'Nhân Viên' muốn xem báo cáo → 403 Forbidden
  // 'GD Chi Nhánh A' muốn xem dữ liệu 'Chi Nhánh B' → 403 Forbidden
  // 'Tổng GD' muốn xem dữ liệu 'Chi Nhánh B' → 200 OK
}
```

### 9.3 Data Isolation & Independent Accounting (Ràng buộc quan trọng)

```
┌─────────────────────────────────────────────────────┐
│ Tổng GD: XEM TẤT CẢ chi nhánh                      │
├─────────────────────────────────────────────────────┤
│ GD Chi Nhánh A:                                      │
│   ✗ Không thể xem dữ liệu Chi Nhánh B              │
│   ✓ TOÀN QUYỀN trong Chi Nhánh A:                  │
│     - Nhập/Xuất hàng                                │
│     - Cập nhật giá vốn, giá bán                    │
│     - Quản lý nhân viên (thêm/sửa/xóa)            │
│     - Quản lý chi phí                               │
│     - Duyệt lương nhân viên                        │
├─────────────────────────────────────────────────────┤
│ Trưởng Phòng Sản Xuất - CN A:                      │
│   ✗ Không thể xem dữ liệu Phòng Kinh Doanh        │
│   ✓ Chỉ xem dữ liệu Phòng Sản Xuất               │
│   ✓ Xem dữ liệu nhân viên thuộc phòng mình        │
├─────────────────────────────────────────────────────┤
│ Nhân Viên Phùng Hà My:                              │
│   ✗ Không thể xem dữ liệu nhân viên khác           │
│   ✗ Không thể xem báo cáo chi nhánh                │
│   ✓ Chỉ xem & nhập năng suất cá nhân              │
│   ✓ Xem phiếu lương cá nhân                        │
└─────────────────────────────────────────────────────┘
```

**Hạch toán độc lập giữa các chi nhánh:**
- Mỗi chi nhánh có báo cáo tài chính riêng (doanh thu, chi phí, lợi nhuận)
- Giá cả có thể khác nhau giữa các chi nhánh (GD Chi Nhánh tự quyết)
- Nhân viên chỉ thuộc 1 chi nhánh
- Tổng Giám Đốc có quyền xem tất cả dữ liệu mọi chi nhánh để tổng hợp báo cáo

### 9.4 Audit Log

Mọi thao tác quan trọng đều được ghi log:
- Ai? (userId)
- Làm gì? (action)
- Với cái gì? (resourceId)
- Khi nào? (timestamp)
- Từ đâu? (IP)

---

## PHẦN X: ROADMAP PHÁT TRIỂN

---

### Phase 1: Core MVP (4-6 tuần)
- [ ] Authentication & RBAC (đủ 4 cấp)
- [ ] Module Nhập Hàng
- [ ] Module Xuất Hàng  
- [ ] Module Tồn Kho
- [ ] Module Danh Mục Sản Phẩm & Bảng Giá
- [ ] Dashboard cơ bản

### Phase 2: Nhân sự & Lương (3-4 tuần)
- [ ] Quản lý nhân viên (thêm, sửa, phân phòng)
- [ ] Module Năng Suất Lao Động
- [ ] Module Lương & Thưởng (tính lương tự động)
- [ ] Module Chi Phí

### Phase 3: Báo Cáo (2-3 tuần)
- [ ] Báo cáo NXT chi tiết
- [ ] Báo cáo doanh thu (nhiều góc nhìn)
- [ ] Báo cáo lương
- [ ] Báo cáo chi phí
- [ ] Báo cáo năng suất
- [ ] Dashboard tổng (Tổng GD)

### Phase 4: Mở rộng (tùy nhu cầu)
- [ ] App di động cho nhân viên (chấm công, xem lương)
- [ ] SMS/Email notification
- [ ] Multi-tenant (nhiều công ty)
- [ ] Tích hợp thanh toán online
- [ ] Dự báo tồn kho (AI)

---

## PHẦN XI: CÁC QUY TẮC NGHIỆP VỤ

---

### 11.1 Quy tắc về tồn kho
- Tồn kho không được âm
- Mỗi phiếu nhập/xuất phải cập nhật tồn kho ngay
- Tồn kho được tính theo công thức: Tồn cuối = Tồn đầu + Nhập - Xuất - Tặng

### 11.2 Quy tắc về lương
- Lương tính theo tuần (T2-CN hoặc custom)
- Nếu năng suất thực tế < chuẩn → trừ: (chuẩn - thực tế) × 500
- Tạm ứng không được vượt quá 50% lương dự kiến
- Phải được duyệt 2 cấp: GD Chi Nhánh → Tổng GD

### 11.3 Quy tắc về giá
- Giá vốn và giá bán do Tổng GD hoặc GD Chi Nhánh cập nhật
- Lịch sử giá được lưu lại
- Giá không được sửa ngược cho các ngày đã qua

### 11.4 Quy tắc về chi phí
- Chi phí cố định: nhập số lượng mua, đơn giá
- Chi phí biến đổi: tính theo sản lượng (vận chuyển, điện, quà, túi)

### 11.5 Quy tắc về phân quyền
- Mỗi user chỉ thuộc 1 chi nhánh (trừ Tổng GD)
- Mỗi user chỉ thuộc 1 phòng ban
- Không có user nào vừa là GD Chi Nhánh vừa là Tổng GD

---

## PHẦN XII: THIẾT KẾ MOBILE-FIRST (TƯƠNG LAI)

---

### 12.1 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, bottom nav |
| Tablet | 768-1024px | Sidebar collapsible |
| Desktop | > 1024px | Full sidebar + content |

### 12.2 App di động (React Native / Flutter - Phase 4)
- Nhân viên: Chấm công, nhập năng suất, xem lương
- GD Chi Nhánh: Duyệt năng suất, xem doanh thu nhanh
- Tổng GD: Dashboard tổng quan

---

## PHỤ LỤC: ÁNH XẠ SHEET EXCEL → MODULE

```
Untitled spreadsheet.xlsx
├── Sheet: Nhập Hàng
│   ├── Data: [Ngày, Tên SP, Giá vốn, SL nhập, SL tặng, Thành tiền]
│   ├── Module: Nhập Hàng (ImportOrders)
│   └── Ghi chú: 2 bảng: "Vốn" (nhập) và "Bán" (xuất)
│
├── Sheet: Chi Phí
│   ├── Data: [Cố định, Tổng CP, Đơn giá, SL theo ngày]
│   ├── Module: Chi Phí (CostRecords)
│   └── Ghi chú: Chi phí cố định (đồng phục, quầy kệ, lò vi sóng...)
│
├── Sheet: Giá NhậpXuất
│   ├── Data: [STT, Mặt hàng, Giá vốn, Giá bán]
│   ├── Module: Danh Mục Sản Phẩm (Products)
│   └── Ghi chú: Chi phí/nắm (vận chuyển, quà, túi, điện, đồ chơi)
│
├── Sheet: Lương NV
│   ├── Data: [Tên NV, Ca, T2-T6, NS Sáng, NS Chiều, Tổng, Lương]
│   ├── Module: Năng Suất Lao Động (DailyProduction)
│   └── Ghi chú: Mỗi NV 2 dòng (Sáng/Chiều), mỗi tuần 1 bảng
│
├── Sheet: Nhập hàng New
│   ├── Data: Tương tự Nhập Hàng nhưng cho nhiều điểm bán cùng lúc
│   ├── Module: Nhập Hàng Nâng Cao (ImportOrders với sellingPointId)
│   └── Ghi chú: Mỗi cột = 1 điểm bán, mỗi hàng = 1 tuần
│
├── Sheet: Nhật ký bán hàng T4/T3
│   ├── Data: [Điểm bán, Tên NV, Ca, T2-T6, Tổng nắm]
│   ├── Module: Bán Hàng / Năng Suất (ExportOrders + DailyProduction)
│   └── Ghi chú: Mỗi hàng = 1 nhân viên, cột = ngày
│
└── Sheet: Lương&Thưởng
    ├── Data: [Tên NV, Lương, Thưởng, Phạt, Tạm ứng, Thực nhận]
    ├── Module: Lương & Thưởng (SalaryRecords)
    └── Ghi chú: Bảng tổng hợp lương cuối kỳ
```

---

## PHẦN XIII: DATABASE MIGRATIONS & SEEDING

---

### 13.1 Prisma Schema (Database Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  ADMIN          // Tổng Giám Đốc
  BRANCH_DIRECTOR // Giám Đốc Chi Nhánh
  DEPARTMENT_HEAD  // Trưởng Phòng
  EMPLOYEE         // Nhân Viên
}

enum Shift {
  SANG   // Ca Sáng
  CHIEU  // Ca Chiều
}

enum OrderStatus {
  DRAFT
  APPROVED
  CANCELLED
}

enum SalaryStatus {
  PENDING
  APPROVED_BY_BRANCH
  APPROVED_BY_ORG
  PAID
}

enum CostType {
  FIXED
  VARIABLE
}

enum AdjustmentType {
  BONUS
  DEDUCTION
  ALLOWANCE
  ADJUSTMENT
}

// Organization
model Organization {
  id        String    @id @default(uuid())
  name      String
  logo      String?
  address   String?
  phone     String?
  taxCode   String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  branches  Branch[]
}

// Branch (Chi nhánh)
model Branch {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  name           String
  code           String       @unique
  address        String?
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  departments    Department[]
  sellingPoints  SellingPoint[]
  users          User[]
  products       Product[]
  importOrders   ImportOrder[]
  exportOrders   ExportOrder[]
  inventory      Inventory[]
  production     DailyProduction[]
  salaryRecords  SalaryRecord[]
  costRecords    CostRecord[]
}

// Department (Phòng ban)
model Department {
  id        String   @id @default(uuid())
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id])
  name      String
  code      String
  managerId String?  @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  users     User[]
}

// SellingPoint (Điểm bán)
model SellingPoint {
  id        String   @id @default(uuid())
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id])
  name      String
  code      String
  address   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  production DailyProduction[]
  exportOrders ExportOrder[]
}

// User (Người dùng)
model User {
  id           String    @id @default(uuid())
  username     String    @unique
  password     String
  fullName     String
  email        String    @unique
  phone        String?
  role         UserRole
  branchId     String?
  branch       Branch?   @relation(fields: [branchId], references: [id])
  departmentId String?
  department   Department? @relation(fields: [departmentId], references: [id])
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  department   Department? @relation("DepartmentManager", fields: [id], references: [id])

  // Relations
  managedDepartments Department[] @relation("DepartmentManager")
  importOrders       ImportOrder[]
  exportOrders       ExportOrder[]
  approvedProduction DailyProduction[] @relation("ProductionApprover")
  salaryApprovedBranch SalaryRecord[] @relation("SalaryApproverBranch")
  salaryApprovedOrg    SalaryRecord[] @relation("SalaryApproverOrg")
  salaryAdjustments    SalaryAdjustment[]
  costRecords          CostRecord[]
  auditLogs            AuditLog[]
}

// Product (Sản phẩm)
model Product {
  id           String   @id @default(uuid())
  branchId     String?
  branch       Branch?  @relation(fields: [branchId], references: [id])
  name         String
  code         String   @unique
  costPrice    Decimal  @db.Decimal(12, 2)
  sellingPrice Decimal  @db.Decimal(12, 2)
  unit         String   @default("nắm")
  image        String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  importItems  ImportOrderItem[]
  exportItems  ExportOrderItem[]
  inventory    Inventory[]
}

// ImportOrder (Phiếu nhập hàng)
model ImportOrder {
  id           String       @id @default(uuid())
  branchId     String
  branch       Branch       @relation(fields: [branchId], references: [id])
  importDate   DateTime     @db.Date
  totalAmount  Decimal      @db.Decimal(15, 2) @default(0)
  note         String?
  createdById  String
  createdBy    User         @relation(fields: [createdById], references: [id])
  approvedById String?
  status       OrderStatus  @default(DRAFT)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  items        ImportOrderItem[]
}

// ImportOrderItem (Chi tiết phiếu nhập)
model ImportOrderItem {
  id             String      @id @default(uuid())
  importOrderId  String
  importOrder    ImportOrder @relation(fields: [importOrderId], references: [id], onDelete: Cascade)
  productId      String
  product        Product     @relation(fields: [productId], references: [id])
  quantity       Int
  giftedQuantity Int         @default(0)
  unitPrice      Decimal     @db.Decimal(12, 2)
  totalAmount    Decimal     @db.Decimal(15, 2)
}

// ExportOrder (Phiếu xuất hàng)
model ExportOrder {
  id            String       @id @default(uuid())
  branchId      String
  branch        Branch       @relation(fields: [branchId], references: [id])
  sellingPointId String
  sellingPoint  SellingPoint @relation(fields: [sellingPointId], references: [id])
  exportDate    DateTime     @db.Date
  totalRevenue  Decimal      @db.Decimal(15, 2) @default(0)
  note          String?
  createdById   String
  createdBy     User         @relation(fields: [createdById], references: [id])
  status        OrderStatus  @default(DRAFT)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  items         ExportOrderItem[]
}

// ExportOrderItem (Chi tiết phiếu xuất)
model ExportOrderItem {
  id             String       @id @default(uuid())
  exportOrderId  String
  exportOrder    ExportOrder  @relation(fields: [exportOrderId], references: [id], onDelete: Cascade)
  productId      String
  product        Product      @relation(fields: [productId], references: [id])
  quantity       Int
  giftedQuantity Int          @default(0)
  unitPrice      Decimal      @db.Decimal(12, 2)
  totalAmount    Decimal      @db.Decimal(15, 2)
}

// Inventory (Tồn kho)
model Inventory {
  id            String   @id @default(uuid())
  branchId      String
  branch        Branch   @relation(fields: [branchId], references: [id])
  productId     String
  product       Product  @relation(fields: [productId], references: [id])
  date          DateTime @db.Date
  openingStock  Int      @default(0)
  importQuantity Int     @default(0)
  exportQuantity Int     @default(0)
  giftedQuantity Int     @default(0)
  closingStock  Int
  updatedAt     DateTime @updatedAt
  @@unique([branchId, productId, date])
}

// DailyProduction (Năng suất lao động)
model DailyProduction {
  id             String       @id @default(uuid())
  employeeId     String
  employee       User         @relation(fields: [employeeId], references: [id])
  branchId       String
  branch         Branch       @relation(fields: [branchId], references: [id])
  sellingPointId String
  sellingPoint   SellingPoint @relation(fields: [sellingPointId], references: [id])
  productionDate DateTime     @db.Date
  shift          Shift
  quantity       Int
  salaryPerUnit  Decimal      @db.Decimal(10, 2)
  totalSalary   Decimal      @db.Decimal(15, 2)
  isApproved     Boolean      @default(false)
  approvedById   String?
  approvedBy     User?        @relation("ProductionApprover", fields: [approvedById], references: [id])
  note           String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

// SalaryRecord (Bảng lương)
model SalaryRecord {
  id                   String       @id @default(uuid())
  employeeId           String
  employee             User         @relation(fields: [employeeId], references: [id])
  branchId             String
  branch               Branch       @relation(fields: [branchId], references: [id])
  periodType           String       // WEEKLY, MONTHLY
  periodStart          DateTime     @db.Date
  periodEnd            DateTime     @db.Date
  totalProductionSalary Decimal      @db.Decimal(15, 2) @default(0)
  allowances           Decimal      @db.Decimal(15, 2) @default(0)
  bonuses              Decimal      @db.Decimal(15, 2) @default(0)
  deductions           Decimal      @db.Decimal(15, 2) @default(0)
  advanceAmount        Decimal      @db.Decimal(15, 2) @default(0)
  grossSalary          Decimal      @db.Decimal(15, 2)
  netSalary            Decimal      @db.Decimal(15, 2)
  status               SalaryStatus @default(PENDING)
  approvedByBranchId   String?
  approvedByBranch     User?        @relation("SalaryApproverBranch", fields: [approvedByBranchId], references: [id])
  approvedByOrgId      String?
  approvedByOrg        User?        @relation("SalaryApproverOrg", fields: [approvedByOrgId], references: [id])
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt
  adjustments          SalaryAdjustment[]
}

// SalaryAdjustment (Điều chỉnh lương)
model SalaryAdjustment {
  id            String          @id @default(uuid())
  salaryRecordId String
  salaryRecord  SalaryRecord    @relation(fields: [salaryRecordId], references: [id], onDelete: Cascade)
  type          AdjustmentType
  amount        Decimal         @db.Decimal(15, 2)
  reason        String?
  createdById   String
  createdBy     User            @relation(fields: [createdById], references: [id])
  createdAt     DateTime        @default(now())
}

// CostCategory (Danh mục chi phí)
model CostCategory {
  id                 String       @id @default(uuid())
  name               String
  type               CostType
  unit               String
  defaultUnitPrice   Decimal      @db.Decimal(12, 2) @default(0)
  isActive           Boolean      @default(true)
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
  costRecords        CostRecord[]
}

// CostRecord (Chi phí)
model CostRecord {
  id          String       @id @default(uuid())
  branchId    String
  branch      Branch       @relation(fields: [branchId], references: [id])
  categoryId  String
  category    CostCategory @relation(fields: [categoryId], references: [id])
  costDate    DateTime     @db.Date
  quantity    Int
  unitPrice   Decimal      @db.Decimal(12, 2)
  totalAmount Decimal      @db.Decimal(15, 2)
  note        String?
  createdById String
  createdBy   User         @relation(fields: [createdById], references: [id])
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

// AuditLog (Nhật ký kiểm toán)
model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  action     String
  resource   String
  resourceId String?
  oldValue   Json?
  newValue   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
}

// PriceHistory (Lịch sử giá)
model PriceHistory {
  id            String   @id @default(uuid())
  productId     String
  product       Product  @relation(fields: [productId], references: [id])
  costPrice     Decimal  @db.Decimal(12, 2)
  sellingPrice  Decimal  @db.Decimal(12, 2)
  changedById   String
  changedAt     DateTime @default(now())
}
```

### 13.2 Database Seeding (Initial Data)

```typescript
// prisma/seed.ts
// Script để tạo dữ liệu ban đầu

async function seed() {
  // 1. Tạo Organization mặc định
  const org = await prisma.organization.create({
    data: { name: "Cơm Nắm Việt Nam", code: "QLCN" }
  });

  // 2. Tạo Branch mặc định
  const branch = await prisma.branch.create({
    data: {
      organizationId: org.id,
      name: "Chi nhánh Hà Nội",
      code: "CN_HN_01"
    }
  });

  // 3. Tạo Departments
  const deptProduction = await prisma.department.create({
    data: { branchId: branch.id, name: "Phòng Sản Xuất", code: "SX" }
  });
  const deptSales = await prisma.department.create({
    data: { branchId: branch.id, name: "Phòng Kinh Doanh", code: "KD" }
  });

  // 4. Tạo SellingPoints
  const sellingPoints = [
    { name: "Xuân La (VTD)", code: "VTD" },
    { name: "Xuân Đỉnh (XL)", code: "XL" },
    { name: "Xuân Đỉnh Sau", code: "XD_SAU" },
    { name: "Cổ Nhuế A", code: "CN_A" },
    { name: "Cổ Nhuế B", code: "CN_B" },
    { name: "Đông Ngạc", code: "DA" },
    { name: "Đông Ngạc A", code: "DA_A" },
    { name: "Đông Ngạc B", code: "DA_B" },
    { name: "Thụy Phương", code: "TP" }
  ];
  await prisma.sellingPoint.createMany({
    data: sellingPoints.map(sp => ({ ...sp, branchId: branch.id }))
  });

  // 5. Tạo Products
  const products = [
    { name: "Thanh cua trứng Mayo", code: "TC_MAYO", costPrice: 13000, sellingPrice: 20000 },
    { name: "Pate phô mai kéo sợi", code: "PATE", costPrice: 13000, sellingPrice: 20000 },
    { name: "Heo cao bồi xúc xích", code: "HEO", costPrice: 13000, sellingPrice: 20000 },
    { name: "Gà tomyum", code: "GA_TOMYUM", costPrice: 13000, sellingPrice: 20000 },
    { name: "Gà teriyaki", code: "GA_TERI", costPrice: 13000, sellingPrice: 20000 },
    { name: "Bò BBQ", code: "BO_BBQ", costPrice: 13000, sellingPrice: 20000 },
    { name: "Tôm đút lò", code: "TOM", costPrice: 13000, sellingPrice: 20000 },
    { name: "Cá ngừ", code: "CA_NGU", costPrice: 16000, sellingPrice: 22000 },
    { name: "Chả cá xốt cay", code: "CHA_CA", costPrice: 13000, sellingPrice: 20000 },
    { name: "Trứng xúc xích mayo", code: "TRUNG", costPrice: 13000, sellingPrice: 20000 },
    { name: "Cá hồi mayo", code: "CA_HOI", costPrice: 16000, sellingPrice: 20000 },
    { name: "Xúc xích siêu phomai", code: "XX_PHAI", costPrice: 13000, sellingPrice: 20000 }
  ];
  await prisma.product.createMany({ data: products });

  // 6. Tạo CostCategories
  const costCategories = [
    { name: "Đồng phục", type: "FIXED", unit: "bộ", defaultUnitPrice: 200000 },
    { name: "Quầy kệ", type: "FIXED", unit: "cái", defaultUnitPrice: 1000000 },
    { name: "Lò vi sóng", type: "FIXED", unit: "cái", defaultUnitPrice: 1600000 },
    { name: "Thùng đá", type: "FIXED", unit: "cái", defaultUnitPrice: 300000 },
    { name: "Túi nilon", type: "VARIABLE", unit: "kg", defaultUnitPrice: 43000 },
    { name: "Đồ chơi", type: "VARIABLE", unit: "cái", defaultUnitPrice: 3450 },
    { name: "Vận chuyển", type: "VARIABLE", unit: "nắm", defaultUnitPrice: 83 },
    { name: "Quà", type: "VARIABLE", unit: "nắm", defaultUnitPrice: 1000 },
    { name: "Điện", type: "VARIABLE", unit: "nắm", defaultUnitPrice: 100 }
  ];
  await prisma.costCategory.createMany({ data: costCategories });

  // 7. Tạo Users mặc định
  // Admin (Tổng GD)
  await prisma.user.create({
    data: {
      username: "admin",
      password: await bcrypt.hash("admin123", 12),
      fullName: "Nguyễn Văn A",
      email: "admin@qlcn.vn",
      role: "ADMIN",
      branchId: null
    }
  });

  // Branch Director
  await prisma.user.create({
    data: {
      username: "gdcn",
      password: await bcrypt.hash("gdcn123", 12),
      fullName: "Trần Thị B",
      email: "gdcn@qlcn.vn",
      role: "BRANCH_DIRECTOR",
      branchId: branch.id
    }
  });

  console.log("Seed completed!");
}
```

---

## PHẦN XIV: ERROR HANDLING & LOGGING

---

### 14.1 Error Response Format

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',

  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  ACCESS_DENIED: 'ACCESS_DENIED',
  BRANCH_ACCESS_DENIED: 'BRANCH_ACCESS_DENIED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business Logic
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  SALARY_ALREADY_PAID: 'SALARY_ALREADY_PAID',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
} as const;

// API Response Format
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### 14.2 Global Error Handler

```typescript
// middleware/error.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Đã xảy ra lỗi hệ thống'
    }
  });
}
```

### 14.3 Logging Strategy

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});
```

---

## PHẦN XV: CI/CD & DOCKER DEPLOYMENT

---

### 15.1 Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 15.2 Docker Compose Full

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/qlcn
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - qlcn-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=qlcn
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - qlcn-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - qlcn-network

volumes:
  postgres_data:

networks:
  qlcn-network:
    driver: bridge
```

### 15.3 Nginx Config

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name qlcn.yourdomain.com;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /api {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 15.4 Deployment Checklist

```
Pre-deployment:
□ Clone repository to server
□ Copy .env.production file
□ Generate NEXTAUTH_SECRET (32+ chars)
□ Setup PostgreSQL credentials
□ Configure domain DNS

Deployment:
□ docker-compose build --no-cache
□ docker-compose up -d
□ docker-compose exec app npx prisma migrate deploy
□ docker-compose exec app npx prisma db seed

Post-deployment:
□ Check logs: docker-compose logs -f
□ Verify database connection
□ Test login with admin credentials
□ Check nginx logs
□ Setup SSL certificate (Let's Encrypt)
□ Configure backup cron job
□ Setup monitoring (if needed)
```

---

*Lưu ý: Document này sẽ được cập nhật trong quá trình phát triển. Phiên bản: 1.1*
*Ngày tạo: 2026-06-13*
*Ngày cập nhật: 2026-06-13 v1.1 - Bổ sung Docker, Prisma Schema, Error Handling*
*Ngày cập nhật: 2026-06-13 v1.2 - Hoàn thành Users Management, Lương xa/gần*

---

## CHANGELOG

### v1.2 (2026-06-13)
**Users Management Module**
- [x] API CRUD đầy đủ tại `/api/users`
- [x] UI quản lý tài khoản tại `/users`
- [x] BRANCH_DIRECTOR có quyền tạo/sửa/xóa DEPARTMENT_HEAD và EMPLOYEE trong chi nhánh
- [x] RBAC cập nhật: `users.delete` = [ADMIN, BRANCH_DIRECTOR]
- [x] Sidebar navigation cho Users

**Lương theo Điểm Bán**
- [x] GROUP_1 (Xa): 80,000đ/ca
- [x] GROUP_2 (Gần): 70,000đ/ca

### v1.1 (2026-06-13)
- Bổ sung Docker deployment
- Bổ sung Prisma Schema chi tiết
- Bổ sung Error Handling patterns
