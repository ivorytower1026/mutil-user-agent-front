<template>
  <div class="message-item" :class="[message.role, { subagent: message.isSubagent }]">
    <div class="message-content">
      <div class="message-body">
        <template v-if="message.isSubagent">
          <SubagentMessage
            :subagent-name="message.subagentName"
            :content="message.content"
            :collapsed="message.collapsed ?? true"
            :is-streaming="isStreaming && message.isSubagent"
            @toggle="handleToggleSubagent"
          />
        </template>
        <template v-else>
          <div class="message-text">
            <MarkdownRenderer v-if="message.content" :content="message.content" />
            <LoadingDots v-if="isStreaming && !message.content" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

function handleToggleSubagent() {
  chatStore.toggleSubagentCollapse(props.message.id);
}
</script>

<style scoped>
.message-item {
  padding: 12px 0;
}

.message-item.subagent {
  padding: 4px 0;
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
