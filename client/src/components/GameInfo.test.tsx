import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GameInfo from './GameInfo'

describe('GameInfo Component', () => {
  it('renders the three labels', () => {
    render(<GameInfo score={0} level={0} linesCleared={0} />)
    expect(document.body).toHaveTextContent('SCORE')
    expect(document.body).toHaveTextContent('NIVEAU')
    expect(document.body).toHaveTextContent('LIGNES')
  })

  it('renders the values passed in', () => {
    render(<GameInfo score={1234} level={5} linesCleared={42} />)
    expect(document.body).toHaveTextContent('1234')
    expect(document.body).toHaveTextContent('5')
    expect(document.body).toHaveTextContent('42')
  })

  it('renders zeros when initial state', () => {
    render(<GameInfo score={0} level={0} linesCleared={0} />)
    const valueSpans = document.querySelectorAll('span.text-lg')
    expect(valueSpans).toHaveLength(3)
    valueSpans.forEach((s) => expect(s).toHaveTextContent('0'))
  })
})
