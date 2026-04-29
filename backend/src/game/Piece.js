'use strict'

// ─── Piece definitions ───────────────────────────────────────────────────────
// Each piece encodes its cells as non-zero integers (= the piece type id).
// Spawn positions are centred horizontally on the 10-wide grid.

const PIECE_TYPES = [
  {
    id: 1,
    color: 'I',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    id: 2,
    color: 'O',
    shape: [
      [2, 2],
      [2, 2],
    ],
  },
  {
    id: 3,
    color: 'T',
    shape: [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0],
    ],
  },
  {
    id: 4,
    color: 'S',
    shape: [
      [0, 4, 4],
      [4, 4, 0],
      [0, 0, 0],
    ],
  },
  {
    id: 5,
    color: 'Z',
    shape: [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0],
    ],
  },
  {
    id: 6,
    color: 'J',
    shape: [
      [6, 0, 0],
      [6, 6, 6],
      [0, 0, 0],
    ],
  },
  {
    id: 7,
    color: 'L',
    shape: [
      [0, 0, 7],
      [7, 7, 7],
      [0, 0, 0],
    ],
  },
]

const GRID_COLS = 10

/**
 * Creates a piece object for the given type index (0-6).
 * The piece is centred horizontally and placed at the top of the grid.
 * @param {number} typeIndex  0-based index into PIECE_TYPES
 * @returns {{ id: number, color: string, shape: number[][], x: number, y: number }}
 */
function createPiece(typeIndex) {
  const type = PIECE_TYPES[typeIndex % PIECE_TYPES.length]
  const shape = type.shape.map((row) => [...row])
  const x = Math.floor((GRID_COLS - shape[0].length) / 2)
  return { id: type.id, color: type.color, shape, x, y: 0 }
}

// ─── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────

/**
 * Returns a seeded pseudo-random number generator (0 ≤ n < 1).
 * Using mulberry32 — fast, good distribution.
 * @param {number} seed  32-bit integer seed
 * @returns {() => number}
 */
function mulberry32(seed) {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generates a sequence of piece-type indices using a seeded PRNG so that
 * every player in the same room receives identical pieces.
 * @param {number} seed
 * @param {number} [length=1000]
 * @returns {number[]}
 */
function generatePieceSequence(seed, length = 1000) {
  const rng = mulberry32(seed)
  return Array.from({ length }, () => Math.floor(rng() * PIECE_TYPES.length))
}

module.exports = { PIECE_TYPES, createPiece, mulberry32, generatePieceSequence }
