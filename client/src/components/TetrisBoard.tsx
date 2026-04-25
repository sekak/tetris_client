import { useEffect } from 'react'
import { BOARD_WIDTH, BOARD_HEIGHT, CELL_COLORS } from '../types/tetris'
import socket from '../lib/socket'

const TetrisBoard = ({ board, currentPiece }: any) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          socket.emit('move', { direction: 'left' })
          break
        case 'ArrowRight':
          socket.emit('move', { direction: 'right' })
          break
        case 'ArrowDown':
          socket.emit('move', { direction: 'down' })
          break
        case 'ArrowUp':
          socket.emit('rotate')
          break
        case ' ':
          socket.emit('drop')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const display: number[][] = board.map((row: number[]) => [...row])

  if (currentPiece) {
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (!currentPiece.shape[r][c]) continue
        const py = currentPiece.y + r
        const px = currentPiece.x + c
        if (py >= 0 && py < BOARD_HEIGHT && px >= 0 && px < BOARD_WIDTH) {
          display[py][px] = currentPiece.id
        }
      }
    }
  }

  return (
    <div
      className="w-max grid grid-cols-10 border-2 border-cyan-400"
      style={{ boxShadow: '0 0 24px oklch(78% 0.17 192 / 0.5)' }}
    >
      {display.flat().map((cell, i: number) => (
        <div
          key={i}
          className="w-8 h-8 box-border border border-gray-600/30"
          style={{
            backgroundColor: cell ? CELL_COLORS[cell] : 'oklch(17% 0.04 240)',
            boxShadow: cell ? `inset 0 0 6px oklch(100% 0 0 / 0.2)` : undefined,
          }}
        />
      ))}
    </div>
  )
}

export default TetrisBoard
