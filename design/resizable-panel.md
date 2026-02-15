# 可拖拽面板设计

## 需求

对话列表（左侧）和文件管理（右侧）面板支持拖拽调整宽度。

## 实现方案

### 1. 拖拽逻辑 - `useResizable.ts`

创建通用的拖拽调整宽度 composable：

```typescript
// src/composables/useResizable.ts
export function useResizable(options: {
  initialWidth: number
  minWidth: number
  maxWidth: number
  direction?: 'left' | 'right'
  cssVarName?: string
})
```

### 2. 左侧会话列表 - SessionDrawer.vue

**技术要点：**
- 使用 `v-navigation-drawer` 组件，`fixed` 定位
- 拖拽时直接操作 DOM 的 `style.width`，绕过 Vue 响应式
- 拖拽时添加 `is-resizing` class 禁用过渡动画

**宽度限制：**
- 最小宽度：200px
- 最大宽度：400px
- 初始宽度：260px

**拖拽手柄：**
- 位置：drawer 右侧边缘
- 宽度：4px
- hover 时显示主题色高亮

### 3. 右侧文件管理 - FilePanel.vue

**技术要点：**
- 使用普通 div，`position: absolute` 定位
- 拖拽时直接操作 DOM 的 `style.width`
- 通过 `CustomEvent` 通知 MainLayout 更新聊天区域 margin

**宽度限制：**
- 最小宽度：280px
- 最大宽度：500px
- 初始宽度：320px

**拖拽手柄：**
- 位置：panel 左侧边缘
- 宽度：4px
- hover 时显示主题色高亮

### 4. 主布局适配 - MainLayout.vue

**技术要点：**
- 监听 `file-panel-resize` 自定义事件
- 使用 CSS 变量 `--file-panel-width` 控制聊天区域 margin-right
- 左侧 drawer 是 fixed 定位，自动推开内容，无需手动处理

**CSS 变量：**
```css
.content-wrapper {
  --file-panel-width: 320px;
}

.chat-area.with-panel {
  margin-right: var(--file-panel-width);
}
```

## 性能优化

### 问题
最初实现时拖拽卡顿，原因是：
1. Vue 响应式更新触发了组件重渲染
2. `v-navigation-drawer` 有内置过渡动画
3. CSS 变量在 `:root` 上更新导致全局重排

### 解决方案
1. 拖拽过程中直接操作 DOM（`element.style.width`），只在松开时同步 Vue 状态
2. 拖拽时添加 `is-resizing` class，禁用所有过渡动画
3. 使用 `{ passive: true }` 优化 mousemove 事件
4. CSS 变量限定在 `.content-wrapper` 作用域内，避免全局重排
5. 通过 `CustomEvent` 跨组件通信，避免 props drilling

## 文件变更

| 文件 | 变更类型 |
|------|----------|
| `src/composables/useResizable.ts` | 新增 |
| `src/components/layout/SessionDrawer.vue` | 修改 |
| `src/components/file/FilePanel.vue` | 修改 |
| `src/components/layout/MainLayout.vue` | 修改 |

## 事件通信

```
SessionDrawer (拖拽) → 直接操作 DOM width
     ↓
无需通知 MainLayout（fixed 定位自动处理）

FilePanel (拖拽) → 直接操作 DOM width + dispatchEvent('file-panel-resize')
     ↓
MainLayout → 监听事件 → 更新 CSS 变量 → chat-area margin-right 更新
```

## 样式参考

```css
/* 拖拽手柄 */
.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 10;
}

.resize-handle:hover {
  background-color: rgba(var(--v-theme-primary), 0.3);
}

/* 拖拽时禁用动画 */
.is-resizing {
  transition: none !important;
}
```
