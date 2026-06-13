# Task: TASK_001_Project_Setup
## Mô tả
Setup Next.js 16.2+ project với TypeScript, Tailwind CSS, và cấu hình ban đầu.

## Priority: CRITICAL (Foundation)
## Estimated Time: 2-3 hours
## Agent: AGENT_001_DevOps

## Subtasks

### 1.1 Initialize Next.js Project
```bash
# Tạo Next.js project với TypeScript
npx create-next-app@latest qlcn-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm

# Di chuyển vào thư mục project
cd qlcn-app
```

### 1.2 Install Dependencies
```bash
# Core dependencies
npm install prisma @prisma/client
npm install next-auth@beta @auth/prisma-adapter
npm install bcryptjs
npm install zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query
npm install zustand
npm install recharts chart.js react-chartjs-2
npm install date-fns
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-table
npm install @radix-ui/react-toast
npm install @radix-ui/react-slot

# Dev dependencies
npm install -D prisma
npm install -D @types/bcryptjs
```

### 1.3 Configure Tailwind CSS
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5D4037",
          light: "#8D6E63",
          dark: "#3E2723",
        },
        secondary: {
          DEFAULT: "#F9A825",
          light: "#FFF8E1",
        },
        background: "#FFFDF7",
        surface: "#FFFFFF",
        success: "#43A047",
        danger: "#E53935",
        warning: "#FB8C00",
        border: "#D7CCC8",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans", "sans-serif"],
        mono: ["JetBrains Mono", "Roboto Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
```

### 1.4 Setup Global CSS
```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-primary-dark font-sans;
  }
}
```

### 1.5 Create Directory Structure
```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── nhap-hang/
│   │   ├── xuat-hang/
│   │   ├── ton-kho/
│   │   ├── nang-suat/
│   │   ├── luong/
│   │   ├── chi-phi/
│   │   ├── bao-cao/
│   │   └── cai-dat/
│   ├── api/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── branches/
│   │   ├── products/
│   │   ├── import-orders/
│   │   ├── export-orders/
│   │   ├── inventory/
│   │   ├── production/
│   │   ├── salary/
│   │   ├── costs/
│   │   └── reports/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   └── forms/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── rbac.ts
│   ├── errors.ts
│   └── utils.ts
├── types/
├── hooks/
└── stores/
```

## Deliverables
- [ ] Next.js project với TypeScript
- [ ] Tailwind CSS configured với theme từ SPEC.md
- [ ] Directory structure hoàn chỉnh
- [ ] Core dependencies installed
- [ ] Global CSS setup

## Verification
- [ ] `npm run dev` chạy thành công
- [ ] Homepage hiển thị đúng layout
- [ ] Tailwind classes hoạt động

## Notes
- Sử dụng Next.js 16.2+ với App Router
- TypeScript strict mode enabled
- ESLint configured
