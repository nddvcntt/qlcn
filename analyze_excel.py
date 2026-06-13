import pandas as pd
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

df = pd.read_excel('Untitled spreadsheet.xlsx', sheet_name=None)

# Show structure of each sheet
result = {}
for name, sheet in df.items():
    result[name] = {
        'columns': [str(c) for c in sheet.columns],
        'rows': len(sheet)
    }

with open('sheet_structure.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("Done")
