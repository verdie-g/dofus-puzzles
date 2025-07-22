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
        {
          property: 'og:image',
          content: 'https://repository-images.githubusercontent.com/1014005458/b310e68e-c3cd-48f2-ac1b-22252cc1009b',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon-96x96.png',
          sizes: '96x96',
        },
        {
            rel: 'shortcut icon',
            href: '/favicon.ico',
        },
      ],
      script: [
        {
          src: 'https://cloud.umami.is/script.js',
          defer: true,
          'data-website-id': '55c64c6b-9dcd-4e53-bb9c-dac866675ab4',
          'data-domains': 'dofuspuzzles.com',
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
    '@nuxt/eslint',
    '@nuxtjs/i18n',
  ],
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4
  },
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
    ],
    strategy: 'no_prefix',
  },
});