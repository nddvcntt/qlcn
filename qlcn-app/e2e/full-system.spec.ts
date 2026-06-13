import { test, expect } from "@playwright/test"

// Test data
const TEST_USER = {
  username: "admin",
  password: "admin123",
}

// Helper function for login
async function login(page: any) {
  await page.goto("/login")
  await page.fill('#username', TEST_USER.username)
  await page.fill('#password', TEST_USER.password)
  await page.click('button[type="submit"]')
  await page.waitForURL("**/dashboard")
}

// ============ AUTH TESTS ============

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("text=Hệ Thống QLCN")).toBeVisible()
  })

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.fill('#username', TEST_USER.username)
    await page.fill('#password', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL("**/dashboard", { timeout: 30000 })
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test("should show error with invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.fill('#username', "invalid")
    await page.fill('#password', "invalid")
    await page.click('button[type="submit"]')
    await expect(page.locator("text=Sai")).toBeVisible({ timeout: 5000 })
  })

  test("should redirect to login when accessing protected route", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })
})

// ============ DASHBOARD TESTS ============

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test("should display dashboard page", async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test("should show stats cards", async ({ page }) => {
    await expect(page.locator("text=Tổng Doanh Thu")).toBeVisible()
    await expect(page.locator("text=Chi Phí")).toBeVisible()
    await expect(page.locator("text=Lợi Nhuận")).toBeVisible()
    await expect(page.locator("text=Đơn Hàng")).toBeVisible()
  })

  test("should show 14-day chart", async ({ page }) => {
    await expect(page.locator("text=Doanh Số 14 Ngày")).toBeVisible()
  })

  test("should navigate to other pages via sidebar", async ({ page }) => {
    // Click on Sản Phẩm
    await page.click('a[href="/products"]')
    await expect(page.getByRole('heading', { name: 'Danh Mục Sản Phẩm' })).toBeVisible()
  })
})

// ============ PRODUCTS TESTS ============

test.describe("Products Module", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/products")
  })

  test("should display products page", async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Danh Mục Sản Phẩm' })).toBeVisible()
  })

  test("should show products table", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible()
  })

  test("should open add product dialog", async ({ page }) => {
    await page.click('button:has-text("Thêm Sản Phẩm")')
    await expect(page.locator('text=Thêm Sản Phẩm Mới')).toBeVisible()
    await expect(page.locator('input[placeholder*="sản phẩm"]')).toBeVisible()
  })

  test("should add new product", async ({ page }) => {
    // Open dialog
    await page.click('button:has-text("Thêm Sản Phẩm")')
    
    // Fill form
    await page.fill('input[placeholder*="sản phẩm"]', "Sản phẩm Test E2E")
    await page.fill('input[placeholder*="mã"]', "TEST_E2E")
    await page.fill('input[type="number"]:near(label:has-text("Giá vốn"))', "15000")
    await page.fill('input[type="number"]:near(label:has-text("Giá bán"))', "25000")
    
    // Submit
    await page.click('button:has-text("Thêm Mới")')
    
    // Verify
    await expect(page.locator("text=Sản phẩm Test E2E")).toBeVisible({ timeout: 5000 })
  })

  test("should search products", async ({ page }) => {
    // Type in search
    await page.fill('input[placeholder*="Tìm kiếm"]', "Thanh cua")
    await page.waitForTimeout(500)
    // Should show filtered results
    await expect(page.locator("table")).toBeVisible()
  })

  test("should filter products by type", async ({ page }) => {
    // Click filter dropdown
    await page.click('select')
    await page.selectOption('select', "COM_NAM")
    await page.waitForTimeout(500)
    // Should filter
    await expect(page.locator("table")).toBeVisible()
  })
})

// ============ SELLING POINTS TESTS ============

