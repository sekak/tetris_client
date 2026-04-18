'use strict'

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const setupGameHandlers = require('./sockets/gameHandler')

const PORT = process.env.PORT || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

// ─── Express ──────────────────────────────────────────────────────────────────
const app = express()
app.use(cors({ origin: CLIENT_ORIGIN }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ─── HTTP + Socket.IO ─────────────────────────────────────────────────────────
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
})

// Shared room registry: roomId → Game
const rooms = new Map()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  setupGameHandlers(io, socket, rooms)
})

// ─── Start ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[red-tetris] server listening on http://localhost:${PORT}`)
})

module.exports = { app, httpServer, io }
