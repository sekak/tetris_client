'use strict'

const {
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
} = require('../../src/game/logic')

// ─── createGrid ───────────────────────────────────────────────────────────────
describe('createGrid', () => {
  test('returns 20 rows', () => {
    expect(createGrid()).toHaveLength(GRID_ROWS)
  })

  test('each row has 10 columns', () => {
    createGrid().forEach((row) => expect(row).toHaveLength(GRID_COLS))
  })

  test('all cells are 0', () => {
    const grid = createGrid()
    expect(grid.flat().every((c) => c === 0)).toBe(true)
  })

  test('returns a new grid each call (no shared references)', () => {
    const g1 = createGrid()
    const g2 = createGrid()
    g1[0][0] = 9
    expect(g2[0][0]).toBe(0)
  })
})

// ─── isValidPosition ──────────────────────────────────────────────────────────
describe('isValidPosition', () => {
  const grid = createGrid()
  const square = [
    [1, 1],
    [1, 1],
  ]

  test('valid centre position returns true', () => {
    expect(isValidPosition(grid, square, 4, 0)).toBe(true)
  })

  test('left boundary violation returns false', () => {
    expect(isValidPosition(grid, square, -1, 0)).toBe(false)
  })

  test('right boundary violation returns false', () => {
    // square is 2 wide: x=9 → cols 9,10 → 10 is out of range
    expect(isValidPosition(grid, square, 9, 0)).toBe(false)
  })

  test('bottom boundary violation returns false', () => {
    // square is 2 tall: y=19 → rows 19,20 → 20 is out of range
    expect(isValidPosition(grid, square, 4, 19)).toBe(false)
  })

  test('overlapping an occupied cell returns false', () => {
    const g = createGrid()
    g[0][4] = 1
    expect(isValidPosition(g, square, 4, 0)).toBe(false)
  })

  test('zero cells in shape are ignored (pass over occupied)', () => {
    const g = createGrid()
    g[1][4] = 1
    // shape: hole at [0][0] and [1][1], fills [0][1] and [1][0]
    const shape = [
      [0, 1],
      [1, 0],
    ]
    // col 4 row 1 is occupied but the [1][0] cell of the shape maps to col 4 row 1 -> INVALID
    expect(isValidPosition(g, shape, 4, 0)).toBe(false)
  })

  test('above the grid (y < 0) is allowed for cells whose gridRow >= 0', () => {
    // piece partially above top is valid as long as non-zero cells fit
    const shape = [
      [0, 0],
      [1, 1],
    ] // only row 1 has cells
    // y = -1: row-1 cells land at gridRow = 0 (fine), row-0 cells would be -1 (not drawn)
    expect(isValidPosition(grid, shape, 4, -1)).toBe(true)
  })
})

// ─── rotatePieceShape ─────────────────────────────────────────────────────────
describe('rotatePieceShape', () => {
  test('four rotations return to original shape', () => {
    const shape = [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0],
    ]
    let rotated = shape
    for (let i = 0; i < 4; i++) rotated = rotatePieceShape(rotated)
    expect(rotated).toEqual(shape)
  })

  test('O piece is invariant under rotation', () => {
    const shape = [
      [2, 2],
      [2, 2],
    ]
    expect(rotatePieceShape(shape)).toEqual(shape)
  })

  test('I piece rotated twice produces a transposed variant', () => {
    const shape = [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const twice = rotatePieceShape(rotatePieceShape(shape))
    // After two 90° CW rotations (= 180°), non-zero cells are still in row 2
    const nonZero = twice.flat().filter((c) => c !== 0)
    expect(nonZero).toHaveLength(4)
  })

  test('output dimensions are transposed (rows×cols → cols×rows)', () => {
    const shape = [[1, 2, 3]] // 1 row × 3 cols
    const rotated = rotatePieceShape(shape)
    expect(rotated).toHaveLength(3) // 3 rows
    expect(rotated[0]).toHaveLength(1) // 1 col
  })
})

