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

export type Player = {
  socketId: string
  name: string
  isHost: boolean
  alive: boolean
}

export type GAME_STATE = {
  alive: boolean
  currentPiece: Piece | null
  grid: Board | null
  isHost: boolean
  level: number
  linesCleared: number
  name: string | null
  nextPiece: Piece | null
  score: number
  socketId: string | null
  spectrum: number[]
  players: Player[]
  roomId: string | null
  gameStarted: boolean
  gameOver: boolean
  winner: { socketId: string; name: string }[] // peut être plusieurs en cas d'égalité
  error: string | null
  joinError: string | null
  exists: boolean
  roomScores: { playerName: string; score: number }[]
  mode: 'normal' | 'fast'
}

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

export type ScoreEntry = {
  name: string
  score: number
  level: number
  linesCleared: number
  finishedAt: string
}

export type LeaderboardProps = {
  scores: ScoreEntry[]
  currentPlayerName?: string | null
  title?: string
}
