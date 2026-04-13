# OnePageResume

OnePageResume 是一个开源的在线简历编辑器，支持多模板、实时预览、AI 内容压缩和一键导出 PDF。

## 功能

- 多套简历模板，实时切换
- 所见即所得的富文本编辑
- 拖拽排序简历模块
- 多页分页预览（A4 纸张）
- 一键导出高保真 PDF
- AI 智能压缩简历内容（需配置 Anthropic API Key）
- 简历分享（公开链接）
- 用户注册 / 登录

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19, Vite, TailwindCSS, Zustand, TipTap |
| 后端 | Fastify 5, Prisma, PostgreSQL, Redis |
| PDF | Puppeteer (Chromium) |
| AI | Anthropic Claude API |
| 工具链 | Turborepo, pnpm, TypeScript |

## 快速部署 (Docker Compose)

**前置要求：** 安装 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)。

```bash
# 1. 克隆项目
git clone https://github.com/your-username/OnePageResume.git
cd OnePageResume

# 2. 一键启动
docker compose up -d

# 3. 访问
# 打开浏览器访问 http://localhost:3001
```

启动后服务会自动完成数据库迁移，JWT 密钥会自动生成，无需手动配置。

> **生产环境建议：** 复制 `.env.example` 为 `.env` 并手动配置 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`，否则容器重启后已登录用户需重新登录。

## 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `JWT_SECRET` | 否 | 自动生成 | JWT 签名密钥（不设置则每次启动自动生成） |
| `JWT_REFRESH_SECRET` | 否 | 自动生成 | JWT 刷新令牌密钥（不设置则每次启动自动生成） |
| `POSTGRES_USER` | 否 | `postgres` | PostgreSQL 用户名 |
| `POSTGRES_PASSWORD` | 否 | `postgres` | PostgreSQL 密码 |
| `POSTGRES_DB` | 否 | `one_page_resume` | 数据库名称 |
| `PORT` | 否 | `3001` | 应用端口 |
| `FRONTEND_URL` | 否 | `http://localhost:3001` | 前端 URL（CORS 配置） |
| `ANTHROPIC_API_KEY` | 否 | - | Anthropic API Key（AI 压缩功能） |

## 本地开发

```bash
# 前置要求: Node.js >= 18, pnpm >= 9

# 安装依赖
pnpm install

# 启动 PostgreSQL 和 Redis（仅数据库）
docker compose up postgres redis -d

# 配置后端环境变量（JWT 密钥可不填，会自动生成）
cp apps/api/.env.example apps/api/.env

# 初始化数据库
cd apps/api && pnpm db:migrate && cd ../..

# 启动开发服务器
pnpm dev

# 前端: http://localhost:5173
# 后端: http://localhost:3001
```

## 项目结构

```
OnePageResume/
├── apps/
│   ├── api/          # Fastify 后端
│   └── web/          # React 前端
├── packages/
│   └── shared/       # 共享类型和 Schema
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## License

[MIT](LICENSE)