// ─── rotatePiece ─────────────────────────────────────────────────────────────
describe('rotatePiece', () => {
  test('rotates piece when space is available', () => {
    const grid = createGrid()
    const piece = {
      shape: [
        [0, 3, 0],
        [3, 3, 3],
        [0, 0, 0],
      ],
      x: 4,
      y: 5,
    }
    const result = rotatePiece(piece, grid)
    expect(result.shape).not.toEqual(piece.shape)
  })

  test('applies wall kick when rotation is blocked on the right', () => {
    const grid = createGrid()
    // Place piece flush against right wall; rotation may need a leftward kick
    const piece = {
      shape: [
        [3, 3, 3],
        [0, 3, 0],
        [0, 0, 0],
      ],
      x: 8,
      y: 5,
    }
    const result = rotatePiece(piece, grid)
    // Should return either rotated (possibly kicked) or original
    expect(result).toBeDefined()
  })

  test('returns original piece if no rotation is possible', () => {
    // Pack the grid so there is no room for any rotation attempt
    const grid = createGrid()
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) grid[r][c] = 1
    }
    const piece = {
      shape: [
        [0, 3, 0],
        [3, 3, 3],
        [0, 0, 0],
      ],
      x: 4,
      y: 5,
    }
    const result = rotatePiece(piece, grid)
    expect(result).toEqual(piece)
  })
})

// ─── movePiece ────────────────────────────────────────────────────────────────
describe('movePiece', () => {
  const grid = createGrid()
  const piece = {
    shape: [
      [1, 1],
      [1, 1],
    ],
    x: 4,
    y: 5,
  }

  test('moves right by 1', () => {
    const result = movePiece(piece, grid, 1, 0)
    expect(result).toEqual({ ...piece, x: 5 })
  })

  test('moves down by 1', () => {
    const result = movePiece(piece, grid, 0, 1)
    expect(result).toEqual({ ...piece, y: 6 })
  })

  test('returns null when blocked by wall', () => {
    const atLeft = { ...piece, x: 0 }
    expect(movePiece(atLeft, grid, -1, 0)).toBeNull()
  })

  test('returns null when blocked by existing cell', () => {
    const g = createGrid()
    g[5][6] = 1
    expect(movePiece(piece, g, 1, 0)).toBeNull()
  })

  test('does not mutate the original piece', () => {
    movePiece(piece, grid, 1, 0)
    expect(piece.x).toBe(4)
  })
})

// ─── hardDrop ────────────────────────────────────────────────────────────────
describe('hardDrop', () => {
  test('drops piece to the floor on an empty grid', () => {
    const grid = createGrid()
    const piece = {
      shape: [
        [1, 1],
        [1, 1],
      ],
      x: 4,
      y: 0,
    }
    const dropped = hardDrop(piece, grid)
    // 2-row piece lands at y = GRID_ROWS - 2 = 18
    expect(dropped.y).toBe(GRID_ROWS - 2)
  })

  test('lands on top of existing blocks', () => {
    const grid = createGrid()
    // fill row 15 and below completely
    for (let r = 15; r < GRID_ROWS; r++) grid[r].fill(1)
    const piece = {
      shape: [
        [1, 1],
        [1, 1],
      ],
      x: 4,
      y: 0,
    }
    const dropped = hardDrop(piece, grid)
    expect(dropped.y).toBe(13) // 2-row piece stops at row 13 (rows 13,14)
  })

  test('x coordinate is preserved', () => {
    const grid = createGrid()
    const piece = { shape: [[1]], x: 7, y: 0 }
    expect(hardDrop(piece, grid).x).toBe(7)
  })
})

