# Getting Started with ItemJS

This guide will help you quickly set up and run the ItemJS CRUD application locally.

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for compatibility)

## Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Set Up Database
```bash
# Generate Prisma client
bun run db:generate

# Create database and tables
bun run db:push
```

### 3. Environment Configuration (Optional)
Create a `.env` file in the root directory if you want to customize settings:
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL="file:./dev.db"
```

### 4. Run the Application
```bash
# Start both server and client (recommended)
bun run dev
```

This will start:
- **Backend API** on `http://localhost:3001`
- **Frontend App** on `http://localhost:3000`

### 5. Access the Application
Open your browser and navigate to `http://localhost:3000`

## First Steps in the App

### 1. Create an Account
- Click "Create your account" on the login page
- Enter your email and password (minimum 6 characters)
- You'll be automatically logged in after registration

### 2. Explore the Dashboard
- View your item and sub-item statistics
- Use quick action buttons to navigate

### 3. Create Your First Item
- Click "Add New Item" from the dashboard or items page
- Fill in the title (required)
- Add rich text content using the WYSIWYG editor
- Optionally upload a glTF 3D model (.gltf or .glb files)
- Add an image URL if desired
- Click "Create Item"

### 4. Add Sub-Items
- Navigate to your item's detail page by clicking on it
- Click "Add Sub-Item" button
- Provide a title and upload a glTF model (required for sub-items)
- Click "Create Sub-Item"

### 5. View 3D Models
- 3D models are displayed with interactive controls
- Use your mouse to:
  - **Rotate**: Left-click and drag
  - **Zoom**: Scroll wheel or right-click and drag
  - **Pan**: Middle-click and drag (or Shift + left-click and drag)

## Alternative Development Commands

If you prefer to run the server and client separately:

```bash
# Terminal 1 - Backend server
bun run dev:server

# Terminal 2 - Frontend client  
bun run dev:client
```

## Database Management

```bash
# View database in Prisma Studio (optional)
bun run db:studio

# Reset database if needed
bun run db:push --force-reset
```

## Troubleshooting

### Windows Permission Issues with Bun Install
If you encounter `EPERM: Operation not permitted` errors during `bun install`:

**Solution 1: Run as Administrator**
```bash
# Run PowerShell or Command Prompt as Administrator, then:
bun install
```

**Solution 2: Clear Bun Cache**
```bash
# Clear Bun's cache and try again
bun pm cache rm
bun install
```

**Solution 3: Use npm as Alternative**
```bash
# If Bun continues to have issues, use npm instead:
npm install
npm run dev
```

**Solution 4: Disable Antivirus Temporarily**
- Some antivirus software blocks file operations
- Temporarily disable real-time protection during installation
- Re-enable after installation completes

### Port Already in Use
If you get port conflicts, you can modify the ports in:
- `vite.config.ts` (frontend port)
- `src/server/index.ts` (backend port)

### Database Issues
```bash
# Regenerate Prisma client
bun run db:generate
# or with npm
npm run db:generate
```

### 3D Models Not Loading
- Ensure your glTF files are valid (.gltf or .glb format)
- Check that file upload was successful
- Look for errors in browser developer console

## What's Next?

- Explore the search and pagination features on the items page
- Try editing items and sub-items using the modal interfaces
- Upload different 3D models to see how they render
- Check out the rich text editor features for item content

For detailed documentation, see the main [README.md](./README.md) file.

## Need Help?

- Check the browser developer console for frontend errors
- Monitor the terminal for server-side logs
- Ensure all dependencies are properly installed with `bun install`
- Verify that Bun is properly installed and up to date
