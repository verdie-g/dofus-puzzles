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
      script: [
        {
          src: 'https://cloud.umami.is/script.js',
          defer: true,
          'data-website-id': '19ae7c03-6f5a-4635-8e3b-730e7fc36e5d',
        },
      ],
    },
  },
  devtools: { enabled: true },
  ssr: false,
  typescript: {
    typeCheck: true,
    tsConfig: {
      include: ['types']
    }
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