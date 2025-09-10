# Docker Setup Guide

This guide explains how to run the ItemJS application using Docker Desktop.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (to clone the repository)

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd itemjs
   ```

2. **Start the application**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Prisma Studio (optional): http://localhost:5555

## Services Overview

### 🎨 Frontend Service
- **Technology**: React + Vite + TypeScript
- **Port**: 3000
- **Features**: Hot reload, Tailwind CSS, TanStack Router & Query

### 🚀 Backend Service
- **Technology**: Bun + Hono + Prisma ORM
- **Port**: 3001
- **Database**: SQLite (file-based)
- **Features**: JWT authentication, file uploads, RESTful API

### 🗄️ Database Management (Optional)
- **Technology**: Prisma Studio
- **Port**: 5555
- **Purpose**: Visual database browser and editor

## Docker Commands

### Basic Operations

```bash
# Start all services (build if needed)
docker-compose up --build

# Start in background (detached mode)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend
```

### Development Commands

```bash
# Rebuild specific service
docker-compose build frontend
docker-compose build backend

# Restart specific service
docker-compose restart backend

# Run Prisma Studio (database management)
docker-compose --profile tools up prisma-studio
```

### Database Operations

```bash
# Generate Prisma client
docker-compose exec backend bun run db:generate

# Push database schema
docker-compose exec backend bun run db:push

# Run database migrations
docker-compose exec backend bun run db:migrate

# Open Prisma Studio
docker-compose --profile tools up prisma-studio
```

## File Structure

```
itemjs/
├── docker-compose.yml          # Multi-service orchestration
├── Dockerfile.frontend         # Frontend container definition
├── Dockerfile.backend          # Backend container definition
├── .dockerignore              # Files to exclude from Docker context
├── src/
│   ├── components/            # React components
│   ├── pages/                # Application pages
│   ├── server/               # Backend API (Bun + Hono)
│   └── ...
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── dev.db               # SQLite database file
└── uploads/                  # File upload directory
```

## Environment Variables

The application uses the following environment variables:

### Backend (.env)
```env
NODE_ENV=development
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Frontend
```env
VITE_API_URL=http://localhost:3001
```

## Volume Mounts

The Docker setup includes volume mounts for development:

- **Frontend**: Source code, config files
- **Backend**: Server code, database, uploads
- **Uploads**: Persistent file storage

## Networking

Services communicate through a custom Docker network:
- Frontend → Backend: `http://backend:3001`
- External access: `http://localhost:3000` and `http://localhost:3001`

## Troubleshooting

### Common Issues

1. **OpenSSL/Prisma Issues**:
   ```
   Error: Prisma failed to detect the libssl/openssl version
   ```
   **Solution**: The backend Dockerfile now includes OpenSSL installation. If you still see this error:
   ```bash
   # Clean rebuild to ensure OpenSSL is installed
   docker-compose down
   docker-compose build --no-cache backend
   docker-compose up
   ```

2. **Port already in use**:
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   
   # Kill the process or change ports in docker-compose.yml
   ```

3. **Database issues**:
   ```bash
   # Reset database
   docker-compose down
   docker volume prune
   docker-compose up --build
   ```

4. **Permission issues** (Windows):
   - Ensure Docker Desktop has access to your drive
   - Run Docker Desktop as administrator if needed

5. **Build failures**:
   ```bash
   # Clean rebuild
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

6. **Database initialization fails**:
   ```bash
   # Manual database setup
   docker-compose exec backend bun run db:generate
   docker-compose exec backend bun run db:push
   ```

7. **Bun/TypeScript execution errors**:
   ```
   Error: Cannot find module './cjs/index.cjs'
   ```
   **Solution**: This occurs when trying to use Node.js tools (like `tsx`) in a Bun environment. The package.json scripts have been updated to use Bun's native TypeScript support:
   ```bash
   # If you see this error, rebuild the backend
   docker-compose build --no-cache backend
   docker-compose up
   ```

8. **Rollup/Vite native binary errors (Frontend)**:
   ```
   Error: Cannot find module @rollup/rollup-linux-x64-musl
   Error: Cannot find module @rollup/rollup-linux-x64-gnu
   ```
   **Solution**: This is caused by npm's optional dependencies bug with Rollup native binaries. The frontend Dockerfile now handles this by:
   - Removing package-lock.json to force fresh dependency resolution
   - Clearing npm cache
   - Installing dependencies fresh
   - Explicitly installing the correct platform binary
   
   ```bash
   # Rebuild frontend with the comprehensive fix
   docker-compose build --no-cache frontend
   docker-compose up
   ```
   
   **Alternative manual fix** if the issue persists:
   ```bash
   # Enter the frontend container and fix manually
   docker-compose exec frontend bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   npm install @rollup/rollup-linux-x64-gnu --save-dev
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands inside containers
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use production values
2. **Database**: Switch to PostgreSQL or MySQL
3. **File Storage**: Use cloud storage (AWS S3, etc.)
4. **Security**: Update JWT secrets, enable HTTPS
5. **Optimization**: Use multi-stage builds, minimize image sizes

### Production Docker Compose Example

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

## Features Included

### 🖼️ Image Upload System
- **Validation**: JPG/JPEG only, max 1MB, max 2024×2024px
- **Error Messages**: Descriptive validation feedback with emojis
- **Preview**: Real-time image preview with remove functionality

### 🎯 3D Model Support
- **Format**: glTF/GLB files
- **Viewer**: Three.js integration for 3D model display
- **Upload**: Drag-and-drop file upload interface

### 📝 Rich Content Editor
- **WYSIWYG**: TipTap editor for rich text content
- **Features**: Bold, italic, links, images, lists

### 🔐 Authentication
- **JWT**: Secure token-based authentication
- **Registration**: Email/password user registration
- **Protected Routes**: Secure API endpoints

## Support

If you encounter any issues:

1. Check the logs: `docker-compose logs`
2. Verify Docker Desktop is running
3. Ensure ports 3000 and 3001 are available
4. Try a clean rebuild: `docker-compose down && docker-compose up --build`

For development questions, refer to:
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
