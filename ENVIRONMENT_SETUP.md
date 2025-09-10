# Environment Setup Guide

This guide explains how to configure and deploy the ItemJS application with PostgreSQL and configurable domains/ports.

## Overview

The application now supports:
- PostgreSQL database instead of SQLite
- Configurable domains and ports for all services
- File uploads stored in `/storage/uploads` with public access via `/uploads`
- Environment-specific configurations
- Docker containerization with PostgreSQL

## Environment Files

### Available Environment Files

1. **`.env.example`** - Template with all available variables
2. **`.env.development`** - Development environment (localhost)
3. **`.env.staging`** - Staging environment template
4. **`.env.production`** - Production environment template

### Environment Variables

#### Database Configuration
```bash
DATABASE_URL=postgresql://itemjs_user:itemjs_password@postgres:5432/itemjs_db
```

#### Service Configuration
```bash
# Frontend
FRONTEND_DOMAIN=localhost
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000

# Backend
BACKEND_DOMAIN=localhost
BACKEND_PORT=3001
BACKEND_URL=http://localhost:3001

# Prisma Studio
PRISMA_DOMAIN=localhost
PRISMA_PORT=5555
PRISMA_URL=http://localhost:5555

# PostgreSQL
POSTGRES_DOMAIN=localhost
POSTGRES_PORT=5432
POSTGRES_DB=itemjs_db
POSTGRES_USER=itemjs_user
POSTGRES_PASSWORD=itemjs_password
```

#### Security
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

## Quick Start

### 1. Environment Setup
```bash
# Copy the development environment file
cp .env.development .env

# Or create your own .env file based on .env.example
cp .env.example .env
```

### 2. Setup Local Domains (Optional)
If you're using custom domains in your environment file (like `itemjs.front.end`), you need to add them to your local hosts file:

#### Windows (PowerShell - Run as Administrator)
```powershell
# Add domains to hosts file
powershell -ExecutionPolicy Bypass -File scripts\setup-local-domains.ps1

# Or double-click: scripts\setup-local-domains.bat (Run as Administrator)

# Remove domains later
powershell -ExecutionPolicy Bypass -File scripts\setup-local-domains.ps1 -Remove
```

#### Linux/macOS/Git Bash (Run with sudo)
```bash
# Add domains to hosts file
sudo ./scripts/setup-local-domains.sh

# Remove domains later
sudo ./scripts/setup-local-domains.sh --remove

# Use different env file
sudo ./scripts/setup-local-domains.sh --env-file .env.staging
```

### 3. Start with Docker
```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up --build

# Start with Prisma Studio (optional)
docker-compose --profile tools up --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000 (or your custom domain)
- **Backend API**: http://localhost:3001 (or your custom domain)
- **Prisma Studio**: http://localhost:5555 (if started with tools profile)
- **PostgreSQL**: localhost:5432

## Deployment Scenarios

### Development (Default)
- Uses localhost with default ports
- PostgreSQL runs in Docker container
- File uploads stored in `./storage/uploads`
- Database data stored in `./storage/postgres`

### Custom Ports
```bash
# .env
FRONTEND_PORT=8080
BACKEND_PORT=8081
POSTGRES_PORT=5433
PRISMA_PORT=5556
```

### Production Deployment
```bash
# .env.production
FRONTEND_DOMAIN=yourdomain.com
FRONTEND_URL=https://yourdomain.com
BACKEND_DOMAIN=api.yourdomain.com
BACKEND_URL=https://api.yourdomain.com
DATABASE_URL=postgresql://user:password@your-postgres-host:5432/production_db
JWT_SECRET=your-production-secret
NODE_ENV=production
```

### Staging Environment
```bash
# .env.staging
FRONTEND_URL=https://staging.yourdomain.com
BACKEND_URL=https://api-staging.yourdomain.com
DATABASE_URL=postgresql://user:password@staging-postgres:5432/staging_db
NODE_ENV=staging
```

## Database Management

### Available Scripts
```bash
# Generate Prisma client
npm run db:generate

# Apply schema changes (development)
npm run db:push

# Create and apply migrations
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Reset database
npm run db:migrate:reset

# Open Prisma Studio
npm run db:studio
```

### Migration Workflow

#### Development
```bash
# Make schema changes in prisma/schema.prisma
# Create migration
npm run db:migrate

# Or push changes directly (no migration file)
npm run db:push
```

#### Production
```bash
# Deploy existing migrations
npm run db:migrate:deploy
```

## File Storage

### Upload Configuration
- **Physical Path**: `./storage/uploads/`
- **Public Access**: `/uploads/filename`
- **Supported Types**: Images (JPG, JPEG, PNG), glTF files (GLTF, GLB)
- **Image Limits**: 1MB max size, 2024x2024 max dimensions

### Storage Structure
```
storage/
├── uploads/          # File uploads
│   └── .gitignore
└── postgres/         # PostgreSQL data
    └── .gitignore
```

## Docker Services

### Service Overview
1. **postgres** - PostgreSQL 15 Alpine
2. **backend** - Bun + Hono API server
3. **frontend** - React + Vite development server
4. **prisma-studio** - Database management UI (optional)

### Service Dependencies
- Frontend depends on Backend
- Backend depends on PostgreSQL (with health check)
- Prisma Studio depends on PostgreSQL

### Health Checks
PostgreSQL includes a health check to ensure the database is ready before starting dependent services.

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Reset PostgreSQL data
docker-compose down -v
rm -rf storage/postgres/*
docker-compose up postgres
```

#### Port Conflicts
```bash
# Check if ports are in use
netstat -an | grep :3000
netstat -an | grep :3001
netstat -an | grep :5432

# Change ports in .env file
FRONTEND_PORT=8080
BACKEND_PORT=8081
POSTGRES_PORT=5433
```

#### File Upload Issues
```bash
# Check storage directory permissions
ls -la storage/
mkdir -p storage/uploads
chmod 755 storage/uploads
```

#### Migration Issues
```bash
# Reset migrations (development only)
npm run db:migrate:reset

# Generate client after schema changes
npm run db:generate
```

### Environment-Specific Issues

#### Development
- Ensure Docker is running
- Check that no other services are using the same ports
- Verify `.env` file exists and has correct values

#### Production
- Use strong JWT_SECRET
- Configure proper DATABASE_URL for production database
- Set up SSL certificates for HTTPS
- Configure proper CORS origins

#### Staging
- Use separate database from production
- Configure staging-specific domains
- Test migrations before production deployment

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique passwords for production
- Rotate JWT secrets regularly
- Use environment-specific secrets

### Database Security
- Use strong PostgreSQL passwords
- Limit database access to application only
- Regular backups for production data
- Monitor database access logs

### File Uploads
- Validate file types and sizes
- Scan uploaded files for malware
- Implement rate limiting for uploads
- Regular cleanup of unused files

## Monitoring and Maintenance

### Health Checks
- Backend: `GET /api/health`
- PostgreSQL: Built-in Docker health check
- Frontend: Vite development server status

### Backup Strategy
```bash
# Database backup
docker-compose exec postgres pg_dump -U itemjs_user itemjs_db > backup.sql

# File uploads backup
tar -czf uploads-backup.tar.gz storage/uploads/
```

### Log Management
```bash
# View service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres

# Follow logs
docker-compose logs -f backend
```
