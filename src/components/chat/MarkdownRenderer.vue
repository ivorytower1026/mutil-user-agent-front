<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

const renderer = new marked.Renderer()

renderer.code = function({ text, lang }: { text: string; lang?: string }) {
  let highlighted: string
  if (lang && hljs.getLanguage(lang)) {
    try {
      highlighted = hljs.highlight(text, { language: lang }).value
    } catch {
      highlighted = hljs.highlightAuto(text).value
    }
  } else {
    highlighted = hljs.highlightAuto(text).value
  }
  return `<pre><code class="hljs">${highlighted}</code></pre>`
}

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true
})

const renderedContent = computed(() => {
  if (!props.content || typeof props.content !== 'string') return ''
  try {
    return marked.parse(props.content) as string
  } catch {
    return props.content
  }
})
</script>

<style>
.markdown-content {
  line-height: 1.6;
}

.markdown-content pre {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  margin: 8px 0;
}

.markdown-content code {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

.markdown-content p code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 24px;
  margin: 8px 0;
}

.markdown-content blockquote {
  border-left: 4px solid rgba(0, 0, 0, 0.2);
  padding-left: 16px;
  margin: 8px 0;
  color: rgba(0, 0, 0, 0.6);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4 {
  margin: 16px 0 8px 0;
  font-weight: 600;
}

.markdown-content h1 { font-size: 1.5em; }
.markdown-content h2 { font-size: 1.3em; }
.markdown-content h3 { font-size: 1.1em; }

.markdown-content a {
  color: #1976D2;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content table {
  border-collapse: collapse;
  margin: 8px 0;
  width: 100%;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px;
  text-align: left;
}

.markdown-content th {
  background-color: rgba(0, 0, 0, 0.05);
}

.v-theme--dark .markdown-content pre,
.v-theme--dark .markdown-content p code {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .markdown-content blockquote {
  border-left-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
}

.v-theme--dark .markdown-content th {
  background-color: rgba(255, 255, 255, 0.05);
}

.v-theme--dark .markdown-content th,
.v-theme--dark .markdown-content td {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
