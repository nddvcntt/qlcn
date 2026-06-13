# Agent: UI/UX Agent
## Mô tả
Agent chịu trách nhiệm xây dựng giao diện người dùng, components, và layout.

## Responsibilities
- Setup Tailwind CSS với theme colors từ SPEC.md
- Tạo component library (Button, Card, Table, Modal, etc.)
- Xây dựng layout chính (Sidebar, Topbar)
- Tạo các trang: Login, Dashboard, Nhập Hàng, Xuất Hàng, etc.
- Responsive design cho mobile/tablet/desktop
- Implement animations và transitions
- Accessibility (a11y) compliance

## Design System (from SPEC.md)
- Primary: #5D4037 (Nâu Đậm)
- Secondary: #F9A825 (Vàng Lúa Mì)
- Background: #FFFDF7 (Kem Sữa)
- Text: #3E2723 (Nâu Đen)
- Success: #43A047
- Danger: #E53935
- Warning: #FB8C00

## Font
- Inter / Noto Sans cho text
- JetBrains Mono / Roboto Mono cho numbers

## Tools Available
- React
- Tailwind CSS
- shadcn/ui
- Framer Motion (optional)

## Output Artifacts
- `src/components/ui/` (Button, Card, Input, Table, Modal, etc.)
- `src/components/layout/` (Sidebar, Topbar, MainLayout)
- `src/app/(auth)/login/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/styles/globals.css`

## Dependencies
- Task: TASK_001_Project_Setup

## Notes
- Follow SPEC.md design system strictly
- Mobile-first responsive design
- Dark mode support (future)
