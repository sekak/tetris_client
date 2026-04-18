import type { Board, Piece, Cell } from '../types/tetris'

// Couleurs par type de tetromino (neon, cohérentes avec le thème)
export const CELL_COLORS: Record<string, string> = {
  I: 'oklch(78% 0.17 192)', // cyan
  O: 'oklch(95% 0.20 105)', // yellow
  T: 'oklch(65% 0.28 328)', // magenta
  S: 'oklch(72% 0.25 145)', // green
  Z: 'oklch(55% 0.25 25)', // red
  J: 'oklch(55% 0.25 265)', // blue
  L: 'oklch(72% 0.20 50)', // orange
  penalty: 'oklch(35% 0.04 240)', // gris foncé
}

// Fusionne la pièce active sur la grille pour l'affichage
const buildDisplayBoard = (board: Board, piece: Piece | null): Board => {
  const display: Board = board.map((row) => [...row])
  if (!piece) return display
  piece.shape.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) return
      const y = piece.y + r
      const x = piece.x + c
      if (y >= 0 && y < 20 && x >= 0 && x < 10) {
        display[y][x] = piece.type
      }
    })
  })
  return display
}

type BoardProps = {
  board: Board
  currentPiece: Piece | null
}

const BoardCell = ({ cell }: { cell: Cell }) => {
  const bg = cell ? CELL_COLORS[cell] : undefined
  return (
    <div
      style={{
        width: 24,
        height: 24,
        backgroundColor: bg ?? 'oklch(17% 0.04 240)',
        border: '1px solid oklch(13% 0.03 240)',
        boxSizing: 'border-box',
        boxShadow: bg ? `0 0 4px ${bg}` : undefined,
      }}
    />
  )
}

const BoardComponent = ({ board, currentPiece }: BoardProps) => {
  const display = buildDisplayBoard(board, currentPiece)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 24px)',
        border: '2px solid oklch(78% 0.17 192)',
        boxShadow: '0 0 20px oklch(78% 0.17 192 / 0.4)',
      }}
    >
      {display.flat().map((cell, i) => (
        <BoardCell key={i} cell={cell} />
      ))}
    </div>
  )
}

export default BoardComponent
