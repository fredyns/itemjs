# ItemJS - CRUD App with Master-Detail Functionality

A comprehensive CRUD application built with the BHVR stack (Bun + Hono + Vite + React) featuring master-detail functionality, 3D model viewing, and rich text editing.

## Tech Stack

- **Backend**: Hono (Node.js framework)
- **Frontend**: React + Vite
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **3D Rendering**: Three.js
- **Rich Text**: TipTap WYSIWYG Editor
- **State Management**: TanStack Query
- **Routing**: TanStack Router
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer for glTF files
- **Runtime**: Bun

## Features

### Authentication
- User registration and login with email/password
- JWT-based authentication
- Protected routes

### Items Management
- Create, read, update, delete items
- Rich text content with WYSIWYG editor
- Image upload support
- glTF 3D model upload (optional)
- Automatic slug generation from title
- View count tracking
- Search and pagination

### Sub-Items Management
- Create, read, update, delete sub-items under each item
- Required glTF 3D model upload for each sub-item
- Modal-based management interface

### 3D Model Viewing
- Interactive 3D model viewer using Three.js
- Support for glTF (.gltf, .glb) files
- 3D rotation and zoom controls
- Automatic model centering and scaling

### Dashboard
- Item and sub-item statistics
- Recent items overview
- Quick action buttons

## Database Schema

### Users Table
- `id` - Auto-increment primary key
- `email` - Unique email address
- `password` - Hashed password
- `createdAt`, `updatedAt` - Timestamps

### Items Table
- `id` - Auto-increment primary key
- `title` - Required string
- `slug` - Auto-generated unique slug
- `gltf_file` - Optional glTF file path
- `content` - Optional rich text content
- `posted_at` - Default current timestamp
- `image` - Optional image URL
- `view_counts` - Default 0
- `user_id` - Foreign key to users

### Sub-Items Table
- `id` - Auto-increment primary key
- `item_id` - Foreign key to items
- `title` - Required string
- `gltf_file` - Required glTF file path

## Local Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for compatibility)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd itemjs
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   bun run db:generate
   
   # Push database schema (creates SQLite database)
   bun run db:push
   ```

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   DATABASE_URL="file:./dev.db"
   ```

### Running the Application

1. **Development Mode (Recommended)**
   ```bash
   # Runs both server and client concurrently
   bun run dev
   ```
   
   This will start:
   - Backend server on `http://localhost:3001`
   - Frontend development server on `http://localhost:3000`

2. **Run Server and Client Separately**
   ```bash
   # Terminal 1 - Backend server
   bun run dev:server
   
   # Terminal 2 - Frontend client
   bun run dev:client
   ```

3. **Production Build**
   ```bash
   # Build both server and client
   bun run build
   
   # Start production server
   bun run start
   ```

### Database Management

```bash
# View database in Prisma Studio
bun run db:studio

# Reset database (recreate tables)
bun run db:push --force-reset

# Create and apply migrations
bun run db:migrate
```

## Project Structure

```
itemjs/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── server/                # Backend (Hono API)
│   │   ├── lib/              # Utilities (auth, db, utils)
│   │   └── routes/           # API routes
│   ├── components/           # React components
│   ├── contexts/            # React contexts (Auth)
│   ├── lib/                 # Frontend utilities (API client)
│   ├── pages/               # Page components
│   └── routes/              # TanStack Router routes
├── uploads/                 # File upload directory
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items (with pagination/search)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item (protected)
- `PUT /api/items/:id` - Update item (protected)
- `DELETE /api/items/:id` - Delete item (protected)

### Sub-Items
- `GET /api/sub-items/item/:itemId` - Get sub-items for item
- `GET /api/sub-items/:id` - Get single sub-item
- `POST /api/sub-items` - Create sub-item (protected)
- `PUT /api/sub-items/:id` - Update sub-item (protected)
- `DELETE /api/sub-items/:id` - Delete sub-item (protected)

### File Upload
- `POST /api/upload` - Upload glTF file (protected)
- `GET /uploads/:filename` - Serve uploaded files

## Usage Guide

### Getting Started

1. **Register/Login**
   - Visit `http://localhost:3000`
   - Create an account or login with existing credentials

2. **Create Your First Item**
   - Click "Add New Item" from dashboard or items page
   - Fill in title and optional content using the rich text editor
   - Optionally upload a glTF 3D model
   - Add an image URL if desired

3. **Add Sub-Items**
   - Navigate to an item's detail page
   - Click "Add Sub-Item"
   - Provide title and upload a glTF model (required for sub-items)

4. **View 3D Models**
   - 3D models are displayed with interactive controls
   - Use mouse to rotate, zoom, and pan around models

### File Upload Guidelines

- **Supported Formats**: .gltf, .glb
- **File Size**: Recommended under 10MB for optimal performance
- **3D Model Requirements**: Models should be optimized for web viewing

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Regenerate Prisma client
   bun run db:generate
   ```

2. **Port Already in Use**
   - Change ports in `vite.config.ts` (frontend) and `src/server/index.ts` (backend)

3. **3D Models Not Loading**
   - Ensure glTF files are valid and properly formatted
   - Check browser console for Three.js errors
   - Verify file upload was successful

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in environment variables

### Development Tips

- Use `bun run db:studio` to inspect database contents
- Check browser developer tools for frontend errors
- Monitor server logs for backend issues
- Ensure CORS is properly configured for your domain

## Production Deployment

### Environment Setup

1. **Set Production Environment Variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-very-secure-production-jwt-secret
   DATABASE_URL="file:./production.db"
   ```

2. **Build Application**
   ```bash
   bun run build
   ```

3. **Deploy**
   - Upload built files to your server
   - Ensure Bun is installed on production server
   - Run `bun run start` to start the production server
   - Set up reverse proxy (nginx/Apache) if needed
   - Configure SSL certificates for HTTPS

### Security Considerations

- Change default JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Regular security updates for dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
