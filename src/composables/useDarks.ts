const DARK_KEY = 'vueuse-color-scheme'
const isDark = ref(false)

if (!import.meta.env.SSR) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = document.documentElement.classList.contains('dark')

  watch(isDark, (value) => {
    document.documentElement.classList.toggle('dark', value)
    localStorage.setItem(DARK_KEY, value === media.matches ? 'auto' : value ? 'dark' : 'light')
  })

  media.addEventListener('change', (event) => {
    const stored = localStorage.getItem(DARK_KEY)
    if (stored !== 'dark' && stored !== 'light')
      isDark.value = event.matches
  })
}

function toggleDark() {
  isDark.value = !isDark.value
}

export default () => ({ isDark, toggleDark })
