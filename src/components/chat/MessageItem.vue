<template>
  <div class="message-item" :class="[message.role, { subagent: message.isSubagent }]">
    <div class="message-content">
      <div class="message-body">
        <template v-if="message.isSubagent === true">
          <SubagentMessage
            :subagent-name="message.subagentName"
            :content="message.content"
            :collapsed="message.collapsed ?? true"
            :is-streaming="isStreaming"
            @toggle="handleToggleSubagent"
          />
        </template>
        <template v-else>
          <div class="message-text-wrapper">
            <div class="message-text">
              <MarkdownRenderer v-if="message.content" :content="message.content" />
              <LoadingDots v-if="isStreaming && !message.content" />
            </div>
            <div v-if="showCopyButton && !isStreaming && message.content" class="message-actions">
              <CopyButton :text="message.content" size="small" />
            </div>
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
import CopyButton from "@/components/common/CopyButton.vue";

const props = withDefaults(
  defineProps<{
    message: Message;
    isStreaming?: boolean;
    showCopyButton?: boolean;
  }>(),
  {
    isStreaming: false,
    showCopyButton: false,
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
  position: relative;
}

.message-item.subagent {
  padding: 4px 0;
}

.message-content {
  display: flex;
  max-width: 768px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
}

.message-body {
  flex: 1;
  min-width: 0;
  line-height: 1.6;
}

.message-text-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.message-text {
  font-size: 15px;
  word-wrap: break-word;
}

.message-actions {
  display: flex;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.message-item.user .message-content {
  flex-direction: row-reverse;
}

.message-item.user .message-body {
  display: flex;
  justify-content: flex-end;
}

.message-item.user .message-text-wrapper {
  align-items: flex-end;
  max-width: 85%;
}

.message-item.user .message-text {
  background-color: #eeecec;
  padding: 10px 16px;
  border-radius: 18px;
  display: inline-block;
  width: auto;
}

.message-item.user .message-actions {
  justify-content: flex-end;
  margin-right: 16px;
}

.message-item.assistant .message-actions {
  justify-content: flex-start;
}

.v-theme--dark .message-item.user .message-text {
  background-color: #4f4e4e;
}
</style>
