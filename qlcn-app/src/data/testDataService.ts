import testData from './testData.json'

export interface SalesRecord {
  STT: number
  Ngày: string
  Ca Bán: string
  'Điểm bán': string
  'NV Bán': string
  'Loại hàng': string
  'Tồn đầu': number | null
  'Hàng Bán Mới': number | null
  'Tồn Cuối': number | null
  'Hàng Lỗi': number | null
  'Bán Thực': number
  'Doanh Thu': number
}

export interface ImportRecord {
  'Ngày Nhập': string
  'Loại hàng': string
  'Số lượng Nhập': number | null
  'Thành Tiền': number | null
  'Đơn giá': number | null
  'Tặng': number | null
  'Tổng Nhập': number | null
  'Đã Xuất': number | null
  'Tồn kho tổng': number | null
  'Trạng Thái': string | null
}

export interface TestData {
  sales_march: SalesRecord[]
  sales_april: SalesRecord[]
  imports: ImportRecord[]
  salary: Record<string, unknown>[]
  expenses: Record<string, unknown>[]
}

export const data: TestData = testData as TestData

// Helper functions
export function getAllSales(): SalesRecord[] {
  return [...data.sales_march, ...data.sales_april]
}

export function getSalesByMonth(month: 'march' | 'april'): SalesRecord[] {
  return month === 'march' ? data.sales_march : data.sales_april
}

export function getSalesByDateRange(startDate: string, endDate: string): SalesRecord[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return getAllSales().filter(sale => {
    const date = new Date(sale.Ngày)
    return date >= start && date <= end
  })
}

export function getTotalRevenue(records: SalesRecord[]): number {
  return records.reduce((sum, r) => sum + (r['Doanh Thu'] || 0), 0)
}

export function getTotalSales(records: SalesRecord[]): number {
  return records.reduce((sum, r) => sum + (r['Bán Thực'] || 0), 0)
}

export function getAllImports(): ImportRecord[] {
  return data.imports
}

export function getImportsByDateRange(startDate: string, endDate: string): ImportRecord[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return data.imports.filter(imp => {
    const date = new Date(imp['Ngày Nhập'])
    return date >= start && date <= end
  })
}

export function getTotalImportCost(records: ImportRecord[]): number {
  return records.reduce((sum, r) => sum + (r['Thành Tiền'] || 0), 0)
}

export { data as testData }
