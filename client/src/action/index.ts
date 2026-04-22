import type { Dispatch } from 'redux'
import socket from '../lib/socket'

export const addSocketListener = (dispatch: Dispatch) => {
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
    // console.log(data)
    dispatch({ type: 'GAME_STATE_UPDATE', payload: data })
  })

  socket.on('check_room', (data) => {
    dispatch({ type: 'CHECK_ROOM_RESULT', payload: data })
  })
}
