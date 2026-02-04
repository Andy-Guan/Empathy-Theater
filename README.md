# 共情剧场 (EmpathyTheater)

AI驱动的心理剧沙盘模拟应用，帮助用户在安全的虚拟环境中练习社交场景。

## 核心功能

- 多NPC社交场景模拟
- 角色反转模式（观察AI模仿自己）
- 像素风格场景和人物画像自动生成
- 对话结束后的心理分析报告

## 快速开始

```bash
# 克隆项目
git clone https://github.com/travistoner/-.git
cd -

# 安装依赖
npm install

# 配置环境变量
# 创建 .env.local 文件，添加：
# MODELSCOPE_API_KEY=你的API密钥

# 启动开发服务器
npm run dev
```

访问 http://localhost:7860

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | React全栈框架，支持SSR |
| 语言 | TypeScript | 类型安全的JavaScript |
| 样式 | Tailwind CSS 4 | 原子化CSS框架 |
| 状态管理 | Zustand | 轻量级状态管理 |
| AI对话 | ModelScope API (GLM-4.7-Flash) | 智普AI大模型 |
| 图像生成 | Tongyi-MAI/Z-Image-Turbo | 通义万象图像生成 |

## API说明

### POST /api/chat
AI对话接口，流式返回SSE格式数据。

**请求体：**
```json
{
  "messages": [
    {"role": "system", "content": "系统提示词"},
    {"role": "user", "content": "用户消息"}
  ]
}
```

**响应：** `text/event-stream`
```
data: {"choices":[{"delta":{"content":"响应内容"}}]}
data: [DONE]
```

### POST /api/generate-image
异步图像生成，返回任务ID。

**请求体：**
```json
{
  "prompt": "像素风格场景描述"
}
```

**响应：**
```json
{
  "taskId": "xxx-xxx-xxx"
}
```

### GET /api/check-image?taskId=xxx
查询图像生成状态。

**响应：**
```json
{
  "status": "pending | completed | failed",
  "imageUrl": "https://..."
}
```

## 项目结构

```
EmpathyTheater/
├── docs/                       # 项目文档
│   ├── CONTRIBUTING.md         # 开发规范与指南
│   └── REQUIREMENTS.md         # 环境要求与依赖清单
│
├── src/                        # 源代码目录
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx            # 首页 - 场景和NPC输入
│   │   ├── chat/page.tsx       # 聊天页 - Galgame风格UI
│   │   ├── layout.tsx          # 全局布局
│   │   ├── globals.css         # 全局样式（像素风格）
│   │   └── api/                # 后端API路由
│   │       ├── chat/           # AI对话接口
│   │       ├── generate-image/ # 图像生成接口
│   │       └── check-image/    # 图像状态查询
│   │
│   ├── components/             # React UI组件
│   │   ├── DialogueBox.tsx     # 底部对话框
│   │   ├── NpcPortrait.tsx     # NPC半身立绘
│   │   ├── ChatInput.tsx       # 输入框组件
│   │   ├── ReverseButton.tsx   # 角色反转按钮
│   │   ├── MessageBubble.tsx   # 消息气泡
│   │   └── FeedbackPanel.tsx   # 分析报告面板
│   │
│   ├── lib/                    # 工具库
│   │   ├── prompts.ts          # AI提示词模板
│   │   └── api.ts              # API调用封装
│   │
│   └── store/                  # 状态管理
│       └── useStore.ts         # Zustand全局状态
│
├── package.json                # 项目依赖配置
├── next.config.js              # Next.js配置
├── tailwind.config.js          # Tailwind CSS配置
├── tsconfig.json               # TypeScript配置
└── postcss.config.js           # PostCSS配置
```

## 使用说明

1. 输入场景描述和角色信息
2. 选择要扮演的角色
3. 与AI控制的NPC进行对话
4. 使用 `Ctrl+R` 切换角色反转模式
5. 结束对话后查看心理分析报告

## 常见问题

**Q: 图像生成很慢？**
A: 图像生成需要1-5分钟，可使用"快速开始"跳过。

**Q: API报错429？**
A: API限流，请稍后重试。

## 开发指南

详见 [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

*最后更新：2026-02-04*
