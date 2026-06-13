import pandas as pd
import json
from datetime import datetime

def convert_value(v):
    if pd.isna(v):
        return None
    if isinstance(v, (datetime, pd.Timestamp)):
        return v.strftime('%Y-%m-%d')
    if isinstance(v, (int, float)):
        if v != v or str(v) == 'nan':
            return None
        return v
    return str(v)

def clean_sales_data(sheet):
    """Clean and transform sales diary data"""
    # Get meaningful columns
    cols = ['STT', 'Ngày', 'Ca Bán', 'Điểm bán', 'NV Bán', 'Loại hàng', 
            'Tồn đầu', 'Hàng Bán Mới', 'Tồn Cuối', 'Hàng Lỗi', 'Bán Thực', 'Doanh Thu']
    available = [c for c in cols if c in sheet.columns]
    return sheet[available].to_dict(orient='records')

def clean_import_data(sheet):
    """Clean and transform import data"""
    cols = ['Ngày Nhập', 'Loại hàng', 'Số lượng Nhập', 'Thành Tiền', 'Đơn giá', 'Tặng', 'Tổng Nhập', 'Đã Xuất', 'Tồn kho tổng', 'Trạng Thái']
    available = [c for c in cols if c in sheet.columns]
    return sheet[available].to_dict(orient='records')

def clean_salary_data(sheet):
    """Clean and transform salary data"""
    # Lương NV has many columns, get first few meaningful ones
    cols = ['Unnamed: 0', 'Unnamed: 1', 'Unnamed: 2', 'Unnamed: 3']
    available = [c for c in cols if c in sheet.columns]
    data = sheet[available].head(20).to_dict(orient='records')  # First 20 rows for sample
    # Rename columns
    for row in data:
        if 'Unnamed: 0' in row:
            row['Tên NV'] = row.pop('Unnamed: 0')
        if 'Unnamed: 1' in row:
            row['Ca Làm'] = row.pop('Unnamed: 1')
    return data

# Read Excel
df = pd.read_excel('Untitled spreadsheet.xlsx', sheet_name=None)

# Create test data
test_data = {}

# Sales data T3 (March)
if 'Nhật ký bán hàng T3' in df:
    test_data['sales_march'] = [dict((k, convert_value(v)) for k, v in row.items()) 
                                 for row in clean_sales_data(df['Nhật ký bán hàng T3'])]

# Sales data T4 (April)
if 'Nhật ký bán hàng T4' in df:
    test_data['sales_april'] = [dict((k, convert_value(v)) for k, v in row.items()) 
                                 for row in clean_sales_data(df['Nhật ký bán hàng T4'])]

# Import data
if 'Nhập hàng New' in df:
    test_data['imports'] = [dict((k, convert_value(v)) for k, v in row.items()) 
                            for row in clean_import_data(df['Nhập hàng New'])]

# Salary data (sample)
if 'Lương NV' in df:
    test_data['salary'] = [dict((k, convert_value(v)) for k, v in row.items()) 
                           for row in clean_salary_data(df['Lương NV'])]

# Expense data
if 'Chi Phí' in df:
    test_data['expenses'] = [dict((k, convert_value(v)) for k, v in row.items()) 
                             for row in df['Chi Phí'].to_dict(orient='records')]

# Save to file
with open('qlcn-app/src/data/testData.json', 'w', encoding='utf-8') as f:
    json.dump(test_data, f, ensure_ascii=False, indent=2)

print("Created testData.json with:")
for key in test_data:
    print(f"  - {key}: {len(test_data[key])} records")
