<template>
  <div class="markdown-content" v-html="renderedContent" ref="contentRef"></div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUpdated } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { useNotification } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  content: string
}>()

const contentRef = ref<HTMLElement>()
const notification = useNotification()
const authStore = useAuthStore()

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
  
  const escapedCode = text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  return `
    <div class="code-block-wrapper">
      <div class="code-header">
        <span class="code-language">${lang || 'code'}</span>
        <button class="code-copy-btn" data-code="${escapedCode}">
          <span class="copy-icon">📋</span>
          <span class="copy-text">复制</span>
        </button>
      </div>
      <pre><code class="hljs">${highlighted}</code></pre>
    </div>
  `
}

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true
})

function preprocessWorkspacePaths(content: string): string {
  const patterns = [
    /`\/workspace\/([^`]+)`/g,
    /`\*\*位置：\*\*` `\/workspace\/([^`]+)`/g,
    /\/workspace\/([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/g
  ]
  
  let result = content
  
  for (const pattern of patterns) {
    result = result.replace(pattern, (fullMatch, filePath) => {
      const cleanPath = filePath.replace(/[`*]/g, '').trim()
      if (!cleanPath.includes('.')) return fullMatch
      const fileName = cleanPath.split('/').pop() || cleanPath
      return `[📥 点击下载 ${fileName}](/dav/${cleanPath})`
    })
  }
  
  return result
}

const renderedContent = computed(() => {
  if (!props.content || typeof props.content !== 'string') return ''
  try {
    const processed = preprocessWorkspacePaths(props.content)
    return marked.parse(processed) as string
  } catch {
    return props.content
  }
})

function attachCopyListeners() {
  if (!contentRef.value) return
  
  const copyButtons = contentRef.value.querySelectorAll('.code-copy-btn')
  copyButtons.forEach((btn) => {
    btn.removeEventListener('click', handleCodeCopy)
    btn.addEventListener('click', handleCodeCopy)
  })

  const downloadLinks = contentRef.value.querySelectorAll('a[href^="/dav/"]')
  downloadLinks.forEach((link) => {
    link.removeEventListener('click', handleDownloadLink)
    link.addEventListener('click', handleDownloadLink)
  })
}

async function handleDownloadLink(event: Event) {
  event.preventDefault()
  const link = event.currentTarget as HTMLAnchorElement
  const href = link.getAttribute('href')
  
  if (!href || !href.startsWith('/dav/')) return
  
  const fileName = decodeURIComponent(href.split('/').pop() || 'download')
  
  try {
    const response = await fetch(href, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    notification.success(`文件 ${fileName} 下载成功`)
  } catch (error) {
    notification.error(`下载失败: ${error}`)
    console.error('Download failed:', error)
  } finally {
    link.classList.remove('downloading')
    link.textContent = `📥 下载 ${fileName}`
  }
}

async function handleCodeCopy(event: Event) {
  const button = event.currentTarget as HTMLButtonElement
  const code = button.getAttribute('data-code')
  
  if (!code) return
  
  try {
    await navigator.clipboard.writeText(code)
    
    const iconSpan = button.querySelector('.copy-icon')
    const textSpan = button.querySelector('.copy-text')
    
    if (iconSpan) iconSpan.textContent = '✓'
    if (textSpan) textSpan.textContent = '已复制'
    
    notification.success('代码已复制到剪贴板')
    
    setTimeout(() => {
      if (iconSpan) iconSpan.textContent = '📋'
      if (textSpan) textSpan.textContent = '复制'
    }, 2000)
  } catch (error) {
    notification.error('复制失败，请手动选择复制')
    console.error('Copy failed:', error)
  }
}

onMounted(() => {
  attachCopyListeners()
})

onUpdated(() => {
  attachCopyListeners()
})
</script>

<style>
.markdown-content {
  line-height: 1.6;
}

.markdown-content .code-block-wrapper {
  position: relative;
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.05);
}

.markdown-content .code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.markdown-content .code-language {
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.markdown-content .code-copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  transition: all 0.2s;
}

.markdown-content .code-copy-btn:hover {
  background-color: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.87);
}

.markdown-content .code-copy-btn .copy-icon {
  font-size: 14px;
}

.markdown-content pre {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
}

.markdown-content pre code {
  display: block;
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

.markdown-content a[href^="/dav/"] {
  color: #1976D2;
  font-weight: 500;
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

.v-theme--dark .markdown-content .code-block-wrapper {
  background-color: rgba(255, 255, 255, 0.05);
}

.v-theme--dark .markdown-content .code-header {
  background-color: rgba(255, 255, 255, 0.08);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .markdown-content .code-language {
  color: rgba(255, 255, 255, 0.7);
}

.v-theme--dark .markdown-content .code-copy-btn {
  color: rgba(255, 255, 255, 0.7);
}

.v-theme--dark .markdown-content .code-copy-btn:hover {
  background-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.95);
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