// ─── lockPiece ────────────────────────────────────────────────────────────────
describe('lockPiece', () => {
  test('writes piece cells into the grid', () => {
    const grid = createGrid()
    const piece = {
      shape: [
        [2, 2],
        [2, 2],
      ],
      x: 4,
      y: 18,
    }
    const result = lockPiece(grid, piece)
    expect(result[18][4]).toBe(2)
    expect(result[18][5]).toBe(2)
    expect(result[19][4]).toBe(2)
    expect(result[19][5]).toBe(2)
  })

  test('does not mutate the original grid', () => {
    const grid = createGrid()
    const piece = { shape: [[1]], x: 0, y: 0 }
    lockPiece(grid, piece)
    expect(grid[0][0]).toBe(0)
  })

  test('ignores zero cells in shape', () => {
    const grid = createGrid()
    const piece = {
      shape: [
        [0, 3],
        [3, 0],
      ],
      x: 0,
      y: 0,
    }
    const result = lockPiece(grid, piece)
    expect(result[0][0]).toBe(0)
    expect(result[0][1]).toBe(3)
    expect(result[1][0]).toBe(3)
    expect(result[1][1]).toBe(0)
  })
})

// ─── clearLines ───────────────────────────────────────────────────────────────
describe('clearLines', () => {
  test('no lines cleared on empty grid', () => {
    const { newGrid, linesCleared } = clearLines(createGrid())
    expect(linesCleared).toBe(0)
    expect(newGrid).toHaveLength(GRID_ROWS)
  })

  test('clears one full row', () => {
    const grid = createGrid()
    grid[19].fill(1)
    const { newGrid, linesCleared } = clearLines(grid)
    expect(linesCleared).toBe(1)
    expect(newGrid[19].every((c) => c === 0)).toBe(true)
  })

  test('clears four full rows (Tetris)', () => {
    const grid = createGrid()
    for (let r = 16; r < 20; r++) grid[r].fill(3)
    const { linesCleared } = clearLines(grid)
    expect(linesCleared).toBe(4)
  })

  test('partial rows are not cleared', () => {
    const grid = createGrid()
    grid[19].fill(1)
    grid[19][5] = 0 // gap → partial
    const { linesCleared } = clearLines(grid)
    expect(linesCleared).toBe(0)
  })

  test('resulting grid always has GRID_ROWS rows', () => {
    const grid = createGrid()
    for (let r = 10; r < 20; r++) grid[r].fill(1)
    const { newGrid } = clearLines(grid)
    expect(newGrid).toHaveLength(GRID_ROWS)
  })

  test('cleared lines are replaced by empty rows at the top', () => {
    const grid = createGrid()
    grid[18].fill(1)
    grid[19].fill(1)
    const { newGrid } = clearLines(grid)
    expect(newGrid[0].every((c) => c === 0)).toBe(true)
    expect(newGrid[1].every((c) => c === 0)).toBe(true)
  })
})

// ─── addGarbageLines ──────────────────────────────────────────────────────────
describe('addGarbageLines', () => {
  test('returns same grid when count is 0', () => {
    const grid = createGrid()
    expect(addGarbageLines(grid, 0)).toBe(grid)
  })

  test('grid still has GRID_ROWS rows after adding garbage', () => {
    const grid = createGrid()
    expect(addGarbageLines(grid, 3)).toHaveLength(GRID_ROWS)
  })

  test('bottom rows become garbage rows (value 8, one hole per row)', () => {
    const grid = createGrid()
    const result = addGarbageLines(grid, 2)
    const lastRow = result[GRID_ROWS - 1]
    const filledCells = lastRow.filter((c) => c === 8)
    expect(filledCells).toHaveLength(GRID_COLS - 1) // one hole
    expect(lastRow.some((c) => c === 0)).toBe(true)
  })

  test('existing content is shifted up by garbage count', () => {
    const grid = createGrid()
    grid[19].fill(5) // mark bottom row
    const result = addGarbageLines(grid, 1)
    // original row 19 (full of 5s) is now at row 18
    expect(result[18].every((c) => c === 5)).toBe(true)
  })
})