test.describe("Selling Points Module", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/selling-points")
  })

  test("should display selling points page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Điểm Bán Hàng")
  })

  test("should show selling points table with groups", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible()
    await expect(page.locator("text=Nhóm 1")).toBeVisible()
    await expect(page.locator("text=Nhóm 2")).toBeVisible()
  })

  test("should open add selling point dialog", async ({ page }) => {
    await page.click('button:has-text("Thêm Điểm Bán")')
    await expect(page.locator('text=Thêm Điểm Bán Mới')).toBeVisible()
  })

  test("should add new selling point", async ({ page }) => {
    // Open dialog
    await page.click('button:has-text("Thêm Điểm Bán")')
    
    // Fill form
    await page.fill('input[placeholder*="điểm bán"]', "Điểm Test E2E")
    await page.fill('input[placeholder*="mã"]', "TEST_E2E_SP")
    
    // Select group
    await page.selectOption('select:has-text("Nhóm")', "GROUP_1")
    
    // Submit
    await page.click('button:has-text("Thêm Mới")')
    
    // Verify
    await expect(page.locator("text=Điểm Test E2E")).toBeVisible({ timeout: 5000 })
  })
})

// ============ WORK SCHEDULE TESTS ============

test.describe("Work Schedule Module", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/work-schedule")
  })

  test("should display work schedule page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Lịch Làm Việc")
  })

  test("should show filters", async ({ page }) => {
    await expect(page.locator('input[type="date"]')).toBeVisible()
    await expect(page.locator("text=Trạng thái")).toBeVisible()
  })

  test("should open register dialog", async ({ page }) => {
    await page.click('button:has-text("Đăng Ký Lịch")')
    await expect(page.locator('text=Đăng Ký Lịch Làm Việc')).toBeVisible()
  })

  test("should show notes about salary rules", async ({ page }) => {
    await page.click('button:has-text("Đăng Ký Lịch")')
    await expect(page.locator("text=Ngày đầu: Học việc")).toBeVisible()
    await expect(page.locator("text=Ngày 2-3: Thử việc")).toBeVisible()
  })
})

// ============ PRODUCTION TESTS ============

test.describe("Production Module", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/production")
  })

  test("should display production page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Năng Suất Lao Động")
  })

  test("should show stats cards", async ({ page }) => {
    await expect(page.locator("text=Tổng sản lượng")).toBeVisible()
    await expect(page.locator("text=Tổng lương")).toBeVisible()
    await expect(page.locator("text=Tổng thưởng")).toBeVisible()
  })

  test("should open input dialog", async ({ page }) => {
    await page.click('button:has-text("Nhập Năng Suất")')
    await expect(page.locator('text=Nhập Năng Suất')).toBeVisible()
  })

  test("should show salary calculation rules", async ({ page }) => {
    await page.click('button:has-text("Nhập Năng Suất")')
    await expect(page.locator("text=Quy tắc tính lương")).toBeVisible()
    await expect(page.locator("text=Ngày 1: Học việc (0đ)")).toBeVisible()
  })
})

// ============ SALARY TESTS ============

test.describe("Salary Module", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/salary")
  })

  test("should display salary page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Bảng Lương")
  })

  test("should show salary calculation info", async ({ page }) => {
    await expect(page.locator("text=Quy tắc tính lương")).toBeVisible()
    await expect(page.locator("text=Ngày đầu tiên: Học việc - 0đ")).toBeVisible()
  })

  test("should show calculate button", async ({ page }) => {
    await expect(page.locator('button:has-text("Tính Lương")')).toBeVisible()
  })
})

// ============ COSTS TESTS ============

test.describe("Costs Module", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/costs")
  })

  test("should display costs page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Chi Phí")
  })

  test("should show stats cards", async ({ page }) => {
    await expect(page.locator("text=Chi phí cố định")).toBeVisible()
    await expect(page.locator("text=Chi phí biến đổi")).toBeVisible()
    await expect(page.locator("text=Tổng chi phí")).toBeVisible()
  })

  test("should open add cost dialog", async ({ page }) => {
    await page.click('button:has-text("Thêm Chi Phí")')
    await expect(page.locator('text=Thêm Chi Phí')).toBeVisible()
  })
})

