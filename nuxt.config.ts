export default defineNuxtConfig({
  compatibilityDate: '2024-11-27',
  app: {
    head: {
      title: 'Dofus Puzzles',
      meta: [
        {
          name: 'description',
          content: 'Dofus Puzzles entraîne votre placement tactique : trouvez le meilleur déplacement pour placer un ennemi dans votre ligne de mire.',
        },
      ],
      htmlAttrs: {
        lang: 'fr',
      },
    },
  },
  devtools: { enabled: true },
  ssr: false,
  typescript: {
    typeCheck: true,
  },
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint'
  ],
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4
  },
});