# Hot-AI 后端服务

这是 Hot-AI 聊天应用的后端服务，基于 NestJS 框架构建，提供 AI 聊天、用户认证等功能。

## 功能特点

- 🤖 AI 聊天接口集成
- 🔐 用户认证与授权
- 🛡️ JWT 身份验证
- 📊 MySQL 数据存储
- 🔄 RESTful API

## 技术栈

- 框架: NestJS
- 数据库: MySQL
- ORM: TypeORM
- 认证: JWT
- API 集成: DeerAPI (AI 聊天)

## 项目结构

```
src/
├── app/                  # 应用主模块
├── chat/                 # 聊天相关模块
│   ├── dto/              # 数据传输对象
│   ├── chat.controller.ts # 聊天控制器
│   ├── chat.service.ts   # 聊天服务
│   └── chat.module.ts    # 聊天模块
├── user/                 # 用户相关模块
│   ├── dto/              # 数据传输对象
│   ├── entities/         # 用户实体
│   ├── guards/           # 认证守卫
│   ├── user.controller.ts # 用户控制器
│   ├── user.service.ts   # 用户服务
│   └── user.module.ts    # 用户模块
├── app.controller.ts     # 应用控制器
├── app.service.ts        # 应用服务
├── app.module.ts         # 应用主模块
└── main.ts               # 应用入口
```

## 开始使用

### 环境要求

- Node.js 18+
- MySQL 8.0+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

创建 `.env` 文件并添加以下配置：

```
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE=hot-ai

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# AI API 配置
DEER_API_KEY=your_deer_api_key
```

### 开发环境

```bash
pnpm run start:dev
```

### 生产环境

```bash
pnpm run start:prod
```

## API 文档

### 用户认证

- `POST /user/register` - 用户注册
- `POST /user/login` - 用户登录

### 聊天功能

- `POST /chat/use` - 发送消息给 AI 并获取回复

## 与前端集成

本后端服务设计为与 Hot-AI 前端应用 配合使用，提供完整的 AI 聊天体验。

## 贡献指南

欢迎提交 Pull Request 或创建 Issue 帮助改进此项目。

## 许可证

[MIT](LICENSE)
