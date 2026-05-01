import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../lib/socket', () => ({
  default: { emit: vi.fn(), once: vi.fn(), on: vi.fn(), off: vi.fn() },
}))

import socket from '../lib/socket'
import Lobby from './lobby'

const baseState = {
  players: [{ socketId: 'sock-1', name: 'alice', isHost: true, alive: true }],
  isHost: true,
  mode: 'normal',
  roomScores: [],
}

const renderLobby = (overrides: Partial<typeof baseState> = {}, lancer = vi.fn()) => {
  const state = { ...baseState, ...overrides }
  render(<Lobby state={state} roomId="ROOM1" playerName="alice" LancerPartie={lancer} />)
  return { lancer }
}

describe('Lobby Component', () => {
  beforeEach(() => {
    vi.mocked(socket.emit).mockReset()
  })

  it('emits join_room and get_scores on mount', () => {
    renderLobby()
    expect(socket.emit).toHaveBeenCalledWith('join_room', { roomId: 'ROOM1', playerName: 'alice' })
    expect(socket.emit).toHaveBeenCalledWith('get_scores', { roomId: 'ROOM1' })
  })

  it('renders the header and the players counter', () => {
    renderLobby()
    expect(screen.getByText('ROOM NAME')).toBeInTheDocument()
    expect(document.body).toHaveTextContent('JOUEURS (1/4)')
  })

  it('renders one list item per player', () => {
    renderLobby({
      players: [
        { socketId: 'sock-1', name: 'alice', isHost: true, alive: true },
        { socketId: 'sock-2', name: 'bob', isHost: false, alive: true },
        { socketId: 'sock-3', name: 'carol', isHost: false, alive: true },
      ],
    })
    expect(document.querySelectorAll('ul li')).toHaveLength(3)
    expect(document.body).toHaveTextContent('alice')
    expect(document.body).toHaveTextContent('bob')
    expect(document.body).toHaveTextContent('carol')
    expect(document.body).toHaveTextContent('JOUEURS (3/4)')
  })

  it('shows the LANCER LA PARTIE button only to the host', () => {
    renderLobby({ isHost: true })
    expect(screen.getByText('LANCER LA PARTIE')).toBeInTheDocument()
  })

  it('hides the LANCER LA PARTIE button for non-host players', () => {
    renderLobby({ isHost: false })
    expect(screen.queryByText('LANCER LA PARTIE')).toBeNull()
  })

  it('calls LancerPartie when host clicks LANCER LA PARTIE', () => {
    const { lancer } = renderLobby({ isHost: true })
    fireEvent.click(screen.getByText('LANCER LA PARTIE'))
    expect(lancer).toHaveBeenCalledTimes(1)
  })

  it('emits set_mode when host switches mode', () => {
    renderLobby({ isHost: true, mode: 'normal' })
    fireEvent.click(screen.getByText('RAPIDE'))
    expect(socket.emit).toHaveBeenCalledWith('set_mode', { mode: 'fast' })
  })

  it('does not emit set_mode when clicking the active mode', () => {
    renderLobby({ isHost: true, mode: 'normal' })
    vi.mocked(socket.emit).mockClear()
    fireEvent.click(screen.getByText('NORMAL'))
    expect(socket.emit).not.toHaveBeenCalledWith('set_mode', expect.anything())
  })

  it('disables the mode buttons for non-host players', () => {
    renderLobby({ isHost: false })
    expect(screen.getByText('NORMAL').closest('button')).toBeDisabled()
    expect(screen.getByText('RAPIDE').closest('button')).toBeDisabled()
  })

  it('does not emit set_mode when a non-host clicks a mode button', () => {
    renderLobby({ isHost: false, mode: 'normal' })
    vi.mocked(socket.emit).mockClear()
    // Even bypassing the disabled attribute (defensive), the handler returns early
    const btn = screen.getByText('RAPIDE').closest('button')!
    fireEvent.click(btn)
    expect(socket.emit).not.toHaveBeenCalledWith('set_mode', expect.anything())
  })

  it('renders the embedded Leaderboard with the historique title', () => {
    renderLobby()
    expect(document.body).toHaveTextContent('HISTORIQUE DE LA ROOM')
  })
})
