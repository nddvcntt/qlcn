import * as XLSX from "xlsx"

export interface ExportColumn<T> {
  header: string
  accessor: keyof T | ((row: T) => string | number)
  format?: (value: any) => string | number
  width?: number
}

export interface ExportOptions {
  filename: string
  sheetName?: string
  showHeader?: boolean
  showFooter?: boolean
}

export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions
): void {
  const { filename, sheetName = "Sheet1", showHeader = true } = options

  // Transform data
  const transformedData = data.map((row) => {
    const newRow: Record<string, string | number | any> = {}
    columns.forEach((col) => {
      const value = typeof col.accessor === "function"
        ? col.accessor(row)
        : row[col.accessor as keyof T]
      newRow[col.header] = col.format ? col.format(value) : String(value ?? "")
    })
    return newRow
  })

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(transformedData)

  // Set column widths
  if (columns.some((c) => c.width)) {
    worksheet["!cols"] = columns.map((col) => ({
      wch: col.width || 20
    }))
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Download
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// Pre-built export functions for common reports

export function exportProductsToExcel(products: any[], filename = "SanPham") {
  exportToExcel(products, [
    { header: "Mã SP", accessor: "code", width: 15 },
    { header: "Tên sản phẩm", accessor: "name", width: 30 },
    { header: "Giá vốn", accessor: "costPrice", format: (v) => formatCurrency(v), width: 15 },
    { header: "Giá bán", accessor: "sellingPrice", format: (v) => formatCurrency(v), width: 15 },
    { header: "Đơn vị", accessor: "unit", width: 10 },
    { header: "Loại", accessor: "type", format: (v) => getProductTypeLabel(v), width: 15 },
  ], { filename, sheetName: "Sản phẩm" })
}

export function exportProductionToExcel(productions: any[], filename = "NangSuat") {
  exportToExcel(productions, [
    { header: "Ngày", accessor: (r) => formatDate(r.workDate), width: 15 },
    { header: "Ca", accessor: "shift", format: (v) => getShiftLabel(v), width: 10 },
    { header: "Nhân viên", accessor: (r) => r.employee?.fullName || "-", width: 25 },
    { header: "Điểm bán", accessor: (r) => r.sellingPoint?.name || "-", width: 20 },
    { header: "Số lượng", accessor: "quantity", format: (v) => v.toLocaleString("vi-VN"), width: 12 },
    { header: "Lương CB", accessor: "baseSalary", format: (v) => formatCurrency(v), width: 15 },
    { header: "Thưởng", accessor: "bonusAmount", format: (v) => formatCurrency(v), width: 15 },
    { header: "Tổng", accessor: "totalSalary", format: (v) => formatCurrency(v), width: 15 },
  ], { filename, sheetName: "Năng suất" })
}

export function exportSalaryToExcel(records: any[], filename = "BangLuong") {
  exportToExcel(records, [
    { header: "Nhân viên", accessor: (r) => r.employee?.fullName || "-", width: 25 },
    { header: "Kỳ", accessor: (r) => `${formatDate(r.periodStart)} - ${formatDate(r.periodEnd)}`, width: 30 },
    { header: "Ngày LV", accessor: "totalWorkDays", width: 10 },
    { header: "Ca LV", accessor: "totalShifts", width: 10 },
    { header: "Sản lượng", accessor: "totalQuantity", format: (v) => v.toLocaleString("vi-VN"), width: 12 },
    { header: "Lương CB", accessor: "baseSalary", format: (v) => formatCurrency(v), width: 15 },
    { header: "Thưởng", accessor: "bonusAmount", format: (v) => formatCurrency(v), width: 15 },
    { header: "Hoa hồng", accessor: "commissionAmount", format: (v) => formatCurrency(v), width: 15 },
    { header: "Phụ cấp", accessor: "allowances", format: (v) => formatCurrency(v), width: 15 },
    { header: "Khấu trừ", accessor: "deductions", format: (v) => formatCurrency(v), width: 15 },
    { header: "Lương ròng", accessor: "netSalary", format: (v) => formatCurrency(v), width: 18 },
    { header: "Trạng thái", accessor: "status", format: (v) => getSalaryStatusLabel(v), width: 15 },
  ], { filename, sheetName: "Bảng lương" })
}

export function exportCostsToExcel(costs: any[], filename = "ChiPhi") {
  exportToExcel(costs, [
    { header: "Ngày", accessor: (r) => formatDate(r.costDate), width: 15 },
    { header: "Danh mục", accessor: (r) => r.category?.name || "-", width: 20 },
    { header: "Số lượng", accessor: "quantity", width: 12 },
    { header: "Đơn giá", accessor: "unitPrice", format: (v) => formatCurrency(v), width: 15 },
    { header: "Tổng tiền", accessor: "totalAmount", format: (v) => formatCurrency(v), width: 18 },
    { header: "Ghi chú", accessor: "note", width: 30 },
  ], { filename, sheetName: "Chi phí" })
}

export function exportInventoryToExcel(inventory: any[], filename = "TonKho") {
  exportToExcel(inventory, [
    { header: "Ngày", accessor: (r) => formatDate(r.date), width: 15 },
    { header: "Sản phẩm", accessor: (r) => r.product?.name || "-", width: 30 },
    { header: "Tồn đầu", accessor: "openingStock", width: 12 },
    { header: "Nhập", accessor: "importQuantity", width: 12 },
    { header: "Xuất", accessor: "exportQuantity", width: 12 },
    { header: "Tặng", accessor: "giftedQuantity", width: 12 },
    { header: "Tồn cuối", accessor: "closingStock", width: 12 },
  ], { filename, sheetName: "Tồn kho" })
}

// Helper functions
function formatCurrency(value: number): string {
  if (value == null) return "-"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string | Date): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function getProductTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    COM_NAM: "Cơm nắm",
    WATER: "Nước",
    OTHER: "Khác",
  }
  return labels[type] || type
}

function getShiftLabel(shift: string): string {
  const labels: Record<string, string> = {
    SANG: "Sáng",
    CHIEU: "Chiều",
    FULL: "Nguyên ngày",
  }
  return labels[shift] || shift
}

function getSalaryStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Chờ duyệt",
    APPROVED_BY_BRANCH: "Đã duyệt (CN)",
    APPROVED_BY_ORG: "Đã duyệt (Tổng)",
    PAID: "Đã thanh toán",
  }
  return labels[status] || status
}
