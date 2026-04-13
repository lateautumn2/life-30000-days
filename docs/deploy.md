# 人生三万天 (Life 30,000 Days) - 部署指南

本项目支持两种主流的生产环境部署方式：**Docker Compose** 和 **PM2**。您可以根据您的服务器环境选择其中一种方式进行部署。

无论哪种部署方式，系统默认都会在项目的根目录下寻找或创建 `data/` 目录来持久化 SQLite 数据库文件 (`database.sqlite`)。

---

## 准备工作

在开始部署之前，请确保您已经克隆了项目代码到您的服务器上，并进入了项目根目录：

```bash
git clone <your-repository-url>
cd life-30000-days
```

---

## 方式一：使用 Docker Compose 部署 (推荐)

使用 Docker Compose 是最简单、最可靠的部署方式，它可以自动处理 Node.js 环境、构建过程以及端口映射。

### 1. 环境要求
- 已安装 [Docker](https://docs.docker.com/engine/install/)
- 已安装 [Docker Compose](https://docs.docker.com/compose/install/)

### 2. 启动服务
在项目根目录下（包含 `docker-compose.yml` 文件的位置），运行以下命令：

```bash
# 在后台启动容器
docker-compose up -d
```

Docker Compose 会自动执行以下步骤：
1. 根据 `Dockerfile` 构建包含前端和后端的 Node.js 镜像（多阶段构建，极大减小体积）。
2. 将容器内的 `/app/data` 目录映射到宿主机的 `./data` 目录，确保数据库文件持久化。
3. 暴露并映射宿主机的 `3001` 端口到容器的 `3001` 端口。
4. 注入环境变量 `NODE_ENV=production`、`PORT=3001`、`DB_PATH=/app/data/database.sqlite` 以及 `JWT_SECRET`。

### 3. 验证部署
容器启动后，您可以通过以下命令查看运行日志：

```bash
docker-compose logs -f
```

当看到日志输出 `Server is running on port 3001` 时，说明服务已成功启动。您可以访问 `http://<your-server-ip>:3001` 来访问应用。

### 4. 停止与更新
- **停止服务**：
  ```bash
  docker-compose down
  ```
- **更新代码并重新部署**：
  ```bash
  git pull
  docker-compose up -d --build
  ```

---

## 方式二：使用 PM2 原生部署

如果您希望直接在宿主机上运行 Node.js 进程，或者您已经在使用 PM2 管理其他 Node.js 应用，可以选择此方式。

### 1. 环境要求
- 已安装 [Node.js](https://nodejs.org/) (推荐 v18 或 v20 以上版本)
- 已安装 npm
- 全局安装 [PM2](https://pm2.keymetrics.io/) 和 `tsx`：
  ```bash
  npm install -g pm2 tsx
  ```

### 2. 安装依赖并构建前端
由于我们在生产环境不使用 Vite 启动前端，而是通过 Express 托管静态文件，因此需要先构建前端代码：

```bash
# 1. 安装项目依赖
npm install

# 2. 构建前端产物 (将生成 dist/ 目录)
npm run build
```

### 3. 使用 PM2 启动服务
在项目根目录下，使用预设好的 `ecosystem.config.cjs` 配置文件启动服务：

```bash
# 使用生产环境配置启动
pm2 start ecosystem.config.cjs --env production
```

PM2 将会读取配置并启动一个名为 `life-30000-days` 的进程，执行 `api/server.ts`，并自动设置环境变量 `NODE_ENV=production`、`PORT=3001` 等。

### 4. 验证部署
您可以使用以下命令查看应用状态和日志：

```bash
# 查看所有 PM2 进程状态
pm2 list

# 查看应用日志
pm2 logs life-30000-days
```

当看到日志输出 `Server is running on port 3001` 时，说明服务已成功启动。您可以访问 `http://<your-server-ip>:3001` 来访问应用。

### 5. 停止与更新
- **停止服务**：
  ```bash
  pm2 stop life-30000-days
  ```
- **重启服务**：
  ```bash
  pm2 restart life-30000-days
  ```
- **设置开机自启**（可选）：
  ```bash
  pm2 startup
  pm2 save
  ```

---

## 常见问题 (FAQ)

**Q1: 如何修改生产环境的端口？**
- **Docker Compose**: 修改 `docker-compose.yml` 中的 `ports` 配置（例如改为 `80:3001` 即可将外网 80 端口映射到容器 3001 端口）。
- **PM2**: 修改 `ecosystem.config.cjs` 中的 `env_production.PORT` 值，并使用 `pm2 restart life-30000-days --update-env` 重启。

**Q2: 数据库文件在哪里？**
数据库文件位于项目根目录下的 `data/database.sqlite`。请**务必**在备份或迁移服务器时，将整个 `data/` 目录妥善保存。

**Q3: 如何修改 JWT 密钥？**
请修改 `docker-compose.yml` 或 `ecosystem.config.cjs` 中环境变量 `JWT_SECRET` 的值，将其替换为您自己的高强度随机字符串。
