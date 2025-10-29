# Microsoft Teams Bot Template (Node.js)

这是一个基于Node.js开发Microsoft Teams机器人的模板项目，提供了完整的基础架构和常用功能，帮助您快速开始Teams机器人开发。

## 功能特性

- 基础消息处理和回复
- 命令处理系统（如`/command1`, `/cardtest`）
- 自适应卡片(Adaptive Cards)支持
- 会话引用存储和管理
- 主动发送消息功能
- 错误处理和日志记录
- 健康检查端点
- MongoDB数据持久化
- Docker容器化部署支持
- 与OpenAI或Azure OpenAI的流式对话功能

## 技术栈

- **Node.js** - 运行时环境
- **Bot Framework SDK v4** - 机器人开发框架
- **MongoDB** - 数据存储
- **Restify** - Web服务器
- **Docker** - 容器化部署
- **OpenAI/Azure OpenAI** - AI对话功能

## 安装与配置

### 前提条件

- Node.js 22+
- npm
- MongoDB (本地或远程)
- Microsoft Teams 开发者账户
- (可选) Docker 和 Docker Compose

### 本地开发设置

1. 克隆仓库
   ```bash
   git clone <repository-url>
   cd teams-bot-template-nodejs
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   ```bash
   cp .env.example .env
   ```

4. 编辑`.env`文件，填写必要的配置信息：
   - `BOT_APP_ID`: 机器人的Microsoft App ID
   - `BOT_APP_PASSWORD`: 机器人的Microsoft App密码
   - `BOT_TENANT_ID`: 租户ID
   - `DB_USER`: 数据库用户名
   - `DB_PASSWORD`: 数据库密码
   - 其他配置项根据需要调整

5. 启动应用
   ```bash
   npm start
   ```

## Docker部署

### 使用Docker Compose (推荐)

1. 确保已配置`.env`文件（如上所述）

2. 编辑`docker-compose.yml`，确保MongoDB的初始用户名和密码与`.env`文件中的`DB_USER`和`DB_PASSWORD`一致

3. 构建和启动容器
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. 应用将在端口3978上运行，MongoDB将在端口27017上运行

### 手动Docker部署

1. 构建Docker镜像
   ```bash
   docker build -t teams-bot-template .
   ```

2. 运行容器
   ```bash
   docker run -p 3978:3978 --env-file .env teams-bot-template
   ```

## 环境变量说明

| 环境变量 | 描述 | 默认值 |
|---------|------|--------|
| TAG | 部署环境（dev/prod） | prod |
| BOT_NAME | 机器人名称（需与Teams中显示一致） | MyTeamsBot |
| BOT_APP_ID | 机器人的Microsoft App ID | - |
| BOT_APP_PASSWORD | 机器人的Microsoft App密码 | - |
| BOT_TENANT_ID | Microsoft 365租户ID | - |
| DB_HOST | MongoDB主机地址 | mongodb |
| DB_PORT | MongoDB端口 | 27017 |
| DB_NAME | 数据库名称 | myteamsbot |
| DB_USER | 数据库用户名 | - |
| DB_PASSWORD | 数据库密码 | - |
| DB_CONVERSATIONREFERENCE_COLLECTION_NAME | 会话引用集合名称 | conversationReference |
| OPENAI_API_KEY | OpenAI或Azure OpenAI的API密钥 | - |
| OPENAI_MODEL | OpenAI模型名称 | gpt-3.5-turbo |
| OPENAI_AZURE_BASE_URL | Azure OpenAI基础URL（使用标准OpenAI时留空） | - |
| ENABLE_STREAMING | 启用AI流式响应 | true |

## 项目结构

```
├── bots/
│   ├── adapter.js      # Bot Framework适配器配置
│   ├── bot.js          # 主要机器人逻辑
│   └── sendMessage.js  # 主动发送消息功能
├── models/
│   └── streaming.js    # 流媒体功能模型和工具
├── utils/
│   ├── database.js     # 数据库操作相关功能
│   └── openaiClient.js # OpenAI客户端，用于AI对话
├── index.js            # 应用入口点
├── package.json        # 项目依赖和脚本
├── docker-compose.yml  # Docker Compose配置
├── Dockerfile          # Docker构建文件
└── .env.example        # 环境变量示例文件
```

## 使用示例

### 基础消息和命令

机器人支持以下预定义命令：

- `/command1`: 触发命令1的响应
- `/cardtest`: 发送一个自适应卡片示例

### AI对话

默认情况下，任何未被识别为命令的消息都将由AI对话引擎处理。
- 机器人支持标准OpenAI和Azure OpenAI端点
- 流式响应默认已启用（`ENABLE_STREAMING=true`）
- 流式功能提供实时输入指示器和渐进式响应交付

### 扩展机器人功能

1. 在`bots/bot.js`中，您可以：
   - 添加更多命令处理器
   - 自定义卡片内容
   - 实现更多消息处理逻辑

2. 使用主动发送消息功能：
   ```javascript
   const { sendMessage } = require('./bots/sendMessage');
   
   // 发送文本消息
   await sendMessage(null, conversationId, 'text', 'Hello from Teams bot!');
   
   // 发送自适应卡片
   const cardContent = {
     type: 'AdaptiveCard',
     body: [
       { type: 'TextBlock', text: 'Hello Card' }
     ],
     $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
     version: '1.6'
   };
   await sendMessage(null, conversationId, 'card', cardContent);
   ```

## 调试

1. 使用Bot Framework Emulator进行本地调试
2. 查看控制台输出获取日志信息
3. 检查MongoDB中的会话引用数据

## 健康检查

应用提供了健康检查端点：
```
GET /api/health
```

## 贡献

欢迎提交问题和拉取请求。对于重大变更，请先开issue讨论您想要更改的内容。

## 许可证

[MIT](https://opensource.org/licenses/MIT)