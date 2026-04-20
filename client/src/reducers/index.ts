// import type { Player } from '../types/tetris';
// import type { Board, Piece, Player, Opponent } from '../types/tetris'
import type { Player } from '../types/tetris'

// type AppState = {
//   socketId: string | null
//   connected: boolean
//   roomId: string | null
//   playerName: string | null
//   players: Player[]
//   isHost: boolean
//   gameStarted: boolean
//   board: Board
//   currentPiece: Piece | null
//   nextPiece: Piece | null
//   opponents: Opponent[]
//   gameOver: boolean
//   winner: string | null
//   linesCleared: number
//   score: number
//   level: number
//   error: string | null
// }

// const EMPTY_BOARD: Board = Array.from({ length: 20 }, () => Array(10).fill(null))

const INITIAL_STATE = {
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
  winner: null,
}

const reducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case 'SOCKET_CONNECTED':
      return { ...state, connected: true, socketId: action.payload.socketId }

    case 'SOCKET_DISCONNECTED':
      return { ...state, connected: false, socketId: null }

    case 'ROOM_JOINED': {
      const { roomId, player, players } = action.payload
      return {
        ...state,
        roomId,
        playerName: player.name,
        isHost: player.isHost,
        grid: player.grid,
        players,
        error: null,
      }
    }
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

    case 'GAME_STATE_UPDATE': {
      const { players } = action.payload
      const me = players.find((p: any) => p.socketId === state.socketId)

      if (!me) return state
      return {
        ...state,
        grid: me.grid,
        currentPiece: me.currentPiece,
        nextPiece: me.nextPiece,
        score: me.score,
        level: me.level,
        linesCleared: me.linesCleared,
        spectrum: me.spectrum,
      }
    }

    // case 'SOCKET_CONNECTED':
    //   return { ...state, connected: true, socketId: action.payload.socketId }

    // case 'SOCKET_DISCONNECTED':
    //   return { ...state, connected: false, socketId: null }

    // case 'ROOM_JOINED': {
    //   const { roomId, player, players } = action.payload
    //   return {
    //     ...state,
    //     roomId,
    //     playerName: player.name,
    //     isHost: player.isHost,
    //     players,
    //     error: null,
    //   }
    // }

    // case 'PLAYER_JOINED': {
    //   const { player } = action.payload
    //   const exists = state.players.some((p) => p.socketId === player.socketId)
    //   if (exists) return state
    //   return { ...state, players: [...state.players, player] }
    // }

    // case 'PLAYER_LEFT': {
    //   const { socketId, newHost } = action.payload
    //   let players = state.players.filter((p) => p.socketId !== socketId)
    //   if (newHost) {
    //     players = players.map((p) =>
    //       p.socketId === newHost.socketId
    //         ? { ...p, isHost: true }
    //         : { ...p, isHost: false }
    //     )
    //   }
    //   const isHost = newHost ? newHost.socketId === state.socketId : state.isHost
    //   return { ...state, players, isHost }
    // }

    // case 'GAME_STARTED':
    //   return { ...state, gameStarted: true, gameOver: false, winner: null }

    // case 'GAME_STATE_UPDATE': {
    //   const { players, socketId } = action.payload
    //   const me = players.find((p: any) => p.socketId === socketId)
    //   if (!me) return state
    //   const opponents: Opponent[] = players
    //     .filter((p: any) => p.socketId !== socketId)
    //     .map((p: any) => ({
    //       name: p.name,
    //       spectrum: p.spectrum,
    //       alive: p.alive,
    //     }))
    //   return {
    //     ...state,
    //     board: me.grid,
    //     currentPiece: me.currentPiece,
    //     nextPiece: me.nextPiece,
    //     score: me.score,
    //     level: me.level,
    //     linesCleared: me.linesCleared,
    //     opponents,
    //   }
    // }

    // case 'GAME_OVER':
    //   return {
    //     ...state,
    //     gameOver: true,
    //     gameStarted: false,
    //     winner: action.payload.winner ? action.payload.winner.name : null,
    //   }

    // case 'GAME_RESET': {
    //   const { players } = action.payload
    //   return {
    //     ...state,
    //     gameStarted: false,
    //     gameOver: false,
    //     winner: null,
    //     board: EMPTY_BOARD,
    //     currentPiece: null,
    //     nextPiece: null,
    //     opponents: [],
    //     score: 0,
    //     level: 0,
    //     linesCleared: 0,
    //     players,
    //   }
    // }

    // case 'SET_ERROR':
    //   return { ...state, error: action.payload.message }

    default:
      return state
  }
}

export default reducer
