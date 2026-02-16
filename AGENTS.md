# AGENTS.md - AI Agent Development Guidelines

## Project Overview

This is a Vue 3 + TypeScript + Vuetify frontend application for a multi-agent AI platform. It features real-time chat streaming, file management with WebDAV, authentication, and interrupt-based human-in-the-loop workflows.

## Build/Lint/Test Commands

```bash
# Development server (runs on port 3000 by default)
npm run dev

# Type checking (run before commits)
npm run type-check
# or
npx vue-tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

**Note:** No test framework is currently configured. No ESLint/Prettier config exists - follow the code style patterns in this document.

## Project Structure

```
src/
├── api/              # API modules and axios client
│   ├── client.ts     # Base axios instance with interceptors
│   ├── auth.ts       # Authentication API
│   ├── chat.ts       # Chat API
│   ├── sse.ts        # Server-sent events streaming
│   ├── webdav.ts     # WebDAV file operations
│   └── index.ts      # Re-exports all API modules
├── components/
│   ├── auth/         # Login/Register forms
│   ├── chat/         # Chat UI components
│   ├── common/       # Shared UI components
│   ├── file/         # File management UI
│   ├── interrupt/    # Human-in-the-loop dialogs
│   └── layout/       # App layout components
├── composables/      # Vue composition functions
├── plugins/          # Vuetify configuration
├── router/           # Vue Router setup
├── stores/           # Pinia stores
├── types/            # TypeScript type definitions
└── views/            # Route-level views
```

## Code Style Guidelines

### Imports

- Use `@/*` path alias for src imports: `import { useChatStore } from '@/stores/chat'`
- Group imports: Vue imports first, then external libs, then local modules
- Use `import type` for type-only imports: `import type { Message } from '@/types/chat'`

```typescript
// Good
import { ref, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import type { Message } from '@/types/chat'
```

### TypeScript

- Strict mode is enabled in tsconfig.json
- Always define explicit types for function parameters and return values
- Use interfaces for object shapes, types for unions/primitives
- Avoid `any` - use `unknown` and narrow with type guards

```typescript
// Interface for object shapes
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
}

// Type for unions
export type Status = 'idle' | 'interrupted'
```

### Vue Components

- Use `<script setup lang="ts">` syntax
- Define props with `defineProps<T>()` with defaults via `withDefaults()`
- Define emits with typed `defineEmits<T>()`
- Keep template, script, and style sections in that order

```vue
<script setup lang="ts">
import type { Message } from '@/types/chat'

const props = withDefaults(defineProps<{
  message: Message
  isStreaming?: boolean
}>(), {
  isStreaming: false
})

const emit = defineEmits<{
  send: [message: string]
  removeFile: [index: number]
}>()
</script>
```

### Pinia Stores

- Use composition API style with `defineStore('name', () => {})`
- Export refs for state, functions for actions
- Return all public state and methods at the end

```typescript
export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)

  function addUserMessage(content: string) {
    messages.value.push({ /* ... */ })
  }

  return {
    messages,
    isLoading,
    addUserMessage
  }
})
```

### Composables

- Prefix with `use`: `useChatStream`, `useAuth`
- Return reactive refs and functions as an object
- Keep composposables focused on a single concern

### API Modules

- Export as objects with named methods
- Use the centralized axios client from `./client`

```typescript
export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', data)
    return response.data
  }
}
```

### Error Handling

- Use try/catch in async functions
- Check error type with `instanceof Error`
- Provide meaningful error messages to users

```typescript
try {
  await someAsyncOperation()
} catch (e: unknown) {
  if (e instanceof Error && e.name === 'AbortError') {
    console.log('Operation cancelled')
  } else {
    store.setError(e instanceof Error ? e.message : 'Unknown error')
  }
}
```

### Naming Conventions

- **Files**: camelCase for TypeScript/Vue files: `useChatStream.ts`, `MessageItem.vue`
- **Components**: PascalCase: `MessageItem`, `ChatInput`
- **Stores**: camelCase with `use` prefix: `useChatStore`
- **Composables**: camelCase with `use` prefix: `useChatStream`
- **Types/Interfaces**: PascalCase: `Message`, `ToolCall`
- **Variables**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE: `MAX_FILE_SIZE`

### CSS/Styles

- Use scoped styles in Vue components: `<style scoped>`
- Support dark theme with `.v-theme--dark` class selectors
- Use semantic class names over utility classes

### Async Patterns

- Use `async/await` over raw Promises
- Use `AbortController` for cancellable operations (SSE streaming)
- Handle cleanup in `finally` blocks

```typescript
const abortController = ref<AbortController | null>(null)

async function sendMessage() {
  abortController.value = new AbortController()
  try {
    for await (const event of streamChat(signal)) {
      // handle event
    }
  } finally {
    abortController.value = null
  }
}

function stopStream() {
  abortController.value?.abort()
}
```

## Environment Variables

Configure in `.env` file:
- `VITE_API_BASE_URL` - API base URL (default: empty, uses proxy)
- `VITE_SERVER_PORT` - Dev server port (default: 3000)
- `VITE_BACKEND_URL` - Backend URL for proxy (default: http://localhost:8002)

## Before Committing

1. Run `npm run type-check` to ensure no TypeScript errors
2. Verify the build succeeds with `npm run build`
3. Test the feature in the browser with `npm run dev`
