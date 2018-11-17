require('dotenv').config()
const pkg = require('./package')

module.exports = {
  mode: 'spa',

  server: {
    port: process.env.SERVER_PORT,
    host: process.env.SERVER_HOST,
  },

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' },
    ],
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [
    'vuetify/dist/vuetify.min.css',
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/vuetify',
    '~/plugins/socket.io.js',
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/dotenv',
    '@nuxtjs/axios',
    '@nuxtjs/auth',
  ],

  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  auth: {
    redirect: {
      login: '/',
      logout: '/',
      callback: '/callback',
      home: '/controller',
    },
    strategies: {
      discord: {
        _scheme: 'oauth2',
        authorization_endpoint: 'https://discordapp.com/oauth2/authorize',
        userinfo_endpoint: 'https://discordapp.com/api/v6/users/@me',
        scope: ['identify'],
        response_type: 'token',
        token_type: 'Bearer',
        redirect_uri: process.env.CALLBACK_URL,
        client_id: process.env.CLIENT_ID,
      },
    },
  },


  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        })
      }
    },
  },
}
