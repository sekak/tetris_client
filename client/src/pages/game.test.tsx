import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../lib/socket', () => ({
  default: { emit: vi.fn(), on: vi.fn(), off: vi.fn(), once: vi.fn() },
}))

const useSelectorMock = vi.fn()
const useDispatchMock = vi.fn(() => vi.fn())
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) => useSelectorMock(selector),
  useDispatch: () => useDispatchMock(),
}))

vi.mock('react-router', () => ({
  useParams: () => ({ roomId: 'ROOM1', playerName: 'alice' }),
  useNavigate: () => vi.fn(),
}))

vi.mock('../components/TetrisBoard', () => ({
  default: () => <div data-testid="tetris-board" />,
}))
vi.mock('../components/NextPiece', () => ({
  default: () => <div data-testid="next-piece" />,
}))
vi.mock('../components/Opponents', () => ({
  default: () => <div data-testid="opponents" />,
}))
vi.mock('../components/GameOver', () => ({
  default: () => <div data-testid="game-over" />,
}))
vi.mock('../components/lobby', () => ({
  default: ({ LancerPartie }: { LancerPartie: () => void }) => (
    <button data-testid="lobby" onClick={LancerPartie}>
      lobby
    </button>
  ),
}))

import socket from '../lib/socket'
import Game from './game'

const baseState = {
  gameStarted: false,
  gameOver: false,
  isHost: false,
  socketId: 'sock-1',
  grid: Array.from({ length: 20 }, () => new Array(10).fill(0)),
  currentPiece: null,
  nextPiece: null,
  players: [],
  score: 0,
  level: 0,
  linesCleared: 0,
}

const renderWithState = (overrides: Partial<typeof baseState> = {}) => {
  const state = { ...baseState, ...overrides }
  useSelectorMock.mockImplementation((selector) => selector(state))
  render(<Game />)
}

describe('Game page', () => {
  beforeEach(() => {
    useSelectorMock.mockReset()
    vi.mocked(socket.emit).mockReset()
  })

  it('renders the Lobby when the game has not started', () => {
    renderWithState({ gameStarted: false })
    expect(screen.getByTestId('lobby')).toBeInTheDocument()
    expect(screen.queryByTestId('tetris-board')).toBeNull()
  })

  it('renders the in-game UI when gameStarted=true', () => {
    renderWithState({ gameStarted: true })
    expect(screen.getByTestId('tetris-board')).toBeInTheDocument()
    expect(screen.getByTestId('opponents')).toBeInTheDocument()
    expect(screen.queryByTestId('lobby')).toBeNull()
  })

  it('shows the room id and player name in the header', () => {
    renderWithState({ gameStarted: true })
    expect(document.body).toHaveTextContent('ROOM')
    expect(document.body).toHaveTextContent('ROOM1')
    expect(document.body).toHaveTextContent('PLAYER')
    expect(document.body).toHaveTextContent('alice')
  })

  it('shows NextPiece only when state.nextPiece is set', () => {
    renderWithState({ gameStarted: true, nextPiece: null })
    expect(screen.queryByTestId('next-piece')).toBeNull()
    useSelectorMock.mockReset()
    document.body.innerHTML = ''
    renderWithState({ gameStarted: true, nextPiece: { shape: [[1]] } as unknown as null })
    expect(screen.getByTestId('next-piece')).toBeInTheDocument()
  })

  it('does not show GameOver when gameOver=false', () => {
    renderWithState({ gameStarted: true, gameOver: false })
    expect(screen.queryByTestId('game-over')).toBeNull()
  })

  it('shows GameOver and REJOUER button for the host when gameOver=true', () => {
    renderWithState({ gameStarted: true, gameOver: true, isHost: true })
    expect(screen.getByTestId('game-over')).toBeInTheDocument()
    expect(screen.getByText('REJOUER')).toBeInTheDocument()
  })

  it('shows GameOver and waiting message for non-host when gameOver=true', () => {
    renderWithState({ gameStarted: true, gameOver: true, isHost: false })
    expect(screen.getByTestId('game-over')).toBeInTheDocument()
    expect(screen.queryByText('REJOUER')).toBeNull()
    expect(document.body).toHaveTextContent('En attente du host')
  })

  it('emits restart_game when host clicks REJOUER', () => {
    renderWithState({ gameStarted: true, gameOver: true, isHost: true })
    fireEvent.click(screen.getByText('REJOUER'))
    expect(socket.emit).toHaveBeenCalledWith('restart_game')
  })

  it('emits start_game when LancerPartie callback fires from Lobby', () => {
    renderWithState({ gameStarted: false })
    fireEvent.click(screen.getByTestId('lobby'))
    expect(socket.emit).toHaveBeenCalledWith('start_game')
  })
})
