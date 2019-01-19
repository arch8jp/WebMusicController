const { parsed: env } = require('dotenv').load()
const express = require('express')
const socket = require('socket.io-client')(env.BOT_SERVER)
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const host = process.env.SERVER_HOST || '127.0.0.1'
const port = process.env.SERVER_PORT || 3000

const search = require('./search')

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
    socket.on('socketid', ({ socketid, emit, data }) => {
      io.sockets.socket(socketid).emit(emit, data)
    })
    socket.on('room', ({ room, emit, data, selfExclude }) => {
      if (selfExclude) {
        socket.broadcast.to(room).emit(emit, data)
      } else {
        socket.to(room).emit(emit, data)
      }
    })

    client.on('status', data =>
      socket.emit('status', { socketid: client.id, data })
    )
    client.on('init', data =>
      socket.emit('init', { socketid: client.id, data })
    )
    client.on('q', q =>
      search(q)
        .then(data => client.emit('result', data))
        .catch(error => client.emit('err', error))
    )
    client.on('add', data => socket.emit('add', { socketid: client.id, data }))
    client.on('remove', data =>
      socket.emit('remove', { socketid: client.id, data })
    )
    client.on('volume', data =>
      socket.emit('volume', { socketid: client.id, data })
    )
    client.on('repeat', data =>
      socket.emit('repeat', { socketid: client.id, data })
    )
    client.on('skip', id => socket.emit('skip', { socketid: client.id, id }))
  })
}

process.on('unhandledRejection', err => console.log(err))
process.on('uncaughtException', err => console.log(err))
start()
