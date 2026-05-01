import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import Copier from './copierLink'

describe('Copier Component', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    writeText.mockReset()
    // jsdom does not provide navigator.clipboard — mock it.
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the title and text', () => {
    render(<Copier text="ABC123" title="ROOM ID" />)
    expect(screen.getByText('ROOM ID')).toBeInTheDocument()
    expect(screen.getByText('ABC123')).toBeInTheDocument()
  })

  it('shows the copy icon (⧉) initially', () => {
    render(<Copier text="ABC123" title="ROOM ID" />)
    expect(document.body).toHaveTextContent('⧉')
    expect(document.body).not.toHaveTextContent('✓')
  })

  it('writes the text to clipboard when clicked', () => {
    render(<Copier text="ABC123" title="ROOM ID" />)
    fireEvent.click(screen.getByText('ABC123').parentElement!)
    expect(writeText).toHaveBeenCalledWith('ABC123')
  })

  it('shows the check icon (✓) after click and reverts after 2 seconds', () => {
    render(<Copier text="ABC123" title="ROOM ID" />)
    fireEvent.click(screen.getByText('ABC123').parentElement!)
    expect(document.body).toHaveTextContent('✓')
    expect(document.body).not.toHaveTextContent('⧉')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(document.body).toHaveTextContent('⧉')
    expect(document.body).not.toHaveTextContent('✓')
  })
})
