# 10 - Prisma ORM for Laravel Developers

## 🎯 Learning Goals
- Understand Prisma ORM as the JavaScript equivalent of Laravel's Eloquent
- Learn Prisma schema definition and database modeling
- Master Prisma Client for database operations
- Compare Prisma patterns with Laravel Eloquent patterns
- Set up Prisma in a real project

## 🔄 Prisma vs Laravel Eloquent: Overview

### Laravel Eloquent (Familiar):
```php
// Model definition
class User extends Model {
    protected $fillable = ['name', 'email'];
    
    public function posts() {
        return $this->hasMany(Post::class);
    }
}

// Database operations
$users = User::with('posts')->where('active', true)->get();
$user = User::create(['name' => 'John', 'email' => 'john@example.com']);
```

### Prisma (New):
```typescript
// Schema definition (schema.prisma)
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  posts Post[]
}

// Database operations
const users = await prisma.user.findMany({
  where: { active: true },
  include: { posts: true }
})
const user = await prisma.user.create({
  data: { name: 'John', email: 'john@example.com' }
})
```

## 📋 Step 1: Understanding Prisma Architecture

### Laravel Architecture:
```
Model (Eloquent) → Database → Migration → Seeder
```

### Prisma Architecture:
```
Schema → Generate Client → Database → Seed
```

**Key Differences:**
- **Prisma Schema**: Single source of truth (like Laravel migrations + models combined)
- **Generated Client**: Type-safe database client (like Eloquent but generated)
- **Database First or Schema First**: Can work both ways

## 🛠️ Step 2: Prisma Setup

### Installation
```bash
npm install prisma @prisma/client
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Your database schema
- `.env` - Environment variables

### Database Configuration
Update `.env`:
```env
# Laravel equivalent: config/database.php
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
# or for SQLite (like Laravel's sqlite driver)
DATABASE_URL="file:./dev.db"
```

## 📊 Step 3: Schema Definition

### Laravel Migration vs Prisma Schema

**Laravel Migration:**
```php
// database/migrations/create_users_table.php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->timestamps();
});

// database/migrations/create_posts_table.php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('content');
    $table->foreignId('user_id')->constrained();
    $table->boolean('published')->default(false);
    $table->timestamps();
});
```

**Prisma Schema (All in one file):**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite", "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id              Int       @id @default(autoincrement())
  name            String
  email           String    @unique
  emailVerifiedAt DateTime? @map("email_verified_at")
  password        String
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  // Relationships
  posts           Post[]
  
  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  userId    Int      @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relationships
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("posts")
}
```

### Generate and Apply Schema
```bash
# Laravel equivalent: php artisan migrate
npx prisma migrate dev --name init

# Generate Prisma Client (Laravel equivalent: composer dump-autoload)
npx prisma generate
```

## 🔍 Step 4: Basic CRUD Operations

### Laravel Eloquent vs Prisma Client

#### Create Operations

**Laravel:**
```php
// Single record
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => Hash::make('password')
]);

// Multiple records
User::insert([
    ['name' => 'John', 'email' => 'john@example.com'],
    ['name' => 'Jane', 'email' => 'jane@example.com'],
]);
```

**Prisma:**
```typescript
// Single record
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    password: await bcrypt.hash('password', 10)
  }
})

// Multiple records
await prisma.user.createMany({
  data: [
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
  ]
})
```

#### Read Operations

**Laravel:**
```php
// Find by ID
$user = User::find(1);
$user = User::findOrFail(1);

// Find by condition
$user = User::where('email', 'john@example.com')->first();

// Get all with conditions
$users = User::where('active', true)
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

// With relationships
$users = User::with(['posts' => function($query) {
    $query->where('published', true);
}])->get();
```

**Prisma:**
```typescript
// Find by ID
const user = await prisma.user.findUnique({ where: { id: 1 } })
const user = await prisma.user.findUniqueOrThrow({ where: { id: 1 } })

// Find by condition
const user = await prisma.user.findFirst({
  where: { email: 'john@example.com' }
})

// Get all with conditions
const users = await prisma.user.findMany({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
  take: 10
})

// With relationships
const users = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true }
    }
  }
})
```

