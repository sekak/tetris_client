import { io } from 'socket.io-client'

const socket = io()

export default socket

// import { io } from 'socket.io-client'
// import type { Dispatch } from 'redux'

// const socket = io()

// export function initSocketListeners(dispatch: Dispatch) {
//   socket.on('connect', () => {
//     dispatch({ type: 'SOCKET_CONNECTED', payload: { socketId: socket.id } })
//   })

//   socket.on('disconnect', () => {
//     dispatch({ type: 'SOCKET_DISCONNECTED' })
//   })

//   socket.on('room_joined', (data) => {
//     dispatch({ type: 'ROOM_JOINED', payload: data })
//   })

//   socket.on('player_joined', (data) => {
//     dispatch({ type: 'PLAYER_JOINED', payload: data })
//   })

//   socket.on('player_left', (data) => {
//     dispatch({ type: 'PLAYER_LEFT', payload: data })
//   })

//   socket.on('game_started', () => {
//     dispatch({ type: 'GAME_STARTED' })
//   })

//   socket.on('game_state', (data) => {
//     dispatch({
//       type: 'GAME_STATE_UPDATE',
//       payload: { ...data, socketId: socket.id },
//     })
//   })

//   socket.on('game_over', (data) => {
//     dispatch({ type: 'GAME_OVER', payload: data })
//   })

//   socket.on('game_reset', (data) => {
//     dispatch({ type: 'GAME_RESET', payload: data })
//   })

//   socket.on('error', (data) => {
//     dispatch({ type: 'SET_ERROR', payload: data })
//   })
// }

// export default socket