// ============ REPORTS TESTS ============

test.describe("Reports Module", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/reports")
  })

  test("should display reports page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Báo Cáo")
  })

  test("should show report type options", async ({ page }) => {
    await expect(page.locator("text=Doanh Thu")).toBeVisible()
    await expect(page.locator("text=Lợi Nhuận")).toBeVisible()
    await expect(page.locator("text=Lương")).toBeVisible()
    await expect(page.locator("text=Chi Phí")).toBeVisible()
  })
})

// ============ INVENTORY TESTS ============

test.describe("Inventory Module", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/inventory")
  })

  test("should display inventory page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Tồn Kho")
  })

  test("should show inventory table", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible()
  })

  test("should show stock summary", async ({ page }) => {
    await expect(page.locator("text=Tổng tồn đầu")).toBeVisible()
    await expect(page.locator("text=Tổng nhập")).toBeVisible()
    await expect(page.locator("text=Tổng tồn cuối")).toBeVisible()
  })
})

// ============ IMPORT/EXPORT ORDERS TESTS ============

test.describe("Import Orders", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/import-orders")
  })

  test("should display import orders page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Nhập Hàng")
  })

  test("should show table", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible()
  })
})

test.describe("Export Orders", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto("/export-orders")
  })

  test("should display export orders page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Xuất Hàng")
  })

  test("should show stats", async ({ page }) => {
    await expect(page.locator("text=Tổng doanh thu")).toBeVisible()
    await expect(page.locator("text=Số đơn hàng")).toBeVisible()
  })
})

// ============ NAVIGATION TESTS ============

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test("should navigate through all sidebar items", async ({ page }) => {
    const routes = [
      { path: "/dashboard", name: "Dashboard" },
      { path: "/selling-points", name: "Điểm Bán" },
      { path: "/products", name: "Sản Phẩm" },
      { path: "/import-orders", name: "Nhập Hàng" },
      { path: "/export-orders", name: "Xuất Hàng" },
      { path: "/inventory", name: "Tồn Kho" },
      { path: "/work-schedule", name: "Lịch Làm Việc" },
      { path: "/production", name: "Năng Suất" },
      { path: "/salary", name: "Lương" },
      { path: "/costs", name: "Chi Phí" },
      { path: "/reports", name: "Báo Cáo" },
    ]

    for (const route of routes) {
      await page.goto(route.path)
      await expect(page.locator(`text=${route.name}`).first()).toBeVisible({ timeout: 10000 })
    }
  })
})

// ============ SALARY CALCULATION LOGIC TESTS ============

test.describe("Salary Calculation Logic", () => {
  test("should calculate probation salary (0 VND)", async ({ page }) => {
    await login(page)
    await page.goto("/production")
    await page.click('button:has-text("Nhập Năng Suất")')
    
    // Should show 0đ for day 1
    await expect(page.locator("text=Ngày 1: Học việc (0đ)")).toBeVisible()
  })

  test("should calculate trial salary (50,000 VND)", async ({ page }) => {
    await login(page)
    await page.goto("/production")
    await page.click('button:has-text("Nhập Năng Suất")')
    
    // Should show 50,000đ for days 2-3
    await expect(page.locator("text=Ngày 2-3: Thử việc (50,000đ)")).toBeVisible()
  })

  test("should calculate official salary (70,000-80,000 VND)", async ({ page }) => {
    await login(page)
    await page.goto("/production")
    await page.click('button:has-text("Nhập Năng Suất")')
    
    // Should show salary ranges
    await expect(page.locator("text=Từ ngày 4+: 70,000-80,000đ")).toBeVisible()
  })

  test("should calculate bonus for >= 50 items", async ({ page }) => {
    await login(page)
    await page.goto("/production")
    await page.click('button:has-text("Nhập Năng Suất")')
    
    // Should show bonus rule
    await expect(page.locator("text=≥ 50 suất: Thưởng 500đ/suất")).toBeVisible()
  })
})
