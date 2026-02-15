import { ref } from 'vue'

export function useResizable(options: {
  initialWidth: number
  minWidth: number
  maxWidth: number
  direction?: 'left' | 'right'
  cssVarName?: string
}) {
  const { 
    initialWidth, 
    minWidth, 
    maxWidth, 
    direction = 'right',
    cssVarName 
  } = options
  
  const width = ref(initialWidth)
  const isResizing = ref(false)

  if (cssVarName) {
    document.documentElement.style.setProperty(cssVarName, initialWidth + 'px')
  }

  function startResize(event: MouseEvent, element?: HTMLElement) {
    event.preventDefault()
    isResizing.value = true
    const startX = event.clientX
    const startWidth = width.value

    function handleMouseMove(e: MouseEvent) {
      const delta = direction === 'right' 
        ? e.clientX - startX 
        : startX - e.clientX
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta))
      
      width.value = newWidth
      
      if (element) {
        element.style.width = newWidth + 'px'
      }
      
      if (cssVarName) {
        document.documentElement.style.setProperty(cssVarName, newWidth + 'px')
      }
    }

    function handleMouseUp() {
      isResizing.value = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return {
    width,
    isResizing,
    startResize
  }
}
