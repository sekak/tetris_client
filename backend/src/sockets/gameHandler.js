'use strict'

const { Game } = require('../game/Game')

/**
 * Registers all socket event handlers for one connected client.
 *
 * @param {import('socket.io').Server} io   - the socket.io server instance
 * @param {import('socket.io').Socket} socket - the individual client socket
 * @param {Map<string, Game>} rooms          - shared room registry
 */
function setupGameHandlers(io, socket, rooms, scoresStore = null) {
  // ─── Helper: get the game the socket currently belongs to ─────────────────
  const currentGame = () => rooms.get(socket.gameRoomId)

  // ─── join_room ────────────────────────────────────────────────────────────
  // Payload: { roomId: string, playerName: string }
  socket.on('join_room', ({ roomId, playerName } = {}) => {
    if (!roomId || !playerName) {
      socket.emit('error', { message: 'roomId and playerName are required' })
      return
    }

    // Sanitise inputs
    const safeRoomId = String(roomId).slice(0, 64)
    const safeName = String(playerName).slice(0, 32)

    // Create room on first join
    if (!rooms.has(safeRoomId)) {
      rooms.set(safeRoomId, new Game(safeRoomId, io, scoresStore))
    }

    const game = rooms.get(safeRoomId)

    // A player with this name already exists in the room.
    const existing = [...game.players.values()].find((p) => p.name === safeName)
    if (existing) {
      const sameSocket = existing.socketId === socket.id
      const isPostGameReconnect = game.status === 'finished'

      if (!sameSocket && !isPostGameReconnect) {
        socket.emit('join_error', { message: 'Ce pseudo est déjà pris dans cette room' })
        return
      }

      if (!sameSocket) {
        game.players.delete(existing.socketId)
        existing.socketId = socket.id
        game.players.set(socket.id, existing)
      }
      socket.join(safeRoomId)
      socket.gameRoomId = safeRoomId
      socket.emit('room_joined', {
        roomId: safeRoomId,
        player: existing.toJSON(),
        players: [...game.players.values()].map((p) => p.toJSON()),
        mode: game.mode,
      })
      return
    }

    // Block late joins for new players
    if (game.status !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' })
      return
    }

    const player = game.addPlayer(socket.id, safeName)
    socket.join(safeRoomId)
    socket.gameRoomId = safeRoomId

    // Confirm to the joining player
    socket.emit('room_joined', {
      roomId: safeRoomId,
      player: player.toJSON(),
      players: [...game.players.values()].map((p) => p.toJSON()),
      mode: game.mode,
    })

    // Notify others in the room
    socket.to(safeRoomId).emit('player_joined', { player: player.toJSON() })
  })

  // ─── start_game ───────────────────────────────────────────────────────────
  // Only the host may start the game.
  socket.on('start_game', () => {
    const game = currentGame()
    if (!game) return

    if (!game.start(socket.id)) {
      socket.emit('error', { message: 'Only the host can start the game' })
      return
    }

    io.to(socket.gameRoomId).emit('game_started', {
      players: [...game.players.values()].map((p) => p.toJSON()),
    })
  })

  // ─── set_mode ─────────────────────────────────────────────────────────────
  // Only the host may change the game mode, and only while waiting.
  // Payload: { mode: 'normal'|'fast' }
  socket.on('set_mode', ({ mode } = {}) => {
    const game = currentGame()
    if (!game) return
    if (!game.setMode(socket.id, mode)) {
      socket.emit('error', { message: 'Cannot set mode' })
    }
  })

  // ─── move ─────────────────────────────────────────────────────────────────
  // Payload: { direction: 'left'|'right'|'down' }
  socket.on('move', ({ direction } = {}) => {
    const game = currentGame()
    if (!game || game.status !== 'playing') return
    if (!['left', 'right', 'down'].includes(direction)) return
    game.handleMove(socket.id, direction)
  })

  // ─── rotate ───────────────────────────────────────────────────────────────
  socket.on('rotate', () => {
    const game = currentGame()
    if (!game || game.status !== 'playing') return
    game.handleRotate(socket.id)
  })

  // ─── drop (hard drop) ─────────────────────────────────────────────────────
  socket.on('drop', () => {
    const game = currentGame()
    if (!game || game.status !== 'playing') return
    game.handleDrop(socket.id)
  })

  // ─── restart_game ─────────────────────────────────────────────────────────
  // Only the host may restart after a game is finished.
  socket.on('restart_game', () => {
    const game = currentGame()
    if (!game) return
    if (game.status !== 'finished') return

    const player = game.players.get(socket.id)
    if (!player || !player.isHost) {
      socket.emit('error', { message: 'Only the host can restart the game' })
      return
    }

    game.reset()
    io.to(socket.gameRoomId).emit('game_reset', {
      players: [...game.players.values()].map((p) => p.toJSON()),
    })
  })

  // ─── get_scores ───────────────────────────────────────────────────────────
  // Payload: { roomId, scores }
  socket.on('get_scores', ({ roomId, scores } = {}) => {
    if (!roomId || !scoresStore) {
      socket.emit('room_scores', { roomId: roomId || null, scores: [] })
      return
    }
    const safeRoomId = String(roomId).slice(0, 64)
    socket.emit('room_scores', {
      roomId: safeRoomId,
      scores: scoresStore.getScores(safeRoomId),
    })
  })

  // check is room id valid or not
  socket.on('check_room', ({ roomId } = {}) => {
    if (!roomId) {
      socket.emit('check_room', { exists: false, error: 'roomId is required' })
      return
    }
    const exists = rooms.has(String(roomId).slice(0, 64))
    socket.emit('check_room', {
      exists,
      error: exists ? null : 'Room not found',
    })
  })

  // ─── disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)

    const game = currentGame()
    if (!game) return

    // After a finished game, keep the player in the room so they can reconnect
    // (HMR / network blip) and still trigger restart by name re-bind.
    if (game.status === 'finished') return

    const player = game.removePlayer(socket.id)
    if (!player) return

    const newHost = [...game.players.values()].find((p) => p.isHost) ?? null

    io.to(socket.gameRoomId).emit('player_left', {
      socketId: socket.id,
      name: player.name,
      newHost: newHost ? newHost.toJSON() : null,
    })

    // Clean up empty rooms
    if (game.players.size === 0) {
      game.stop()
      rooms.delete(socket.gameRoomId)
    }
  })
}

module.exports = setupGameHandlers
