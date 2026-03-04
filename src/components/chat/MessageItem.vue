<template>
  <div class="message-item" :class="message.role">
    <div class="message-content">
      <div class="message-body">
        <div class="message-text">
          <MarkdownRenderer v-if="message.content" :content="message.content" />
          <LoadingDots v-if="isStreaming && !message.content" />
        </div>
        
        <SubagentMessage
          v-if="hasSubagentEvents"
          :subagent-id="message.subagentId"
          :subagent-name="message.subagentName"
          :events="message.subagentEvents || []"
          :collapsed="message.collapsed ?? true"
          :is-streaming="isStreaming && !message.subagentEvents?.length"
          @toggle="handleToggleSubagent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Message } from "@/types/chat";
import { useChatStore } from "@/stores/chat";
import MarkdownRenderer from "./MarkdownRenderer.vue";
import LoadingDots from "./LoadingDots.vue";
import SubagentMessage from "./SubagentMessage.vue";

const props = withDefaults(
  defineProps<{
    message: Message;
    isStreaming?: boolean;
  }>(),
  {
    isStreaming: false,
  }
);

const chatStore = useChatStore();

const hasSubagentEvents = computed(() => {
  return props.message.isSubagent && 
         (props.message.subagentEvents?.length || 0) > 0;
});

function handleToggleSubagent() {
  chatStore.toggleSubagentCollapse(props.message.id);
}
</script>

<style scoped>
.message-item {
  padding: 12px 0;
}

.message-content {
  display: flex;
  gap: 16px;
  max-width: 768px;
  margin: 0 auto;
  padding: 0 24px;
}

.message-body {
  flex: 1;
  min-width: 0;
  line-height: 1.6;
}

.message-text {
  font-size: 15px;
}

.message-item.user .message-content {
  flex-direction: row-reverse;
}

.message-item.user .message-body {
  display: flex;
  justify-content: flex-end;
}

.message-item.user .message-text {
  background-color: #eeecec;
  padding: 10px 16px;
  border-radius: 18px;
  max-width: 85%;
}

.v-theme--dark .message-item.user .message-text {
  background-color: #4f4e4e;
}
</style>
