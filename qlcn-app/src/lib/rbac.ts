// User role types
export type UserRole = "ADMIN" | "BRANCH_DIRECTOR" | "DEPARTMENT_HEAD" | "EMPLOYEE"

// Permission definitions
const Permissions: Record<string, UserRole[]> = {
  // Users - BRANCH_DIRECTOR can now delete users in their branch
  "users.read": ["ADMIN", "BRANCH_DIRECTOR"],
  "users.write": ["ADMIN", "BRANCH_DIRECTOR"],
  "users.delete": ["ADMIN", "BRANCH_DIRECTOR"],

  // Products
  "products.read": ["ADMIN", "BRANCH_DIRECTOR", "DEPARTMENT_HEAD", "EMPLOYEE"],
  "products.write": ["ADMIN", "BRANCH_DIRECTOR"],
  "products.delete": ["ADMIN", "BRANCH_DIRECTOR"],

  // Import Orders
  "import.read": ["ADMIN", "BRANCH_DIRECTOR"],
  "import.write": ["ADMIN", "BRANCH_DIRECTOR"],
  "import.delete": ["ADMIN", "BRANCH_DIRECTOR"],

  // Export Orders
  "export.read": ["ADMIN", "BRANCH_DIRECTOR"],
  "export.write": ["ADMIN", "BRANCH_DIRECTOR"],
  "export.delete": ["ADMIN", "BRANCH_DIRECTOR"],

  // Inventory
  "inventory.read": ["ADMIN", "BRANCH_DIRECTOR", "DEPARTMENT_HEAD", "EMPLOYEE"],
  "inventory.write": ["ADMIN", "BRANCH_DIRECTOR"],

  // Production
  "production.read": ["ADMIN", "BRANCH_DIRECTOR", "DEPARTMENT_HEAD"],
  "production.read.self": ["EMPLOYEE"],
  "production.write": ["ADMIN", "BRANCH_DIRECTOR", "DEPARTMENT_HEAD", "EMPLOYEE"],
  "production.approve": ["ADMIN", "BRANCH_DIRECTOR", "DEPARTMENT_HEAD"],

  // Salary
  "salary.read": ["ADMIN", "BRANCH_DIRECTOR", "DEPARTMENT_HEAD"],
  "salary.read.self": ["EMPLOYEE"],
  "salary.write": ["ADMIN", "BRANCH_DIRECTOR"],
  "salary.approve": ["ADMIN", "BRANCH_DIRECTOR"],

  // Costs
  "costs.read": ["ADMIN", "BRANCH_DIRECTOR"],
  "costs.write": ["ADMIN", "BRANCH_DIRECTOR"],
  "costs.delete": ["ADMIN", "BRANCH_DIRECTOR"],

  // Reports
  "reports.read": ["ADMIN", "BRANCH_DIRECTOR", "DEPARTMENT_HEAD"],
  "reports.dashboard": ["ADMIN", "BRANCH_DIRECTOR", "DEPARTMENT_HEAD"],

  // Selling Points
  "sellingPoints.write": ["ADMIN", "BRANCH_DIRECTOR"],

  // Departments
  "departments.write": ["ADMIN", "BRANCH_DIRECTOR"],
}

// Check if user has permission
export function hasPermission(role: UserRole, permission: string): boolean {
  return Permissions[permission]?.includes(role) ?? false
}

// Check if user can access a specific branch
export function canAccessBranch(
  userRole: UserRole,
  userBranchId: string | null,
  targetBranchId: string
): boolean {
  // ADMIN can access all branches
  if (userRole === "ADMIN") return true

  // Others can only access their own branch
  return userBranchId === targetBranchId
}

// Check if user can access a specific department
export function canAccessDepartment(
  userRole: UserRole,
  userDepartmentId: string | null,
  targetDepartmentId: string
): boolean {
  // ADMIN and BRANCH_DIRECTOR can access all departments in their branch
  if (userRole === "ADMIN" || userRole === "BRANCH_DIRECTOR") return true

  // Others can only access their own department
  return userDepartmentId === targetDepartmentId
}

// Get role display name in Vietnamese
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "Tổng Giám Đốc"
    case "BRANCH_DIRECTOR":
      return "Giám Đốc Chi Nhánh"
    case "DEPARTMENT_HEAD":
      return "Trưởng Phòng"
    case "EMPLOYEE":
      return "Nhân Viên"
    default:
      return role
  }
}