#### Update Operations

**Laravel:**
```php
// Update single record
$user = User::find(1);
$user->update(['name' => 'John Updated']);

// Update multiple records
User::where('active', false)->update(['status' => 'inactive']);

// Upsert
User::updateOrCreate(
    ['email' => 'john@example.com'],
    ['name' => 'John Doe', 'active' => true]
);
```

**Prisma:**
```typescript
// Update single record
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'John Updated' }
})

// Update multiple records
await prisma.user.updateMany({
  where: { active: false },
  data: { status: 'inactive' }
})

// Upsert
const user = await prisma.user.upsert({
  where: { email: 'john@example.com' },
  update: { name: 'John Doe', active: true },
  create: { name: 'John Doe', email: 'john@example.com', active: true }
})
```

#### Delete Operations

**Laravel:**
```php
// Delete by ID
User::destroy(1);
$user = User::find(1);
$user->delete();

// Delete multiple
User::where('active', false)->delete();

// Soft delete (if using SoftDeletes trait)
$user->delete(); // Soft delete
$user->forceDelete(); // Hard delete
```

**Prisma:**
```typescript
// Delete by ID
await prisma.user.delete({ where: { id: 1 } })

// Delete multiple
await prisma.user.deleteMany({
  where: { active: false }
})

// Soft delete (manual implementation)
await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: new Date() }
})
```

## 🔗 Step 5: Relationships

### Laravel Relationships vs Prisma Relations

#### One-to-Many

**Laravel:**
```php
// User model
public function posts() {
    return $this->hasMany(Post::class);
}

// Post model  
public function user() {
    return $this->belongsTo(User::class);
}

// Usage
$user = User::with('posts')->find(1);
$post = Post::with('user')->find(1);
```

**Prisma:**
```prisma
// Schema definition
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id     Int  @id @default(autoincrement())
  userId Int  @map("user_id")
  user   User @relation(fields: [userId], references: [id])
}
```

```typescript
// Usage
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true }
})

const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: { user: true }
})
```

#### Many-to-Many

**Laravel:**
```php
// User model
public function roles() {
    return $this->belongsToMany(Role::class);
}

// Role model
public function users() {
    return $this->belongsToMany(User::class);
}

// Usage
$user = User::with('roles')->find(1);
$user->roles()->attach($roleId);
```

**Prisma:**
```prisma
model User {
  id    Int    @id @default(autoincrement())
  roles Role[]
}

model Role {
  id    Int    @id @default(autoincrement())
  users User[]
}
```

```typescript
// Usage
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { roles: true }
})

// Attach role
await prisma.user.update({
  where: { id: 1 },
  data: {
    roles: {
      connect: { id: roleId }
    }
  }
})
```

## 🔧 Step 6: Advanced Queries

### Laravel Query Builder vs Prisma

**Laravel:**
```php
// Complex where conditions
$users = User::where('active', true)
    ->where(function($query) {
        $query->where('role', 'admin')
              ->orWhere('role', 'moderator');
    })
    ->whereHas('posts', function($query) {
        $query->where('published', true);
    })
    ->get();

// Aggregations
$stats = User::selectRaw('
    COUNT(*) as total,
    AVG(age) as avg_age,
    MAX(created_at) as latest
')->first();

// Raw queries
$users = DB::select('SELECT * FROM users WHERE custom_condition = ?', [$value]);
```

