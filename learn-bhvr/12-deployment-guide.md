# 12 - Deployment Guide for React Applications

## 🎯 Learning Goals
- Understand modern deployment strategies for React applications
- Learn Docker containerization for full-stack apps
- Master environment configuration and production optimization
- Practice with your actual ItemJS deployment setup
- Compare deployment approaches: Docker vs traditional hosting

## 📂 Your ItemJS Deployment Files
Your project already includes comprehensive deployment configurations:
- **[docker-compose.yml](../docker-compose.yml)** - Multi-service orchestration
- **[Dockerfile.frontend](../Dockerfile.frontend)** - Frontend container definition
- **[Dockerfile.backend](../Dockerfile.backend)** - Backend container definition
- **[DOCKER_SETUP.md](../DOCKER_SETUP.md)** - Complete Docker deployment guide
- **[package.json](../package.json)** - Build scripts and dependencies
- **[.env.example](../.env.example)** - Environment variable template

## 🚀 Deployment vs Laravel: Key Differences

### Laravel Deployment (Familiar):
```bash
# Traditional deployment
git pull origin main
composer install --no-dev
php artisan migrate
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### React + Node.js Deployment (New):
```bash
# Modern containerized deployment
docker-compose up --build -d
# OR traditional build
npm run build
npm run start
```

## 🐳 Docker Deployment (Recommended)

Your ItemJS project uses Docker for consistent, scalable deployment across environments.

### 1. **Quick Start Deployment**

**From your [DOCKER_SETUP.md](../DOCKER_SETUP.md) (lines 18-26):**
```bash
# Start the complete application stack
docker-compose up --build

