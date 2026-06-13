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
    return v

def convert_row(row):
    return {str(k): convert_value(v) for k, v in row.items()}

df = pd.read_excel('Untitled spreadsheet.xlsx', sheet_name=None)
data = {}
for name, sheet in df.items():
    data[name] = [convert_row(row) for row in sheet.to_dict(orient='records')]

with open('excel_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Sheets:', list(data.keys()))
for name, rows in data.items():
    print(f'{name}: {len(rows)} rows')