**Prisma:**
```typescript
// Complex where conditions
const users = await prisma.user.findMany({
  where: {
    active: true,
    OR: [
      { role: 'admin' },
      { role: 'moderator' }
    ],
    posts: {
      some: {
        published: true
      }
    }
  }
})

// Aggregations
const stats = await prisma.user.aggregate({
  _count: true,
  _avg: { age: true },
  _max: { createdAt: true }
})

// Raw queries
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE custom_condition = ${value}
`
```

## 🌱 Step 7: Database Seeding

### Laravel Seeders vs Prisma Seed

**Laravel Seeder:**
```php
// database/seeders/UserSeeder.php
class UserSeeder extends Seeder {
    public function run() {
        User::factory(10)->create();
        
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
    }
}
```

**Prisma Seed:**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('password', 10),
      }
    }),
    ...Array.from({ length: 10 }, (_, i) => 
      prisma.user.create({
        data: {
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          password: await bcrypt.hash('password', 10),
        }
      })
    )
  ])

  console.log('Created users:', users.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:
```bash
# Laravel: php artisan db:seed
npx prisma db seed
```

## 🚀 Step 8: Using Prisma in Your React App

### API Route Example (Next.js)

```typescript
// pages/api/users.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      include: { posts: true }
    })
    res.json(users)
  }
  
  if (req.method === 'POST') {
    const user = await prisma.user.create({
      data: req.body
    })
    res.json(user)
  }
}
```

### React Component with Prisma Data

```typescript
// components/UserList.tsx
import { useQuery } from '@tanstack/react-query'

interface User {
  id: number
  name: string
  email: string
  posts: Post[]
}

const UserList = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('/api/users')
      return response.json()
    }
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <p>{user.posts.length} posts</p>
        </div>
      ))}
    </div>
  )
}
```

## 🔧 Step 9: Prisma Studio (Database GUI)

```bash
# Laravel equivalent: php artisan tinker or database GUI tools
npx prisma studio
```

This opens a web interface to:
- Browse your data
- Edit records
- Run queries
- Visualize relationships

## 🎯 Key Differences Summary

| Feature | Laravel Eloquent | Prisma |
|---------|------------------|---------|
| **Schema Definition** | Migrations + Models | Single schema.prisma file |
| **Type Safety** | Runtime (with IDE help) | Compile-time TypeScript |
| **Query Builder** | Fluent methods | Object-based queries |
| **Relationships** | Method definitions | Schema-defined relations |
| **Migrations** | Up/down files | Automatic migration generation |
| **Seeding** | Seeder classes | Seed scripts |
| **Raw Queries** | DB::raw() | $queryRaw |

## 🏃‍♂️ Practice Exercise

Convert this Laravel model to Prisma:

**Laravel:**
```php
class Item extends Model {
    protected $fillable = ['title', 'content', 'slug', 'published'];
    
    public function subItems() {
        return $this->hasMany(SubItem::class);
    }
    
    public function user() {
        return $this->belongsTo(User::class);
    }
}

class SubItem extends Model {
    protected $fillable = ['title', 'gltf_file', 'item_id'];
    
    public function item() {
        return $this->belongsTo(Item::class);
    }
}
```

**Prisma Solution:**
```prisma
model Item {
  id        Int       @id @default(autoincrement())
  title     String
  content   String?
  slug      String    @unique
  published Boolean   @default(false)
  userId    Int       @map("user_id")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  
  user      User      @relation(fields: [userId], references: [id])
  subItems  SubItem[]
  
  @@map("items")
}

model SubItem {
  id       Int    @id @default(autoincrement())
  title    String
  gltfFile String @map("gltf_file")
  itemId   Int    @map("item_id")
  
  item     Item   @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  @@map("sub_items")
}
```

## 🚀 Next Steps

Now that you understand Prisma ORM, you're ready to build a full-stack application! 

**Next Tutorial**: `11-fullstack-prisma-app.md` - Build a complete CRUD app with Prisma backend and React frontend.

## 💡 Pro Tips for Laravel Developers

- **Schema-first approach**: Define your database structure in schema.prisma
- **Type safety**: Prisma generates TypeScript types automatically
- **Migration workflow**: Use `prisma migrate dev` for development
- **Database introspection**: Use `prisma db pull` to generate schema from existing database
- **Performance**: Use `include` and `select` to optimize queries
- **Transactions**: Use `prisma.$transaction()` for complex operations
