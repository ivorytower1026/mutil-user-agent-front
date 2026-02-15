# 中断弹窗与运行状态优化方案

## 问题背景

### 当前问题

1. **中断弹窗突兀**：使用 `v-dialog` 模态弹窗打断用户注意力，体验不够流畅
2. **SSE 运行状态不明确**：只有输入框禁用，没有明确的"正在运行"提示，用户不知道 AI 是否在工作

### 目标

参考 opencode 的交互方式：
- 中断时将输入框**内嵌转换为选择器**，而非弹出模态框
- SSE 运行中显示**友好的状态提示**

---

## 方案设计

### 1. 中断选择器（输入框内嵌）

将中断弹窗改为**直接在输入框区域显示选择界面**，保持布局稳定性。

**视觉效果**：
```
┌─────────────────────────────────────────────┐
│ ⚠️ 需要人工确认                             │
│ ──────────────────────────────────────────  │
│ 中断信息: [interrupt.info]                  │
│ 任务名称: [taskName]                        │
│ ──────────────────────────────────────────  │
│              [取消执行]  [继续执行]          │
└─────────────────────────────────────────────┘
```

### 2. SSE 运行状态提示

在输入框**上方**显示运行状态条，提示用户 AI 正在处理。

**视觉效果**：
```
┌─────────────────────────────────────────────┐
│ ◌ AI 正在思考中...                          │  ← 状态条
├─────────────────────────────────────────────┤
│ [输入消息...]                        [发送] │  ← 输入框禁用
└─────────────────────────────────────────────┘
```

---

## 技术实现

### 涉及文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/chat/ChatInput.vue` | **重构** | 支持 3 种模式切换 |
| `src/components/chat/ChatContainer.vue` | **修改** | 移除弹窗，传递新 props |
| `src/components/interrupt/InterruptDialog.vue` | **删除** | 不再需要弹窗组件 |
| `src/components/interrupt/InterruptDetail.vue` | **保留** | 中断详情展示组件 |

### ChatInput.vue 重构

#### 新增 Props

```typescript
defineProps<{
  disabled?: boolean
  placeholder?: string
  isLoading?: boolean           // 新增：SSE 运行状态
  interrupt?: Interrupt | null  // 新增：中断信息
}>()
```

#### 新增 Events

```typescript
emit('send', [message: string])
emit('resume', [action: 'continue' | 'cancel'])  // 新增：中断恢复
```

#### 模板结构

```vue
<template>
  <div class="chat-input-wrapper">
    <!-- 模式1: SSE 运行中状态条 -->
    <div v-if="isLoading && !interrupt" class="status-bar">
      <v-progress-circular indeterminate size="16" />
      <span>AI 正在思考中...</span>
    </div>
    
    <!-- 模式2: 中断选择器 -->
    <div v-if="interrupt" class="interrupt-selector">
      <div class="interrupt-header">
        <v-icon color="warning">mdi-alert-circle</v-icon>
        <span>需要人工确认</span>
      </div>
      <InterruptDetail :interrupt="interrupt" />
      <div class="interrupt-actions">
        <v-btn
          color="error"
          variant="outlined"
          :disabled="isLoading"
          @click="emit('resume', 'cancel')"
        >
          <v-icon start>mdi-close</v-icon>
          取消执行
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="isLoading"
          @click="emit('resume', 'continue')"
        >
          <v-icon start>mdi-check</v-icon>
          继续执行
        </v-btn>
      </div>
    </div>
    
    <!-- 模式3: 正常输入框 -->
    <div v-else class="chat-input-container">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        :placeholder="placeholder"
        :disabled="disabled"
        class="chat-textarea"
        rows="1"
        @keydown="handleKeydown"
        @input="autoResize"
      />
      <button
        class="send-btn"
        :disabled="disabled || !inputText.trim()"
        @click="handleSend"
      >
        <v-icon size="20">mdi-arrow-up</v-icon>
      </button>
    </div>
    
    <p v-if="!interrupt" class="hint-text">
      按 Enter 发送，Shift + Enter 换行
    </p>
  </div>
</template>
```

### ChatContainer.vue 修改

```vue
<template>
  <div class="chat-container">
    <MessageList ... />
    
    <!-- 移除 InterruptDialog -->
    
    <ChatInput
      :is-loading="isLoading"
      :interrupt="interrupt"
      :disabled="isLoading"
      @send="handleSend"
      @resume="handleResume"
    />
  </div>
</template>

<script setup lang="ts">
// ...

function handleResume(action: 'continue' | 'cancel') {
  if (sessionStore.currentThreadId) {
    resumeInterrupt(sessionStore.currentThreadId, action)
  }
}
</script>
```

---

## 样式设计

### 状态条样式

```css
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 768px;
  margin: 0 auto 8px;
  padding: 8px 16px;
  background-color: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.v-theme--dark .status-bar {
  background-color: rgba(33, 150, 243, 0.15);
  color: rgba(255, 255, 255, 0.7);
}
```

### 中断选择器样式

```css
.interrupt-selector {
  max-width: 768px;
  margin: 0 auto;
  padding: 16px;
  background-color: rgba(255, 193, 7, 0.08);
  border-radius: 16px;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.interrupt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
}

.interrupt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.v-theme--dark .interrupt-selector {
  background-color: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.4);
}
```

---

## 交互流程

### 正常流程

```
用户输入 → SSE 开始 → 显示状态条 + 禁用输入框 → SSE 结束 → 恢复输入框
```

### 中断流程

```
SSE 运行 → 收到 interrupt 事件 → 显示中断选择器 → 用户选择 → 调用 resume API → 继续流程
```

---

## 实施步骤

1. **重构 ChatInput.vue**
   - 添加 isLoading 和 interrupt props
   - 添加 resume 事件
   - 实现三种模式的模板切换
   - 添加相关样式

2. **修改 ChatContainer.vue**
   - 移除 InterruptDialog 引用
   - 传递新 props 给 ChatInput
   - 添加 handleResume 处理函数

3. **删除 InterruptDialog.vue**
   - 确认无其他引用后删除

4. **测试验证**
   - 验证正常输入功能
   - 验证 SSE 运行状态显示
   - 验证中断选择器交互
   - 验证亮/暗主题适配

---

## 风险与注意事项

1. **中断选择器高度**：可能比原输入框高，需要确保布局不会跳动太大
2. **移动端适配**：需要测试小屏幕上的按钮布局
3. **状态切换动画**：可考虑添加过渡动画提升体验
