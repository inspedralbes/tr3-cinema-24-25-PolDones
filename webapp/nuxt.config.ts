// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@vueuse/nuxt'],
  runtimeConfig: {
    // @ts-ignore
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:3001',
    public: {
      // @ts-ignore
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
    }
  }
})
