const { parsed: env } = require('dotenv').load()
const express = require('express')
const socket = require('socket.io-client')(env.BOT_SERVER)
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const host = process.env.SERVER_HOST || '127.0.0.1'
const port = process.env.SERVER_PORT || 3000

app.set('port', port)

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  const http = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  })
  const io = require('socket.io').listen(http)
  io.on('connection', client => {
    socket.on('err', data => client.emit('err', data))
    socket.on('status', data => client.emit('status', data))
    socket.on('volume', data => client.emit('volume', data))
    socket.on('repeat', data => client.emit('repeat', data))
    socket.on('list', data => client.emit('list', data))
    socket.on('ready', data => client.emit('ready', data))
    socket.on('result', data => client.emit('result', data))

    client.on('status', data => socket.emit('status', data))
    client.on('init', data => socket.emit('init', data))
    client.on('q', q => socket.emit('q', q))
    client.on('add', data => socket.emit('add', data))
    client.on('remove', data => socket.emit('remove', data))
    client.on('volume', data => socket.emit('volume', data))
    client.on('repeat', data => socket.emit('repeat', data))
    client.on('skip', id => socket.emit('skip', id))
  })
}

process.on('unhandledRejection', err => console.log(err))
process.on('uncaughtException', err => console.log(err))
start()
