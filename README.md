# NestJS + Prisma Backend Template

一个基于 NestJS + Prisma 的后端项目模板，包含 JWT 认证、PostgreSQL 数据库、Redis 限流和 Vercel 部署支持。

## ✨ 特性

- 🚀 **NestJS** - 现代化的 Node.js 后端框架
- 🗃️ **Prisma ORM** - 类型安全的数据库访问
- 🐘 **PostgreSQL** - 强大的关系型数据库
- 🔐 **JWT 认证** - 安全的用户认证系统
- ⚡ **Redis 限流** - 基于 Redis 的 API 访问限流
- 📚 **Swagger** - 自动生成 API 文档
- 🌐 **Vercel 部署** - 一键部署到 Vercel

## 📁 项目结构

```
Backend/
├── prisma/
│   └── schema.prisma          # 数据库模型定义
├── src/
│   ├── auth/                  # 认证模块
│   │   ├── decorators/        # 自定义装饰器
│   │   ├── dto/               # 数据传输对象
│   │   ├── guards/            # 认证守卫
│   │   ├── interfaces/        # 接口定义
│   │   └── strategies/        # Passport 策略
│   ├── common/                # 公共模块
│   │   ├── decorators/        # 公共装饰器
│   │   └── guards/            # 公共守卫
│   ├── posts/                 # 文章模块
│   │   └── dto/               # 文章 DTO
│   ├── prisma/                # Prisma 服务
│   ├── redis/                 # Redis 服务
│   ├── users/                 # 用户模块
│   │   └── dto/               # 用户 DTO
│   ├── app.module.ts          # 根模块
│   └── main.ts                # 入口文件
├── api/
│   └── index.ts               # Vercel Serverless 入口
├── vercel.json                # Vercel 配置
├── package.json
└── README.md
```

## 🚀 快速开始

### 1. 克隆并安装依赖

```bash
# 安装依赖
npm install
```

### 2. 配置环境变量

复制环境变量模板并修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Database - PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/nestjs_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Redis Configuration (for Rate Limiting)
REDIS_URL="redis://localhost:6379"

# App Configuration
PORT=3000
NODE_ENV="development"
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate
```

### 4. 启动开发服务器

```bash
npm run start:dev
```

服务器将运行在 http://localhost:3000

## 📖 API 文档

启动服务器后，访问 Swagger 文档：

- **本地**: http://localhost:3000/api/docs

## 🔑 API 接口

### 认证 (Auth)

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/auth/register` | 用户注册 |
| POST | `/auth/login` | 用户登录 |
| GET | `/auth/me` | 获取当前用户 |

### 用户 (Users)

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/users` | 获取用户列表 |
| GET | `/users/profile` | 获取当前用户详情 |
| GET | `/users/:id` | 获取指定用户 |
| PATCH | `/users/:id` | 更新用户信息 |
| DELETE | `/users/:id` | 删除用户 |

### 文章 (Posts)

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/posts` | 创建文章 |
| GET | `/posts` | 获取文章列表 |
| GET | `/posts/my` | 获取我的文章 |
| GET | `/posts/:id` | 获取文章详情 |
| PATCH | `/posts/:id` | 更新文章 |
| PATCH | `/posts/:id/publish` | 切换发布状态 |
| DELETE | `/posts/:id` | 删除文章 |

## 🛡️ 限流策略

API 限流基于 Redis 实现，默认配置：

- **短期限制**: 3 请求/秒
- **中期限制**: 20 请求/10秒
- **长期限制**: 100 请求/分钟

响应头会包含限流信息：
- `X-RateLimit-Limit`: 限制次数
- `X-RateLimit-Remaining`: 剩余次数
- `X-RateLimit-Reset`: 重置时间戳

## 🌐 部署到 Vercel

### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

### 2. 配置环境变量

在 Vercel Dashboard 中配置以下环境变量：

- `DATABASE_URL` - PostgreSQL 连接字符串
- `JWT_SECRET` - JWT 密钥
- `JWT_EXPIRES_IN` - JWT 过期时间
- `REDIS_URL` - Redis 连接字符串

### 3. 部署

```bash
# 构建项目
npm run vercel-build

# 部署到 Vercel
vercel --prod
```

## 📝 数据库模型

### User 模型

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  avatar    String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}
```

### Post 模型

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}
```

## 🧪 测试 API

### 注册用户

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'
```

### 登录

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 创建文章 (需要 Token)

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "My First Post", "content": "Hello World!", "published": true}'
```

## 📦 推荐的云服务

- **PostgreSQL**: [Supabase](https://supabase.com), [Neon](https://neon.tech), [Railway](https://railway.app)
- **Redis**: [Upstash](https://upstash.com), [Redis Cloud](https://redis.com/cloud/)
- **部署**: [Vercel](https://vercel.com), [Railway](https://railway.app)

## 📄 许可证

MIT License

