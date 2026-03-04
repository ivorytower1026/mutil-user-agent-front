import type { SSEEvent } from '@/types/sse'
import type { ApiMessage } from '@/types/api'

export function isSubagentEvent(event: SSEEvent): boolean {
  return !!(event.namespace && event.namespace.length > 0)
}

export function getSubagentInfo(event: SSEEvent): { id: string; name: string } | null {
  if (!isSubagentEvent(event)) {
    return null
  }
  
  return {
    id: event.subagent_id || '',
    name: event.subagent_name || 'Unknown Subagent'
  }
}

export function isSubagentHistoryMessage(message: ApiMessage): boolean {
  return !!(message.is_subagent_call || message.in_subagent)
}

export function getSubagentDisplayName(name: string | undefined, id: string | undefined): string {
  if (name) {
    return name
  }
  if (id) {
    return `#${id.slice(0, 8)}`
  }
  return 'Subagent'
}
