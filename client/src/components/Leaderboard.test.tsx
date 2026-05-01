import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Leaderboard from './Leaderboard'

// const makeScore =

describe('Leaderboard Component', () => {
  it('should render the leaderboard with no scores', () => {
    render(<Leaderboard scores={[]} />)
    expect(document.querySelector('p')).toHaveTextContent('Aucun score enregistré')
  })

  it('should render the leaderboard with scores', () => {
    const scores = [
      {
        name: 'Player1',
        score: 100,
        level: 5,
        linesCleared: 20,
        finishedAt: '2024-01-01T12:00:00Z',
      },
      {
        name: 'Player2',
        score: 150,
        level: 6,
        linesCleared: 25,
        finishedAt: '2024-01-02T12:00:00Z',
      },
    ]

    render(<Leaderboard scores={scores} />)

    const listItems = document.querySelectorAll('li')
    expect(listItems.length).toBe(2)
    expect(listItems[0]).toHaveTextContent('Player1')
    expect(listItems[0]).toHaveTextContent('100')
    expect(listItems[0]).toHaveTextContent('L20')
    expect(listItems[1]).toHaveTextContent('Player2')
    expect(listItems[1]).toHaveTextContent('150')
    expect(listItems[1]).toHaveTextContent('L25')
  })

  it('should highlight the current player', () => {
    const scores = [
      {
        name: 'Player1',
        score: 100,
        level: 5,
        linesCleared: 20,
        finishedAt: '2024-01-01T12:00:00Z',
      },
      {
        name: 'Player2',
        score: 150,
        level: 6,
        linesCleared: 25,
        finishedAt: '2024-01-02T12:00:00Z',
      },
    ]

    render(<Leaderboard scores={scores} currentPlayerName="Player1" />)

    const listItems = document.querySelectorAll('li')
    expect(listItems[0]).toHaveClass('border-primary')
    expect(listItems[0]).toHaveClass('text-primary')
    expect(listItems[1]).not.toHaveClass('border-primary')
    expect(listItems[1]).not.toHaveClass('text-primary')
  })

  it('should display the title', () => {
    render(<Leaderboard scores={[]} title="Custom Title" />)
    expect(document.querySelector('span')).toHaveTextContent('Custom Title')
  })

  it('should display the default title when none is provided', () => {
    render(<Leaderboard scores={[]} />)
    expect(document.querySelector('span')).toHaveTextContent('TOP SCORES')
  })

  it('shows the crown only on the first entry', () => {
    const scores = [
      {
        name: 'Player1',
        score: 100,
        level: 5,
        linesCleared: 20,
        finishedAt: '2024-01-01T12:00:00Z',
      },
      {
        name: 'Player2',
        score: 150,
        level: 6,
        linesCleared: 25,
        finishedAt: '2024-01-02T12:00:00Z',
      },
    ]

    render(<Leaderboard scores={scores} />)

    const listItems = document.querySelectorAll('li')
    expect(listItems[0]).toHaveTextContent('👑')
    expect(listItems[1]).not.toHaveTextContent('👑')
  })
})
