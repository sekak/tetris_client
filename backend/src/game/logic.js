'use strict'

const GRID_ROWS = 20
const GRID_COLS = 10

// ─── Grid ────────────────────────────────────────────────────────────────────

/**
 * Creates an empty 20×10 grid (rows × cols), all zeros.
 * @returns {number[][]}
 */
function createGrid() {
  return Array.from({ length: GRID_ROWS }, () => new Array(GRID_COLS).fill(0))
}

// ─── Position / Collision ────────────────────────────────────────────────────

/**
 * Returns true if placing `shape` at grid position (x=col, y=row) is valid.
 * @param {number[][]} grid
 * @param {number[][]} shape
 * @param {number} x  column offset
 * @param {number} y  row offset
 * @returns {boolean}
 */
function isValidPosition(grid, shape, x, y) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 0) continue
      const gridRow = y + row
      const gridCol = x + col
      if (gridRow < 0 || gridRow >= GRID_ROWS) return false
      if (gridCol < 0 || gridCol >= GRID_COLS) return false
      if (grid[gridRow][gridCol] !== 0) return false
    }
  }
  return true
}

// ─── Rotation ────────────────────────────────────────────────────────────────

/**
 * Rotates a shape 90° clockwise.
 * Formula: rotated[col][rows-1-row] = original[row][col]
 * @param {number[][]} shape
 * @returns {number[][]}
 */
function rotatePieceShape(shape) {
  const rows = shape.length
  const cols = shape[0].length
  const rotated = Array.from({ length: cols }, () => new Array(rows).fill(0))
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rotated[col][rows - 1 - row] = shape[row][col]
    }
  }
  return rotated
}

/**
 * Attempts to rotate a piece CW, applying wall-kick offsets if needed.
 * Returns the piece with the new shape (and possibly adjusted x), or the
 * original piece if no valid rotation exists.
 * @param {{ shape: number[][], x: number, y: number }} piece
 * @param {number[][]} grid
 * @returns {typeof piece}
 */
function rotatePiece(piece, grid) {
  const rotated = rotatePieceShape(piece.shape)
  const kicks = [0, -1, 1, -2, 2]
  for (const dx of kicks) {
    if (isValidPosition(grid, rotated, piece.x + dx, piece.y)) {
      return { ...piece, shape: rotated, x: piece.x + dx }
    }
  }
  return piece // no valid rotation found
}

// ─── Movement ────────────────────────────────────────────────────────────────

/**
 * Moves a piece by (dx, dy). Returns the new piece position or null if blocked.
 * @param {{ shape: number[][], x: number, y: number }} piece
 * @param {number[][]} grid
 * @param {number} dx
 * @param {number} dy
 * @returns {typeof piece | null}
 */
function movePiece(piece, grid, dx, dy) {
  const newX = piece.x + dx
  const newY = piece.y + dy
  if (isValidPosition(grid, piece.shape, newX, newY)) {
    return { ...piece, x: newX, y: newY }
  }
  return null
}

/**
 * Hard-drops a piece as far down as possible. Returns new piece at final row.
 * @param {{ shape: number[][], x: number, y: number }} piece
 * @param {number[][]} grid
 * @returns {typeof piece}
 */
function hardDrop(piece, grid) {
  let y = piece.y
  while (isValidPosition(grid, piece.shape, piece.x, y + 1)) {
    y++
  }
  return { ...piece, y }
}

// ─── Locking & Line clearing ─────────────────────────────────────────────────

/**
 * Locks a piece into the grid. Returns a new grid (immutable).
 * @param {number[][]} grid
 * @param {{ shape: number[][], x: number, y: number }} piece
 * @returns {number[][]}
 */
function lockPiece(grid, piece) {
  const newGrid = grid.map((row) => [...row])
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] === 0) continue
      const gridRow = piece.y + row
      const gridCol = piece.x + col
      if (gridRow >= 0 && gridRow < GRID_ROWS && gridCol >= 0 && gridCol < GRID_COLS) {
        newGrid[gridRow][gridCol] = piece.shape[row][col]
      }
    }
  }
  return newGrid
}

/**
 * Clears completed lines (all cells non-zero). Returns the new grid and
 * the number of lines cleared.
 * @param {number[][]} grid
 * @returns {{ newGrid: number[][], linesCleared: number }}
 */
function clearLines(grid) {
  const remaining = grid.filter((row) => row.some((cell) => cell === 0))
  const linesCleared = GRID_ROWS - remaining.length
  const emptyRows = Array.from({ length: linesCleared }, () => new Array(GRID_COLS).fill(0))
  return { newGrid: [...emptyRows, ...remaining], linesCleared }
}

// ─── Garbage lines ───────────────────────────────────────────────────────────

/**
 * Appends `count` garbage rows at the bottom (each with one random hole).
 * The top `count` rows of the grid are discarded.
 * @param {number[][]} grid
 * @param {number} count
 * @returns {number[][]}
 */
function addGarbageLines(grid, count) {
  if (count <= 0) return grid
  const garbage = Array.from({ length: count }, () => {
    const row = new Array(GRID_COLS).fill(8) // 8 = garbage cell
    row[Math.floor(Math.random() * GRID_COLS)] = 0 // one hole per row
    return row
  })
  return [...grid.slice(count), ...garbage]
}

// ─── Spectrum ────────────────────────────────────────────────────────────────

/**
 * Returns an array of 10 column heights (distance from the top of topmost
 * block in each column to the bottom of the grid).
 * @param {number[][]} grid
 * @returns {number[]}
 */
function getSpectrum(grid) {
  return Array.from({ length: GRID_COLS }, (_, col) => {
    for (let row = 0; row < GRID_ROWS; row++) {
      if (grid[row][col] !== 0) return GRID_ROWS - row
    }
    return 0
  })
}

// ─── Game-over check ─────────────────────────────────────────────────────────

/**
 * Returns true if any cell in the top row is filled (the stack has reached
 * the top of the grid).
 * @param {number[][]} grid
 * @returns {boolean}
 */
function isGameOver(grid) {
  return grid[0].some((cell) => cell !== 0)
}

// ─── Scoring helpers ─────────────────────────────────────────────────────────

/**
 * Points awarded for clearing `linesCleared` lines at `level` (0-based).
 * @param {number} linesCleared
 * @param {number} level
 * @returns {number}
 */
function calculateScore(linesCleared, level) {
  const base = [0, 100, 300, 500, 800]
  return (base[linesCleared] ?? 0) * (level + 1)
}

/**
 * Level is incremented every 10 lines cleared.
 * @param {number} totalLines
 * @returns {number}
 */
function calculateLevel(totalLines) {
  return Math.floor(totalLines / 10)
}

/**
 * Returns the gravity delay (ms between automatic drops) for a given level.
 * @param {number} level
 * @param {'normal'|'fast'} [mode='normal']
 * @returns {number}
 */
function calculateGravityDelay(level, mode = 'normal') {
  const normalDelays = [800, 720, 630, 550, 470, 380, 300, 215, 130, 100, 80]
  const fastDelays   = [255, 230, 210, 185, 155, 130, 110, 85,  55,  30,  10]
  const table = mode === 'fast' ? fastDelays : normalDelays
  return table[Math.min(level, table.length - 1)]
}

module.exports = {
  GRID_ROWS,
  GRID_COLS,
  createGrid,
  isValidPosition,
  rotatePieceShape,
  rotatePiece,
  movePiece,
  hardDrop,
  lockPiece,
  clearLines,
  addGarbageLines,
  getSpectrum,
  isGameOver,
  calculateScore,
  calculateLevel,
  calculateGravityDelay,
}
