import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'

const THEME_KEY = 'app-theme'

export function useAppTheme() {
  const theme = useTheme()

  const isDark = computed(() => theme.global.current.value.dark)

  function toggleTheme() {
    const newTheme = isDark.value ? 'light' : 'dark'
    theme.global.name.value = newTheme
    localStorage.setItem(THEME_KEY, newTheme)
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved && (saved === 'light' || saved === 'dark')) {
      theme.global.name.value = saved
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.global.name.value = prefersDark ? 'dark' : 'light'
    }
  }

  onMounted(() => {
    initTheme()
  })

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
