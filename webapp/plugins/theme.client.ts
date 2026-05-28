export default defineNuxtPlugin(() => {
  // Client-only plugin: initialize theme before hydration
  if (process.server) return

  try {
    const saved = localStorage.getItem('theme-preference')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  } catch (e) {
    // localStorage may be unavailable (private browsing). Fail silently.
    // eslint-disable-next-line no-console
    console.warn('Theme initialization error:', e)
  }
})
