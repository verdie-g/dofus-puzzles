export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  typescript: {
    typeCheck: true,
  },
  modules: ['@nuxt/ui'],
  css: [
    '@/assets/css/main.css',
  ],
})