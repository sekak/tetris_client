'use strict'

const Player = require('./Player')
const { generatePieceSequence } = require('./Piece')
const {
  createGrid,
  isValidPosition,
  movePiece,
  rotatePiece,
  hardDrop,
  lockPiece,
  clearLines,
  addGarbageLines,
  getSpectrum,
  isGameOver,
  calculateScore,
  calculateLevel,
  calculateGravityDelay,
} = require('./logic')

/** How often (ms) the game loop fires. */
const TICK_RATE = 50

/**
 * Manages one game room: players, piece sequence, game state, and the loop.
 */
class Game {
  /**
   * @param {string} roomId
   * @param {import('socket.io').Server} io
   * @param {{ addScores: Function, getScores: Function }} [scoresStore]
   */
  constructor(roomId, io, scoresStore = null) {
    this.roomId = roomId
    this.io = io
    this.scoresStore = scoresStore

    /** @type {Map<string, Player>} */
    this.players = new Map()
    this.pieceSequence = []
    /** @type {'waiting'|'playing'|'finished'} */
    this.status = 'waiting'
    this._tickInterval = null
    this._seed = null
  }

  // ─── Player management ─────────────────────────────────────────────────────

  /**
   * Adds a player to the room. The first player automatically becomes host.
   * @param {string} socketId
   * @param {string} name
   * @returns {Player}
   */
  addPlayer(socketId, name) {
    if (this.players.has(socketId)) return this.players.get(socketId)
    const player = new Player(socketId, name)
    if (this.players.size === 0) player.isHost = true
    this.players.set(socketId, player)
    return player
  }

