import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import GameOver from './GameOver'

describe('GameOver Component', () => {
  it('shows "YOU WIN !" when the current player is the winner', () => {
    const state = {
      socketId: 'sock-1',
      playerName: 'alice',
      winner: { name: 'alice', socketId: 'sock-1' },
      roomScores: [],
    }
    render(<GameOver state={state} />)
    expect(document.querySelector('h1')).toHaveTextContent('YOU WIN !')
  })

  it('shows "GAME OVER" + GAGNANT line when someone else won', () => {
    const state = {
      socketId: 'sock-1',
      playerName: 'alice',
      winner: { name: 'bob', socketId: 'sock-2' },
      roomScores: [],
    }
    render(<GameOver state={state} />)
    expect(document.querySelector('h1')).toHaveTextContent('GAME OVER')
    expect(document.body).toHaveTextContent('GAGNANT')
    expect(document.body).toHaveTextContent('bob')
  })

  it('shows "GAME OVER" without GAGNANT line when there is no winner (solo)', () => {
    const state = {
      socketId: 'sock-1',
      playerName: 'alice',
      winner: null,
      roomScores: [],
    }
    render(<GameOver state={state} />)
    expect(document.querySelector('h1')).toHaveTextContent('GAME OVER')
    expect(document.body).not.toHaveTextContent('GAGNANT')
  })

  it('renders the embedded Leaderboard with the room title', () => {
    const state = {
      socketId: 'sock-1',
      playerName: 'alice',
      winner: null,
      roomScores: [],
    }
    render(<GameOver state={state} />)
    expect(document.body).toHaveTextContent('TOP SCORES — ROOM')
  })
})
