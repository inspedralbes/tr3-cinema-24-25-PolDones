<template>
  <button
    class="theme-toggle"
    :aria-label="ariaLabel"
    :aria-pressed="isDarkMode"
    @click="toggleTheme"
  >
    <span class="toggle-track" :class="{ on: isDarkMode }"></span>
    <span class="toggle-knob" :class="{ on: isDarkMode }"></span>
    <span class="icon icon-sun" aria-hidden="true">☀️</span>
    <span class="icon icon-moon" aria-hidden="true">🌙</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const isDarkMode = ref(false)
const isLoading = ref(true)

const ariaLabel = computed(() => `Switch to ${isDarkMode.value ? 'light' : 'dark'} mode`)

onMounted(() => {
  // Initialize from document class (plugin should have applied it) or localStorage fallback
  try {
    isDarkMode.value = document.documentElement.classList.contains('dark-mode')
  } catch (e) {
    // ignore
    isDarkMode.value = false
  }
  isLoading.value = false
})

function toggleTheme() {
  if (isLoading.value) return
  isLoading.value = true
  isDarkMode.value = !isDarkMode.value
  updateTheme()
  // match animation duration
  setTimeout(() => {
    isLoading.value = false
  }, 400)
}

function updateTheme() {
  const html = document.documentElement
  if (isDarkMode.value) html.classList.add('dark-mode')
  else html.classList.remove('dark-mode')

  try {
    localStorage.setItem('theme-preference', isDarkMode.value ? 'dark' : 'light')
  } catch (e) {
    // localStorage unavailable; fail silently
    // eslint-disable-next-line no-console
    console.warn('Failed to save theme preference:', e)
  }
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  z-index: 1100;
  width: 96px;
  height: 48px;
  border-radius: 9999px;
  background: var(--surface);
  display: inline-block;
  border: none;
  padding: 4px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.5);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.theme-toggle:focus {
  outline: 2px solid rgba(59,130,246,0.6);
  outline-offset: 2px;
}
.toggle-track {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: linear-gradient(135deg, #e5e7eb, #c7d2fe);
  transition: background-color 0.35s cubic-bezier(0.4,0,0.2,1);
}
.toggle-track.on {
  background: linear-gradient(135deg, #374151, #1f2937);
}
.toggle-knob {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background: white;
  box-shadow: 0 6px 16px rgba(0,0,0,0.6);
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
}
.toggle-knob.on {
  transform: translateX(48px);
}
.icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
}
.icon-sun { left: 12px; }
.icon-moon { right: 12px; }

@media (prefers-reduced-motion: reduce) {
  .toggle-knob, .toggle-track { transition: none !important; }
}
</style>
