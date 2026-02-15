import { ref } from 'vue'

const show = ref(false)
const message = ref('')
const color = ref<'success' | 'error' | 'warning' | 'info'>('success')

export function useNotification() {
  function notify(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    message.value = msg
    color.value = type
    show.value = true
  }

  function success(msg: string) {
    notify(msg, 'success')
  }

  function error(msg: string) {
    notify(msg, 'error')
  }

  function warning(msg: string) {
    notify(msg, 'warning')
  }

  function info(msg: string) {
    notify(msg, 'info')
  }

  function close() {
    show.value = false
  }

  return {
    show,
    message,
    color,
    notify,
    success,
    error,
    warning,
    info,
    close
  }
}