  /**
   * Removes a player from the room. If the host left, assigns a new one.
   * May trigger endGame() if only one (or zero) alive players remain.
   * @param {string} socketId
   * @returns {Player|null}
   */
  removePlayer(socketId) {
    const player = this.players.get(socketId)
    if (!player) return null

    this.players.delete(socketId)

    // Reassign host if needed
    if (player.isHost && this.players.size > 0) {
      this.players.values().next().value.isHost = true
    }

    // During a game, check if we should end it
    if (this.status === 'playing') {
      const alive = this._alivePlayers()
      if (alive.length <= 1) {
        this.endGame(alive[0] ?? null)
      }
    }

    return player
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  /**
   * Starts the game if the requesting player is host and the room is waiting.
   * @param {string} hostSocketId
   * @returns {boolean}  true if game was started
   */
  start(hostSocketId) {
    const host = this.players.get(hostSocketId)
    if (!host || !host.isHost) return false
    if (this.status !== 'waiting') return false
    if (this.players.size === 0) return false

    this._seed = Date.now()
    this.pieceSequence = generatePieceSequence(this._seed, 1000)
    this.status = 'playing'

    for (const player of this.players.values()) {
      this._resetPlayerState(player)
      player.alive = true
      player.spawnPiece(this.pieceSequence)
    }

    this._tickInterval = setInterval(() => this._tick(), TICK_RATE)
    return true
  }

  /**
   * Stops the game loop (does NOT change status — call reset() to reuse room).
   */
  stop() {
    if (this._tickInterval) {
      clearInterval(this._tickInterval)
      this._tickInterval = null
    }
  }

  /**
   * Resets the room back to 'waiting' state so a new game can begin.
   */
  reset() {
    this.stop()
    this.status = 'waiting'
    this.pieceSequence = []
    for (const player of this.players.values()) {
      this._resetPlayerState(player)
    }
  }

  /**
   * Ends the game, stops the loop, and emits `game_over`.
   * @param {Player|null} winner
   */
  endGame(winner) {
    if (this.status === 'finished') return
    this.stop()
    this.status = 'finished'
    this.io.to(this.roomId).emit('game_over', {
      winner: winner ? winner.toJSON() : null,
      players: [...this.players.values()].map((p) => p.toJSON()),
    })

    if (this.scoresStore) {
      const finishedAt = new Date().toISOString()
      const entries = [...this.players.values()].map((p) => ({
        name: p.name,
        score: p.score,
        level: p.level,
        linesCleared: p.linesCleared,
        // isWinner: !!(winner && winner.socketId === p.socketId),
        finishedAt,
      }))
      const updated = this.scoresStore.addScores(this.roomId, entries)
      this.io.to(this.roomId).emit('room_scores', { roomId: this.roomId, scores: updated })
    }
  }

  // ─── Input handlers ─────────────────────────────────────────────────────────

  /**
   * Handles a move input from a player.
   * @param {string} socketId
   * @param {'left'|'right'|'down'} direction
   */
  handleMove(socketId, direction) {
    const player = this.players.get(socketId)
    if (!player || !player.alive) return

    const dx = direction === 'left' ? -1 : direction === 'right' ? 1 : 0
    const dy = direction === 'down' ? 1 : 0

    const moved = movePiece(player.currentPiece, player.grid, dx, dy)
    if (moved) {
      player.currentPiece = moved
      if (direction === 'down') player.gravityTimer = 0
    } else if (direction === 'down') {
      // Manual down that can't move = lock immediately
      this._lockPlayerPiece(player)
    }
  }

  /**
   * Handles a rotate input from a player.
   * @param {string} socketId
   */
  handleRotate(socketId) {
    const player = this.players.get(socketId)
    if (!player || !player.alive) return
    player.currentPiece = rotatePiece(player.currentPiece, player.grid)
  }

  /**
   * Handles a hard-drop input from a player.
   * @param {string} socketId
   */
  handleDrop(socketId) {
    const player = this.players.get(socketId)
    if (!player || !player.alive) return
    player.currentPiece = hardDrop(player.currentPiece, player.grid)
    this._lockPlayerPiece(player)
  }

  // ─── Serialisation ──────────────────────────────────────────────────────────

  /**
   * Returns a serialisable snapshot of the full room state.
   */
  getState() {
    return {
      roomId: this.roomId,
      status: this.status,
      players: [...this.players.values()].map((p) => p.toJSON()),
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  _alivePlayers() {
    return [...this.players.values()].filter((p) => p.alive)
  }

  /** Full per-game state reset for a single player. */
  _resetPlayerState(player) {
    player.alive = false
    player.grid = createGrid()
    player.currentPiece = null
    player.nextPiece = null
    player.pieceIndex = 0
    player.score = 0
    player.level = 0
    player.linesCleared = 0
    player.gravityTimer = 0
    player.pendingGarbage = 0
    player.spectrum = new Array(10).fill(0)
  }

  /** Master game loop — fires every TICK_RATE ms. */
  _tick() {
    for (const player of this.players.values()) {
      if (!player.alive) continue
      player.gravityTimer += TICK_RATE
      if (player.gravityTimer >= calculateGravityDelay(player.level)) {
        player.gravityTimer = 0
        this._applyGravity(player)
      }
    }
    this._broadcastGameState()
  }

  _applyGravity(player) {
    const moved = movePiece(player.currentPiece, player.grid, 0, 1)
    if (moved) {
      player.currentPiece = moved
    } else {
      this._lockPlayerPiece(player)
    }
  }

  /**
   * Locks the current piece, clears lines, applies garbage, checks game-over,
   * and spawns the next piece.
   */
  _lockPlayerPiece(player) {
    // 1. Lock piece into grid
    player.grid = lockPiece(player.grid, player.currentPiece)

    // 2. Clear complete lines
    const { newGrid, linesCleared } = clearLines(player.grid)
    player.grid = newGrid

    // 3. Update score / level
    if (linesCleared > 0) {
      player.linesCleared += linesCleared
      player.score += calculateScore(linesCleared, player.level)
      player.level = calculateLevel(player.linesCleared)

      // 4. Send garbage to all other alive players (n-1 lines)
      const garbage = linesCleared - 1
      if (garbage > 0) {
        this._sendGarbageToOthers(player.socketId, garbage)
      }
    }

    // 5. Apply any pending garbage received from others
    if (player.pendingGarbage > 0) {
      player.grid = addGarbageLines(player.grid, player.pendingGarbage)
      player.pendingGarbage = 0
    }

    // 6. Update spectrum
    player.spectrum = getSpectrum(player.grid)

    // 7. Check game-over (stack reached top row)
    if (isGameOver(player.grid)) {
      this._eliminatePlayer(player)
      return
    }

    // 8. Spawn next piece
    player.spawnPiece(this.pieceSequence)

    // 9. Spawn-collision check (new piece immediately overlaps with blocks)
    if (
      !isValidPosition(
        player.grid,
        player.currentPiece.shape,
        player.currentPiece.x,
        player.currentPiece.y
      )
    ) {
      this._eliminatePlayer(player)
    }
  }

  _eliminatePlayer(player) {
    player.alive = false
    this.io.to(this.roomId).emit('player_game_over', {
      socketId: player.socketId,
      name: player.name,
    })
    this._checkWinner()
  }

  _sendGarbageToOthers(senderSocketId, count) {
    for (const player of this.players.values()) {
      if (player.socketId !== senderSocketId && player.alive) {
        player.pendingGarbage += count
      }
    }
  }

  _checkWinner() {
    const alive = this._alivePlayers()
    // Multiplayer: last survivor wins
    if (this.players.size > 1 && alive.length === 1) {
      this.endGame(alive[0])
      return
    }
    // Solo or everyone lost
    if (alive.length === 0) {
      this.endGame(null)
    }
  }

  _broadcastGameState() {
    this.io.to(this.roomId).emit('game_state', this.getState())
  }
}

module.exports = { Game, TICK_RATE }
