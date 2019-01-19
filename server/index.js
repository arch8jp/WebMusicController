const { parsed: env } = require('dotenv').load()
const express = require('express')
const client = require('socket.io-client')(env.BOT_SERVER)
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
  io.on('connection', socket => {
    client.on('socketid', ({ socketid, emit, data }) => {
      io.to(socketid).emit(emit, data)
    })
    client.on('room', ({ room, emit, data, selfExclude }) => {
      if (selfExclude) {
        socket.broadcast.to(room).emit(emit, data)
      } else {
        socket.to(room).emit(emit, data)
      }
    })

    socket.on('status', data =>
      client.emit('status', { socketid: socket.id, data })
    )
    socket.on('init', data =>
      client.emit('init', { socketid: socket.id, data })
    )
    socket.on('q', q =>
      search(q)
        .then(data => socket.emit('result', data))
        .catch(error => socket.emit('err', error))
    )
    socket.on('add', data => client.emit('add', { socketid: socket.id, data }))
    socket.on('remove', data =>
      client.emit('remove', { socketid: socket.id, data })
    )
    socket.on('volume', data =>
      client.emit('volume', { socketid: socket.id, data })
    )
    socket.on('repeat', data =>
      client.emit('repeat', { socketid: socket.id, data })
    )
    socket.on('skip', id => client.emit('skip', { socketid: socket.id, id }))
  })
}

process.on('unhandledRejection', err => console.log(err))
process.on('uncaughtException', err => console.log(err))
start()
