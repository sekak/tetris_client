import { describe, expect, it } from 'vitest'
import reducer from '.'
import type { GAME_STATE } from '../types/tetris'

const INITIAL_STATE = reducer(undefined, { type: '@@INIT' })

describe('Reducer', () => {
  describe('Initial State', () => {
    it('should return the initial state', () => {
      expect(INITIAL_STATE).toMatchObject({
        mode: 'normal',
        socketId: null,
        spectrum: [],
        players: [],
        roomId: null,
        gameStarted: false,
        gameOver: false,
        winner: [],
        error: null,
        exists: false,
        roomScores: [],
      })
    })
  })

  describe('SOCKET_CONNECTED', () => {
    it('should handle SOCKET_CONNECTED', () => {
      const action = { type: 'SOCKET_CONNECTED', payload: { socketId: '123' } }
      const newState = reducer(INITIAL_STATE as GAME_STATE, action)
      expect(newState).toMatchObject({
        ...INITIAL_STATE,
        connected: true,
        socketId: '123',
      })
    })
  })

  describe('SOCKET_DISCONNECTED', () => {
    it('should handle SOCKET_DISCONNECTED', () => {
      const state = { ...INITIAL_STATE, connected: true, socketId: '123' }
      const action = { type: 'SOCKET_DISCONNECTED' }
      const newState = reducer(state as GAME_STATE, action)
      expect(newState).toMatchObject({
        ...INITIAL_STATE,
        connected: false,
        socketId: null,
      })
    })
  })

  describe('ROOM_JOINED', () => {
    it('should handle ROOM_JOINED', () => {
      const player = {
        socketId: '123',
        name: 'Player1',
        isHost: true,
        grid: [],
      }

      const action = {
        type: 'ROOM_JOINED',
        payload: {
          roomId: 'room1',
          player,
        },
      }
      const newState = reducer(INITIAL_STATE as GAME_STATE, action)
      expect(newState.socketId).toBe('123')
      expect(newState.roomId).toBe('room1')
      expect(newState.isHost).toBe(true)
      expect(newState.grid).toEqual([])
      expect(newState.error).toBeNull()
    })
  })

  describe('MODE_CHANGED', () => {
    it('should handle MODE_CHANGED', () => {
      const action = reducer(INITIAL_STATE as GAME_STATE, {
        type: 'MODE_CHANGED',
        payload: { mode: 'fast' },
      })
      expect(action.mode).toBe('fast')
    })
  })

  describe('PLAYER_JOINED and PLAYER_LEFT', () => {
    it('should handle PLAYER_JOINED', () => {
      const action = reducer(INITIAL_STATE as GAME_STATE, {
        type: 'PLAYER_JOINED',
        payload: {
          player: { socketId: '123', name: 'Player1', isHost: false, grid: [] },
        },
      })
      expect(action.players).toEqual([
        { socketId: '123', name: 'Player1', isHost: false, grid: [] },
      ])
    })

    it('should not add duplicate player on PLAYER_JOINED', () => {
      const state = {
        ...INITIAL_STATE,
        players: [{ socketId: '123', name: 'Player1', isHost: false, grid: [], alive: true }],
      }

      const action = reducer(state as GAME_STATE, {
        type: 'PLAYER_JOINED',
        payload: {
          player: { socketId: '123', name: 'Player1', isHost: false, grid: [], alive: true },
        },
      })
      expect(action.players).toEqual([
        { socketId: '123', name: 'Player1', isHost: false, grid: [], alive: true },
      ])
    })
  })

  describe('PLAYER_LEFT', () => {
    it('should handle PLAYER_LEFT', () => {
      const state = {
        ...INITIAL_STATE,
        players: [
          { socketId: '123', name: 'Player1', isHost: false, grid: [], alive: true },
          { socketId: '456', name: 'Player2', isHost: true, grid: [], alive: true },
        ],
        isHost: true,
      }

      const action = reducer(state as GAME_STATE, {
        type: 'PLAYER_LEFT',
        payload: {
          socketId: '123',
          newHost: { socketId: '456', name: 'Player2', isHost: true, grid: [], alive: true },
        },
      })

      expect(action.players).toMatchObject([
        { socketId: '456', name: 'Player2', isHost: true, grid: [], alive: true },
      ])
    })
  })

  describe('GAME_OVER', () => {
    it('should handle GAME_OVER', () => {
      const action = reducer(INITIAL_STATE as GAME_STATE, {
        type: 'GAME_OVER',
        payload: {
          winner: { socketId: '123', name: 'Player1' },
        },
      })

      expect(action.gameOver).toBe(true)
      expect(action.winner).toEqual({ socketId: '123', name: 'Player1' })
    })

    it('should handle GAME_OVER with no winner', () => {
      const action = reducer(INITIAL_STATE as GAME_STATE, {
        type: 'GAME_OVER',
        payload: {
          winner: null,
        },
      })

      expect(action.gameOver).toBe(true)
      expect(action.winner).toBeNull()
    })
  })

  describe('ROOM_SCORES', () => {
    it('should handle ROOM_SCORES', () => {
      const action = reducer(INITIAL_STATE as GAME_STATE, {
        type: 'ROOM_SCORES',
        payload: {
          scores: [
            { playerName: 'Player1', score: 100 },
            { playerName: 'Player2', score: 150 },
          ],
        },
      })

      expect(action.roomScores).toEqual([
        { playerName: 'Player1', score: 100 },
        { playerName: 'Player2', score: 150 },
      ])
    })
  })

  describe('GAME_RESET', () => {
    it('should handle GAME_RESET', () => {
      const state = {
        ...INITIAL_STATE,
        gameStarted: true,
        gameOver: true,
        winner: [{ socketId: '123', name: 'Player1' }],
      }

      const action = reducer(state as GAME_STATE, {
        type: 'GAME_RESET',
      })

      expect(action.gameStarted).toBe(false)
      expect(action.gameOver).toBe(false)
      expect(action.winner).toBeNull()
    })
  })
})
