export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export type Cell = TetrominoType | 'penalty' | null

export type Board = Cell[][] // 20 lignes × 10 colonnes

export type Piece = {
  type: TetrominoType
  x: number
  y: number
  color: string
  shape: number[][]
}

// ─── Joueur dans la room ──────────────────────────────────────────────────────

export type Player = {
  socketId: string
  name: string
  isHost: boolean
  alive: boolean
}

// Vue adversaire : spectrum uniquement (hauteur de chaque colonne)
// export type Opponent = {
//   name: string
//   spectrum: number[] // longueur 10
//   alive: boolean
// }

// ─── Redux state shapes ───────────────────────────────────────────────────────

// export type SocketState = {
//   connected: boolean
//   connecting: boolean
// }

// export type RoomState = {
//   roomId: string | null
//   playerName: string | null
//   players: Player[]
//   isHost: boolean
//   gameStarted: boolean
//   error: string | null
// }

// export type GameState = {
//   board: Board
//   currentPiece: Piece | null
//   nextPiece: Piece | null
//   pieceIndex: number // index dans la séquence serveur
//   opponents: Record<string, Opponent> // socketId → Opponent
//   gameOver: boolean
//   winner: string | null
//   linesCleared: number
// }

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

export const CELL_COLORS: Record<number, string> = {
  0: 'oklch(17% 0.04 240)',
  1: 'oklch(78% 0.17 192)',
  2: 'oklch(95% 0.20 105)',
  3: 'oklch(65% 0.28 328)',
  4: 'oklch(72% 0.25 145)',
  5: 'oklch(55% 0.25 25)',
  6: 'oklch(55% 0.25 265)',
  7: 'oklch(72% 0.20 50)',
  8: 'oklch(45% 0.03 240)',
}