# Access your application:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Database Admin: http://localhost:5555
```

### 2. **Your Docker Architecture**

**From your [docker-compose.yml](../docker-compose.yml):**
```yaml
services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB:-itemjs_db}
      - POSTGRES_USER=${POSTGRES_USER:-itemjs_user}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-itemjs_password}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - ./storage/postgres/data:/var/lib/postgresql/data

  # Frontend (React + Vite)
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "${FRONTEND_PORT:-3000}:${FRONTEND_PORT:-3000}"
    environment:
      - VITE_API_URL=${BACKEND_URL:-http://localhost:3101}
    volumes:
      - ./src:/app/src  # Hot reload in development

  # Backend (Bun + Hono + Prisma)
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "${BACKEND_PORT:-3001}:${BACKEND_PORT:-3001}"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/itemjs_db
      - JWT_SECRET=${JWT_SECRET:-your-secret}
    depends_on:
      postgres:
        condition: service_healthy
```

### 3. **Environment Configuration**

**Laravel .env equivalent** - Your [.env.example](../.env.example):
```env
# Database Configuration
POSTGRES_DB=itemjs_db
POSTGRES_USER=itemjs_user
POSTGRES_PASSWORD=itemjs_password
POSTGRES_PORT=5432

# Application URLs
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development

# Optional Services
PRISMA_PORT=5555
```

## 🔧 Build Scripts and Commands

### Your Build Pipeline

**From your [package.json](../package.json) (lines 6-19):**
```json
{
  "scripts": {
    "dev": "concurrently \"bun run dev:server\" \"bun run dev:client\"",
    "dev:server": "bun --watch src/server/index.ts",
    "dev:client": "vite",
    "build": "tsc && vite build",
    "build:server": "tsc",
    "build:client": "vite build",
    "start": "bun dist/server/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio"
  }
}
```

### Laravel vs React Build Process

**Laravel Build:**
```bash
# Laravel asset compilation
npm run production  # Webpack/Vite
php artisan optimize  # Cache optimization
```

**React Build:**
```bash
# React application build
npm run build        # Creates dist/ folder
npm run build:server # Compiles TypeScript backend
npm run start        # Runs production server
```

## 🌍 Deployment Environments

### 1. **Development Environment**

**From your [DOCKER_SETUP.md](../DOCKER_SETUP.md) (lines 50-66):**
```bash
# Development with hot reload
docker-compose up --build

# View logs
docker-compose logs -f

# Database operations
docker-compose exec backend bun run db:generate
docker-compose exec backend bun run db:push
```

### 2. **Production Environment**

**Production Docker Compose** (from your [DOCKER_SETUP.md](../DOCKER_SETUP.md) lines 264-291):
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      target: production
    ports:
      - "80:80"
    
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
      target: production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/itemjs
    
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=itemjs
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
```

## 🔍 Database Management

### Laravel vs Prisma Database Operations

**Laravel Migrations:**
```bash
php artisan migrate
php artisan migrate:rollback
php artisan db:seed
```

**Prisma Database Operations** (from your [package.json](../package.json)):
```bash
# Generate Prisma client
docker-compose exec backend bun run db:generate

# Push schema changes
docker-compose exec backend bun run db:push

# Run migrations
docker-compose exec backend bun run db:migrate

# Database GUI
docker-compose --profile tools up prisma-studio
```

## 🚨 Troubleshooting Common Issues

### Your Deployment Troubleshooting Guide

**From your [DOCKER_SETUP.md](../DOCKER_SETUP.md) (lines 147-236):**

#### 1. **Port Conflicts**
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill the process or change ports in docker-compose.yml
```

#### 2. **Database Connection Issues**
```bash
# Reset database
docker-compose down
docker volume prune
docker-compose up --build
```

#### 3. **Build Failures**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

#### 4. **Prisma/OpenSSL Issues**
```bash
# Clean rebuild to ensure OpenSSL is installed
docker-compose down
docker-compose build --no-cache backend
docker-compose up
```

#### 5. **Frontend Build Issues**
```bash
# Fix Rollup native binary errors
docker-compose build --no-cache frontend
docker-compose up
```

## 🌐 Deployment Strategies

### 1. **Docker Deployment (Your Current Setup)**

**Advantages:**
- **Consistent environments** - Same container everywhere
- **Easy scaling** - Docker Swarm or Kubernetes
- **Dependency isolation** - No conflicts between projects
- **Version control** - Infrastructure as code

**Your Docker Commands:**
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Scaling services
docker-compose up --scale backend=3

# Updates
docker-compose pull
docker-compose up -d
```

### 2. **Traditional VPS Deployment**

**Laravel-style deployment:**
```bash
# Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and build
git clone your-repo
cd itemjs
npm install
npm run build
npm run start

# Process management
pm2 start npm --name "itemjs" -- start
pm2 startup
pm2 save
```

### 3. **Cloud Platform Deployment**

#### Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Railway/Render (Full Stack)
```yaml
# railway.yml or render.yml
services:
  - type: web
    name: itemjs-backend
    env: node
    buildCommand: npm run build:server
    startCommand: npm run start
    
  - type: web
    name: itemjs-frontend
    env: static
    buildCommand: npm run build:client
    staticPublishPath: ./dist
```

## 📊 Performance Optimization

### Build Optimization

**Your Vite Configuration** (referenced in [vite.config.ts](../vite.config.ts)):
```typescript
// Production optimizations
export default defineConfig({
  build: {
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@types/three']
        }
      }
    }
  }
})
```

### Laravel vs React Performance

**Laravel Optimization:**
```bash
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**React Optimization:**
```bash
# Build optimization
npm run build  # Minification, tree shaking, code splitting

# Runtime optimization
# - Code splitting with React.lazy()
# - Memoization with React.memo()
# - Bundle analysis with webpack-bundle-analyzer
```

## 🔐 Security Considerations

### Production Security Checklist

**Environment Variables:**
```env
# Change default secrets
JWT_SECRET=your-production-secret-key-here
POSTGRES_PASSWORD=strong-production-password

# Use production database
DATABASE_URL=postgresql://user:pass@prod-db:5432/itemjs

# Secure settings
NODE_ENV=production
```

**Docker Security:**
```yaml
# Use non-root user in Dockerfile
USER node

# Limit resources
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

## 🚀 Deployment Workflow

### Your Complete Deployment Process

1. **Development**
   ```bash
   # From DOCKER_SETUP.md
   docker-compose up --build
   ```

2. **Testing**
   ```bash
   # Run tests
   npm test
   docker-compose exec backend bun test
   ```

3. **Build**
   ```bash
   # Production build
   docker-compose -f docker-compose.prod.yml build
   ```

4. **Deploy**
   ```bash
   # Deploy to production
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Monitor**
   ```bash
   # Check logs
   docker-compose logs -f
   
   # Health checks
   curl http://localhost:3001/health
   ```

## 📈 Monitoring and Maintenance

### Application Monitoring

**Health Checks** (from your [docker-compose.yml](../docker-compose.yml)):
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U itemjs_user -d itemjs_db"]
  interval: 10s
  timeout: 5s
  retries: 5
```

**Logging:**
```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres
```

## 🎯 Key Takeaways

### Laravel vs React Deployment

| Aspect | Laravel | React (Your Setup) |
|--------|---------|-------------------|
| **Build Process** | `composer install` | `npm run build` |
| **Database** | Migrations | Prisma migrations |
| **Environment** | `.env` file | Docker environment |
| **Process Management** | PHP-FPM/Apache | Docker containers |
| **Scaling** | Load balancer | Container orchestration |
| **Monitoring** | Laravel logs | Docker logs |

### Your Deployment Advantages

1. **Containerized** - Consistent across environments
2. **Multi-service** - Database, backend, frontend in one setup
3. **Development-friendly** - Hot reload and debugging
4. **Production-ready** - Health checks and proper networking
5. **Well-documented** - Complete setup guide included

## 🏃‍♂️ Practice Exercises

### Exercise 1: Deploy Your ItemJS App
1. Follow your [DOCKER_SETUP.md](../DOCKER_SETUP.md) guide
2. Start the complete stack: `docker-compose up --build`
3. Verify all services are running
4. Test the application functionality

### Exercise 2: Environment Configuration
1. Copy [.env.example](../.env.example) to `.env`
2. Modify database credentials
3. Change JWT secret
4. Restart and verify changes

### Exercise 3: Production Deployment
1. Create `docker-compose.prod.yml` based on the example
2. Build production images
3. Deploy with production configuration
4. Test production environment

## 🚀 Next Steps

Now you understand deployment! Your ItemJS project is already configured for:
- **Docker containerization**
- **Multi-environment deployment**
- **Database management**
- **Production optimization**

**Recommended Learning Path:**
1. **Practice** with your existing Docker setup
2. **Experiment** with different deployment strategies
3. **Learn** container orchestration (Kubernetes, Docker Swarm)
4. **Explore** cloud platforms (AWS, GCP, Azure)

## 💡 Pro Tips for Laravel Developers

- **Think in containers** instead of server configurations
- **Environment variables** replace config files
- **Health checks** replace manual monitoring
- **Container logs** replace file-based logs
- **Image versioning** replaces code deployment
- **Service discovery** replaces hardcoded connections

Your ItemJS deployment setup is production-ready and follows modern DevOps practices!
