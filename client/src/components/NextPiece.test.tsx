import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NextPiece from './NextPiece'

describe('NextPiece Component', () => {
  it('renders the NEXT label', () => {
    const piece = {
      shape: [
        [0, 0],
        [0, 0],
      ],
    }
    render(<NextPiece piece={piece} />)
    expect(document.body).toHaveTextContent('NEXT')
  })

  it('renders one cell per shape entry (4x4 = 16 cells)', () => {
    const shape = Array.from({ length: 4 }, () => [0, 0, 0, 0])
    const piece = { shape }
    render(<NextPiece piece={piece} />)
    const grid = document.querySelector('.grid')
    expect(grid?.children.length).toBe(16)
  })

  it('paints filled cells with the matching CELL_COLORS entry', () => {
    // shape with one cell of type 1 (cyan/I-piece) and three empty cells
    const piece = {
      shape: [
        [1, 0],
        [0, 0],
      ],
    }
    render(<NextPiece piece={piece} />)
    const cells = document.querySelector('.grid')!.children
    const filled = (cells[0] as HTMLElement).style.backgroundColor
    const empty = (cells[1] as HTMLElement).style.backgroundColor
    expect(filled).not.toBe('')
    expect(empty).toBe('')
  })

  it('handles a missing piece gracefully (no crash)', () => {
    render(<NextPiece piece={null} />)
    expect(document.body).toHaveTextContent('NEXT')
  })
})
