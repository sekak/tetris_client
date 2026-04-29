'use strict'

const { createGrid } = require('./logic')
const { createPiece } = require('./Piece')

/**
 * Represents a single connected player.
 * Holds all per-player mutable state during a game session.
 */
class Player {
  /**
   * @param {string} socketId
   * @param {string} name
   */
  constructor(socketId, name) {
    this.socketId = socketId
    this.name = name

    // Room meta
    this.isHost = false

    // Per-game state (reset on each new game)
    this.alive = false
    this.grid = createGrid()
    this.currentPiece = null
    this.nextPiece = null
    this.pieceIndex = 0
    this.score = 0
    this.level = 0
    this.linesCleared = 0
    this.pendingGarbage = 0
    this.gravityTimer = 0 // ms elapsed since last automatic drop

    // Spectrum sent to other players
    this.spectrum = new Array(10).fill(0)
  }

  /**
   * Draws the next piece from the shared sequence. Both currentPiece and
   * nextPiece are maintained so the client can display a "next piece" preview.
   * @param {number[]} pieceSequence  shared sequence of piece-type indices
   */
  spawnPiece(pieceSequence) {
    const len = pieceSequence.length
    if (this.nextPiece === null) {
      // First spawn: assign both slots
      this.currentPiece = createPiece(pieceSequence[this.pieceIndex++ % len])
      this.nextPiece = createPiece(pieceSequence[this.pieceIndex++ % len])
    } else {
      // Subsequent spawns: advance the window
      this.currentPiece = this.nextPiece
      this.nextPiece = createPiece(pieceSequence[this.pieceIndex++ % len])
    }
  }

  /**
   * Returns a serialisable snapshot of this player (safe to send over WS).
   */
  toJSON() {
    return {
      socketId: this.socketId,
      name: this.name,
      isHost: this.isHost,
      alive: this.alive,
      grid: this.grid,
      currentPiece: this.currentPiece,
      nextPiece: this.nextPiece,
      score: this.score,
      level: this.level,
      linesCleared: this.linesCleared,
      spectrum: this.spectrum,
    }
  }
}

module.exports = Player
