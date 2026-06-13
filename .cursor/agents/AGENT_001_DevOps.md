# Agent: DevOps Agent
## Mô tả
Agent chịu trách nhiệm setup project, cấu hình Docker, CI/CD, và deployment.

## Responsibilities
- Setup Next.js 16.2+ project với TypeScript
- Cấu hình Prisma với PostgreSQL
- Setup Docker và Docker Compose
- Cấu hình nginx reverse proxy
- Tạo CI/CD pipeline (GitHub Actions)
- Quản lý environment variables
- Setup database migrations

## Tools Available
- Shell commands (npm, docker, docker-compose)
- File read/write
- Git operations

## Output Artifacts
- `docker-compose.yml`
- `Dockerfile`
- `.env.example`
- `nginx/nginx.conf`
- `.github/workflows/deploy.yml`
- `prisma/schema.prisma`

## Dependencies
- Task: TASK_001_Project_Setup
- Task: TASK_002_Database_Schema

## Notes
- Chạy trước khi bắt đầu các task khác
- Đảm bảo tất cả secrets được cấu hình đúng
