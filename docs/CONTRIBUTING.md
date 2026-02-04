# 开发指南

## 开发规范

### Git提交规范
```
feat: 新功能
fix: Bug修复
docs: 文档更新
style: 样式调整
refactor: 重构
```

### 分支策略
- `main` - 主分支，保持稳定
- `feature/*` - 功能开发分支
- `fix/*` - Bug修复分支

### 代码风格
- 使用TypeScript严格模式
- 组件使用函数式组件 + Hooks
- 样式优先使用Tailwind类名

## 核心数据结构

### NPC
```typescript
interface NPC {
  id: string              // 唯一标识 "npc-0"
  name: string            // 名字 "小张"
  title: string           // 身份 "部门经理"
  avatar: string          // Emoji头像 "👔"
  portraitUrl: string | null
  portraitTaskId: string | null
  portraitStatus: 'idle' | 'generating' | 'completed' | 'failed'
}
```

### 消息格式
```
[角色名] 对话内容
```

### UI模式
- **Normal模式**：用户正常对话
- **Reversed模式**：AI模仿用户风格自动回复（Ctrl+R切换）

## 常见开发任务

### 添加新的NPC头像映射
编辑 `src/store/useStore.ts` 中的 `getAvatarByRole` 函数

### 修改AI提示词
编辑 `src/lib/prompts.ts`：
- `generateSystemPrompt` - NPC对话系统提示
- `generateReversedPrompt` - 角色反转提示
- `generateFeedbackPrompt` - 分析报告提示

### 调整UI样式
编辑 `src/app/globals.css`

## API说明

### POST /api/chat
AI对话接口，流式返回。

```json
{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ]
}
```

### POST /api/generate-image
异步图像生成，返回taskId。

### GET /api/check-image?taskId=xxx
查询图像生成状态。

## 联系方式

如有问题，请在GitHub Issues中提出。

---

*最后更新：2026-02-04*
