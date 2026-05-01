import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Opponents from './Opponents'

const makeOpponent = (
  overrides: Partial<{
    socketId: string
    name: string
    alive: boolean
    spectrum: number[]
  }> = {}
) => ({
  socketId: 'sock-2',
  name: 'bob',
  alive: true,
  spectrum: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ...overrides,
})

describe('Opponents Component', () => {
  it('shows "MODE SOLO" when there are no other players', () => {
    render(<Opponents players={[]} mySocketId="sock-1" />)
    expect(document.body).toHaveTextContent('MODE SOLO')
  })

  it('shows "MODE SOLO" when only self is in the players list', () => {
    const me = makeOpponent({ socketId: 'sock-1', name: 'alice' })
    render(<Opponents players={[me]} mySocketId="sock-1" />)
    expect(document.body).toHaveTextContent('MODE SOLO')
  })

  it('renders the ADVERSAIRES title and the opponent name when there is an opponent', () => {
    const me = makeOpponent({ socketId: 'sock-1', name: 'alice' })
    const bob = makeOpponent({ socketId: 'sock-2', name: 'bob' })
    render(<Opponents players={[me, bob]} mySocketId="sock-1" />)
    expect(document.body).toHaveTextContent('ADVERSAIRES')
    expect(document.body).toHaveTextContent('bob')
    expect(document.body).not.toHaveTextContent('alice')
  })

  it('renders one block per opponent', () => {
    const me = makeOpponent({ socketId: 'sock-1', name: 'alice' })
    const bob = makeOpponent({ socketId: 'sock-2', name: 'bob' })
    const carol = makeOpponent({ socketId: 'sock-3', name: 'carol' })
    render(<Opponents players={[me, bob, carol]} mySocketId="sock-1" />)
    expect(document.body).toHaveTextContent('bob')
    expect(document.body).toHaveTextContent('carol')
  })

  it('shows the skull and strike-through for a dead opponent', () => {
    const bob = makeOpponent({ socketId: 'sock-2', name: 'bob', alive: false })
    render(<Opponents players={[bob]} mySocketId="sock-1" />)
    expect(document.body).toHaveTextContent('💀')
    const nameSpan = Array.from(document.querySelectorAll('span')).find(
      (s) => s.textContent === 'bob'
    )
    expect(nameSpan).toHaveClass('line-through')
  })

  it('does not show the skull for an alive opponent', () => {
    const bob = makeOpponent({ socketId: 'sock-2', name: 'bob', alive: true })
    render(<Opponents players={[bob]} mySocketId="sock-1" />)
    expect(document.body).not.toHaveTextContent('💀')
  })

  it('renders a 200-cell spectrum mini-board (10x20) per opponent', () => {
    const bob = makeOpponent({
      socketId: 'sock-2',
      name: 'bob',
      spectrum: [3, 5, 0, 8, 12, 16, 1, 0, 4, 2],
    })
    render(<Opponents players={[bob]} mySocketId="sock-1" />)
    // SpectrumBoard renders BOARD_HEIGHT (20) * BOARD_WIDTH (10) = 200 cells.
    const grid = document.querySelector('div.grid')
    expect(grid).not.toBeNull()
    expect(grid?.children.length).toBe(200)
  })
})
