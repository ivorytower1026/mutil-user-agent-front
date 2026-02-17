<template>
  <div ref="listRef" class="message-list" @scroll="handleScroll">
    <div v-if="messages.length === 0" class="empty-state">
      <div class="empty-icon">
        <v-icon size="48" color="grey-lighten-1">mdi-chat-outline</v-icon>
      </div>
      <h2 class="empty-title">
        {{ hasThread ? "开始对话" : "选择或创建对话" }}
      </h2>
      <p class="empty-subtitle">
        {{
          hasThread
            ? "输入消息开始与 AI 交流"
            : '从左侧选择一个对话，或点击"新对话"开始'
        }}
      </p>
    </div>

    <template v-else>
      <MessageItem
        v-for="(message, index) in messages"
        :key="message.id"
        :message="message"
        :is-streaming="isStreaming && index === messages.length - 1"
      />
    </template>

    <transition name="fade">
      <button
        v-if="showScrollButton"
        class="scroll-to-bottom"
        @click="scrollToBottom"
      >
        <v-icon color="grey">mdi-arrow-down</v-icon>
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import type { Message } from "@/types/chat";
import MessageItem from "./MessageItem.vue";

const props = defineProps<{
  messages: Message[];
  isStreaming?: boolean;
  hasThread?: boolean;
}>();

const listRef = ref<HTMLElement | null>(null);
const isNearBottom = ref(true);
const showScrollButton = ref(false);
const SCROLL_THRESHOLD = 100;

function handleScroll() {
  if (!listRef.value) return;
  const { scrollTop, scrollHeight, clientHeight } = listRef.value;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  isNearBottom.value = distanceFromBottom < SCROLL_THRESHOLD;
  showScrollButton.value = !isNearBottom.value;
}

function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight;
      isNearBottom.value = true;
      showScrollButton.value = false;
    }
  });
}

function autoScrollIfNeeded() {
  if (isNearBottom.value) {
    scrollToBottom();
  }
}

watch(
  () => props.messages.length,
  (newLength, oldLength) => {
    if (newLength > (oldLength ?? 0)) {
      isNearBottom.value = true;
    }
    autoScrollIfNeeded();
  }
);

watch(
  () => props.messages[props.messages.length - 1]?.content,
  () => autoScrollIfNeeded()
);
</script>

<style scoped>
.message-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 8px 0;
}

.empty-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  margin: 0;
}

.v-theme--dark .empty-icon {
  background-color: rgba(255, 255, 255, 0.06);
}

.v-theme--dark .empty-title {
  color: rgba(255, 255, 255, 0.87);
}

.v-theme--dark .empty-subtitle {
  color: rgba(255, 255, 255, 0.5);
}

.scroll-to-bottom {
  position: sticky;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 50px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-surface));
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  transition: transform 0.2s, box-shadow 0.2s;
}

.scroll-to-bottom:hover {
  transform: translateX(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
