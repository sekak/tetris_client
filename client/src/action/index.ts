import type { Dispatch } from 'redux'
import socket from '../lib/socket'

let registered = false

export const addSocketListener = (dispatch: Dispatch) => {
  if (registered) return
  registered = true

  socket.on('connect', () => {
    dispatch({ type: 'SOCKET_CONNECTED', payload: { socketId: socket.id } })
  })

  socket.on('error', (err) => {
    console.error('Socket error:', err)
  })

  socket.on('room_joined', (data) => {
    dispatch({ type: 'ROOM_JOINED', payload: data })
  })

  socket.on('player_joined', (data) => {
    dispatch({ type: 'PLAYER_JOINED', payload: data })
  })

  socket.on('player_left', (data) => {
    dispatch({ type: 'PLAYER_LEFT', payload: data })
  })

  socket.on('start_game', (data) => {
    dispatch({ type: 'GAME_STARTED', payload: data })
  })

  socket.on('game_started', (data) => {
    dispatch({ type: 'GAME_STARTED', payload: data })
  })

  socket.on('game_state', (data) => {
    console.log('game state', data)
    dispatch({ type: 'GAME_STATE_UPDATE', payload: data })
  })

  socket.on('check_room', (data) => {
    dispatch({ type: 'CHECK_ROOM_RESULT', payload: data })
  })

  socket.on('game_reset', (data) => {
    dispatch({ type: 'GAME_RESET', payload: data })
  })

  socket.on('game_over', (data) => {
    console.log('game over', data)
    dispatch({ type: 'GAME_OVER', payload: data })
  })

  socket.on('room_scores', (data) => {
    dispatch({ type: 'ROOM_SCORES', payload: data })
  })

  socket.on('mode_changed', (data) => {
    dispatch({ type: 'MODE_CHANGED', payload: data })
  })

  socket.on('disconnect', (data) => {
    dispatch({ type: 'PLAYER_LEFT', payload: data })
  })
}
