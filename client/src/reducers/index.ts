import type { GAME_STATE, Player } from '../types/tetris'

const INITIAL_STATE: GAME_STATE = {
  alive: false,
  currentPiece: null,
  grid: null,
  isHost: false,
  level: 0,
  linesCleared: 0,
  name: null,
  nextPiece: null,
  score: 0,
  socketId: null,
  spectrum: [],
  players: [],
  roomId: null,
  gameStarted: false,
  gameOver: false,
  winner: [],
  error: null,
  joinError: null,
  exists: false,
  roomScores: [],
  mode: 'normal' as 'normal' | 'fast',
}

const reducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case 'SOCKET_CONNECTED':
      return { ...state, connected: true, socketId: action.payload.socketId }

    case 'SOCKET_DISCONNECTED':
      return { ...state, connected: false, socketId: null }

    case 'ROOM_JOINED': {
      const { roomId, player, players, mode } = action.payload

      return {
        ...state,
        socketId: player.socketId,
        roomId,
        playerName: player.name,
        isHost: player.isHost,
        grid: player.grid,
        players,
        mode: mode ?? state.mode,
        error: null,
        joinError: null,
      }
    }

    case 'JOIN_ERROR':
      return { ...state, joinError: action.payload.message }

    case 'CLEAR_JOIN_ERROR':
      return { ...state, joinError: null }

    case 'MODE_CHANGED':
      return { ...state, mode: action.payload.mode }

    case 'PLAYER_JOINED': {
      const { player } = action.payload
      if (state.players.some((p: Player) => p.socketId === player.socketId)) return state
      return { ...state, players: [...state.players, player] }
    }

    case 'PLAYER_LEFT': {
      const { socketId, newHost } = action.payload

      let players: Player[] = state.players.filter((p: Player) => p.socketId !== socketId)
      if (newHost) {
        players = players.map((p: Player) =>
          p.socketId === newHost.socketId ? { ...p, isHost: true } : { ...p, isHost: false }
        )
      }

      const isHost = newHost ? newHost.socketId === state.socketId : state.isHost

      return { ...state, players, isHost }
    }

    case 'GAME_STARTED':
      return {
        ...state,
        gameStarted: true,
        gameOver: false,
        winner: null,
      }

    case 'CHECK_ROOM_RESULT':
      return { ...state, exists: action.payload.exists, error: action.payload.error ?? null }

    case 'GAME_STATE_UPDATE': {
      const { players } = action.payload
      const me = players.find((p: any) => p.socketId === state.socketId)

      if (!me) return state
      return {
        ...state,
        players,
        grid: me.grid,
        currentPiece: me.currentPiece,
        nextPiece: me.nextPiece,
        score: me.score,
        level: me.level,
        linesCleared: me.linesCleared,
        spectrum: me.spectrum,
        alive: me.alive,
      }
    }

    case 'GAME_OVER': {
      const { winner } = action.payload

      return {
        ...state,
        gameOver: true,
        winner: winner ? { name: winner.name, socketId: winner.socketId } : null,
      }
    }

    case 'ROOM_SCORES':
      return {
        ...state,
        roomScores: Array.isArray(action.payload?.scores) ? action.payload.scores : [],
      }

    case 'GAME_RESET':
      return {
        ...state,
        gameStarted: false,
        gameOver: false,
        winner: null,
        grid: null,
        currentPiece: null,
        nextPiece: null,
        score: 0,
        level: 0,
        linesCleared: 0,
      }

    default:
      return state
  }
}

export default reducer