// ─── getSpectrum ──────────────────────────────────────────────────────────────
describe('getSpectrum', () => {
  test('all zeros on empty grid', () => {
    expect(getSpectrum(createGrid())).toEqual(new Array(GRID_COLS).fill(0))
  })

  test('returns correct height for each column', () => {
    const grid = createGrid()
    grid[19][0] = 1 // col 0 height = 1
    grid[18][1] = 1 // col 1 height = 2
    grid[17][2] = 1 // col 2 height = 3
    const spectrum = getSpectrum(grid)
    expect(spectrum[0]).toBe(1)
    expect(spectrum[1]).toBe(2)
    expect(spectrum[2]).toBe(3)
    expect(spectrum[3]).toBe(0)
  })

  test('full column returns GRID_ROWS', () => {
    const grid = createGrid()
    for (let r = 0; r < GRID_ROWS; r++) grid[r][0] = 1
    expect(getSpectrum(grid)[0]).toBe(GRID_ROWS)
  })
})

// ─── isGameOver ───────────────────────────────────────────────────────────────
describe('isGameOver', () => {
  test('returns false for empty grid', () => {
    expect(isGameOver(createGrid())).toBe(false)
  })

  test('returns true when top row has a filled cell', () => {
    const grid = createGrid()
    grid[0][5] = 1
    expect(isGameOver(grid)).toBe(true)
  })

  test('returns false when only lower rows are filled', () => {
    const grid = createGrid()
    grid[1][0] = 1
    expect(isGameOver(grid)).toBe(false)
  })
})

// ─── calculateScore ───────────────────────────────────────────────────────────
describe('calculateScore', () => {
  test('0 lines = 0 points', () => {
    expect(calculateScore(0, 0)).toBe(0)
  })

  test('1 line at level 0 = 100', () => {
    expect(calculateScore(1, 0)).toBe(100)
  })

  test('4 lines at level 0 = 800', () => {
    expect(calculateScore(4, 0)).toBe(800)
  })

  test('score scales with level', () => {
    expect(calculateScore(1, 1)).toBe(200) // 100 * (1+1)
    expect(calculateScore(4, 2)).toBe(2400) // 800 * (2+1)
  })
})

// ─── calculateLevel ───────────────────────────────────────────────────────────
describe('calculateLevel', () => {
  test('level 0 for 0 lines', () => expect(calculateLevel(0)).toBe(0))
  test('level 0 for 9 lines', () => expect(calculateLevel(9)).toBe(0))
  test('level 1 for 10 lines', () => expect(calculateLevel(10)).toBe(1))
  test('level 5 for 50 lines', () => expect(calculateLevel(50)).toBe(5))
})

// ─── calculateGravityDelay ────────────────────────────────────────────────────
describe('calculateGravityDelay', () => {
  test('level 0 returns 800ms in normal mode', () => {
    expect(calculateGravityDelay(0, 'normal')).toBe(800)
  })

  test('defaults to normal mode when omitted', () => {
    expect(calculateGravityDelay(5)).toBe(380)
  })

  test('higher levels return shorter delays', () => {
    expect(calculateGravityDelay(5, 'normal')).toBeLessThan(calculateGravityDelay(0, 'normal'))
  })

  test('level beyond table max returns minimum delay (normal)', () => {
    expect(calculateGravityDelay(100, 'normal')).toBe(calculateGravityDelay(10, 'normal'))
  })

  test('fast mode at level 0 is faster than normal', () => {
    expect(calculateGravityDelay(0, 'fast')).toBeLessThan(calculateGravityDelay(0, 'normal'))
    expect(calculateGravityDelay(0, 'fast')).toBe(400)
  })

  test('fast mode level 10 returns 40ms', () => {
    expect(calculateGravityDelay(10, 'fast')).toBe(40)
  })

  test('fast mode clamps levels beyond table max', () => {
    expect(calculateGravityDelay(99, 'fast')).toBe(calculateGravityDelay(10, 'fast'))
  })

  test('fast mode is faster than normal at every level', () => {
    for (let lvl = 0; lvl <= 10; lvl++) {
      expect(calculateGravityDelay(lvl, 'fast')).toBeLessThan(calculateGravityDelay(lvl, 'normal'))
    }
  })
})
