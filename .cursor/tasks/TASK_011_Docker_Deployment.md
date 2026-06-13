# Task: TASK_011_Docker_Deployment
## Mô tả
Cấu hình Docker, CI/CD và deploy lên server.

## Priority: HIGH
## Estimated Time: 3-4 hours
## Agent: AGENT_001_DevOps
## Dependencies: TASK_001, TASK_002

## Subtasks

### 11.1 Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run prisma-generate

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 11.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/qlcn
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - qlcn-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=qlcn
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - qlcn-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - qlcn-network

volumes:
  postgres_data:

networks:
  qlcn-network:
    driver: bridge
```

### 11.3 Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name qlcn.yourdomain.com;

        # Redirect to HTTPS (uncomment when SSL is configured)
        # return 301 https://$server_name$request_uri;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /api {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files caching
        location /_next/static {
            proxy_pass http://app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # HTTPS Server (uncomment when SSL is configured)
    # server {
    #     listen 443 ssl http2;
    #     server_name qlcn.yourdomain.com;
    #
    #     ssl_certificate /etc/nginx/ssl/fullchain.pem;
    #     ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    #
    #     location / {
    #         proxy_pass http://app;
    #         proxy_http_version 1.1;
    #         proxy_set_header Upgrade $http_upgrade;
    #         proxy_set_header Connection 'upgrade';
    #         proxy_set_header Host $host;
    #         proxy_set_header X-Real-IP $remote_addr;
    #         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #         proxy_set_header X-Forwarded-Proto $scheme;
    #         proxy_cache_bypass $http_upgrade;
    #     }
    # }
}
```

### 11.4 Environment Template

```env
# .env.production
# Copy this file and update values

# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://qlcn.yourdomain.com

# Database
POSTGRES_PASSWORD=your-secure-password-here
DATABASE_URL=postgresql://postgres:your-secure-password-here@db:5432/qlcn?schema=public

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
NEXTAUTH_URL=https://qlcn.yourdomain.com

# Security
BCRYPT_ROUNDS=12
```

### 11.5 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Build application
        run: npm run build
      
      - name: Build Docker image
        run: docker build -t qlcn-app:${{ github.sha }} .

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/qlcn
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T app npx prisma migrate deploy
            docker-compose exec -T app npx prisma db seed
            docker system prune -f
```

### 11.6 Deployment Script

```bash
#!/bin/bash
# deploy.sh - Deployment script

set -e

echo "=== QLCN Deployment Script ==="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root"
  exit 1
fi

# Navigate to app directory
cd /opt/qlcn

# Pull latest changes
git pull origin main

# Copy environment file if not exists
if [ ! -f .env ]; then
  echo "Warning: .env file not found. Please create it first."
  exit 1
fi

# Build and start containers
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec -T app npx prisma migrate deploy

# Run seed if needed
# docker-compose exec -T app npx prisma db seed

# Cleanup
docker system prune -f

# Show status
docker-compose ps

echo "=== Deployment Complete ==="
echo "App should be running at: http://localhost:3000"
```

## Deliverables
- [ ] Dockerfile
- [ ] docker-compose.yml
- [ ] nginx/nginx.conf
- [ ] .env.example
- [ ] GitHub Actions workflow
- [ ] Deployment script
- [ ] Deployment documentation

## Verification
- [ ] Docker build succeeds
- [ ] Containers start correctly
- [ ] Database migrations run
- [ ] App is accessible
- [ ] Nginx reverse proxy works

## Server Requirements
- Ubuntu 20.04+ or similar
- Docker 20.10+
- Docker Compose 2.0+
- Nginx (optional, for reverse proxy)
- Git
- 2GB+ RAM
- 20GB+ disk space

## Notes
- Setup SSL certificate with Let's Encrypt
- Configure firewall rules
- Setup automated backups
- Monitor logs with `docker-compose logs -f`
