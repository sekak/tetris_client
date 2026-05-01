import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock the socket module so TetrisBoard's keydown handlers do not open a
// real connection during tests.
vi.mock('../lib/socket', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}))

import socket from '../lib/socket'
import TetrisBoard from './TetrisBoard'

const emptyBoard = (): number[][] => Array.from({ length: 20 }, () => new Array(10).fill(0))

describe('TetrisBoard Component', () => {
  beforeEach(() => {
    vi.mocked(socket.emit).mockReset()
  })

  it('renders 200 cells (10 cols x 20 rows)', () => {
    render(<TetrisBoard board={emptyBoard()} currentPiece={null} />)
    const grid = document.querySelector('.grid')
    expect(grid?.children.length).toBe(200)
  })

  it('paints filled cells from the board with their CELL_COLORS entry', () => {
    const board = emptyBoard()
    board[19][0] = 1 // bottom-left cell of type 1
    render(<TetrisBoard board={board} currentPiece={null} />)
    const cells = document.querySelector('.grid')!.children
    const bottomLeft = cells[19 * 10] as HTMLElement
    expect(bottomLeft.style.backgroundColor).not.toBe('')
  })

  it('overlays the currentPiece onto the display', () => {
    const piece = { id: 2, x: 0, y: 0, shape: [[1]] }
    render(<TetrisBoard board={emptyBoard()} currentPiece={piece} />)
    const cells = document.querySelector('.grid')!.children
    const topLeft = cells[0] as HTMLElement
    expect(topLeft.style.backgroundColor).not.toBe('')
  })

  it.each([
    ['ArrowLeft', 'move', { direction: 'left' }],
    ['ArrowRight', 'move', { direction: 'right' }],
    ['ArrowDown', 'move', { direction: 'down' }],
    ['ArrowUp', 'rotate', undefined],
    [' ', 'drop', undefined],
  ] as const)('emits %s key as %s socket event', (key, event, payload) => {
    render(<TetrisBoard board={emptyBoard()} currentPiece={null} />)
    fireEvent.keyDown(window, { key })
    if (payload === undefined) {
      expect(socket.emit).toHaveBeenCalledWith(event)
    } else {
      expect(socket.emit).toHaveBeenCalledWith(event, payload)
    }
  })

  it('ignores unrelated keys', () => {
    render(<TetrisBoard board={emptyBoard()} currentPiece={null} />)
    fireEvent.keyDown(window, { key: 'a' })
    expect(socket.emit).not.toHaveBeenCalled()
  })
})
