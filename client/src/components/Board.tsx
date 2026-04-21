import { useEffect } from 'react'
import { BOARD_WIDTH, BOARD_HEIGHT, CELL_COLORS } from '../types/tetris'
import socket from '../lib/socket'

const Board = ({ board, currentPiece }: any) => {
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

export default Board

// import type { Board, Piece, Cell } from '../types/tetris'

// // Couleurs par type de tetromino (neon, cohérentes avec le thème)
// export const CELL_COLORS: Record<string, string> = {
//   I: 'oklch(78% 0.17 192)', // cyan
//   O: 'oklch(95% 0.20 105)', // yellow
//   T: 'oklch(65% 0.28 328)', // magenta
//   S: 'oklch(72% 0.25 145)', // green
//   Z: 'oklch(55% 0.25 25)', // red
//   J: 'oklch(55% 0.25 265)', // blue
//   L: 'oklch(72% 0.20 50)', // orange
//   penalty: 'oklch(35% 0.04 240)', // gris foncé
// }

// // Fusionne la pièce active sur la grille pour l'affichage
// const buildDisplayBoard = (board: Board, piece: Piece | null): Board => {
//   const display: Board = board.map((row) => [...row])
//   if (!piece) return display
//   piece.shape.forEach((row, r) => {
//     row.forEach((cell, c) => {
//       if (!cell) return
//       const y = piece.y + r
//       const x = piece.x + c
//       if (y >= 0 && y < 20 && x >= 0 && x < 10) {
//         display[y][x] = piece.type
//       }
//     })
//   })
//   return display
// }

// type BoardProps = {
//   board: Board
//   currentPiece: Piece | null
// }

// const BoardCell = ({ cell }: { cell: Cell }) => {
//   const bg = cell ? CELL_COLORS[cell] : undefined
//   return (
//     <div
//       style={{
//         width: 24,
//         height: 24,
//         backgroundColor: bg ?? 'oklch(17% 0.04 240)',
//         border: '1px solid oklch(13% 0.03 240)',
//         boxSizing: 'border-box',
//         boxShadow: bg ? `0 0 4px ${bg}` : undefined,
//       }}
//     />
//   )
// }

// const BoardComponent = ({ board, currentPiece }: BoardProps) => {
//   const display = buildDisplayBoard(board, currentPiece)
//   return (
//     <div
//       style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(10, 24px)',
//         border: '2px solid oklch(78% 0.17 192)',
//         boxShadow: '0 0 20px oklch(78% 0.17 192 / 0.4)',
//       }}
//     >
//       {display.flat().map((cell, i) => (
//         <BoardCell key={i} cell={cell} />
//       ))}
//     </div>
//   )
// }

// export default BoardComponent
