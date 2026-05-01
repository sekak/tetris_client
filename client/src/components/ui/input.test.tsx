import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Input from './input'

describe('Input Component', () => {
  it('renders with the given value', () => {
    render(<Input value="hello" onChange={() => {}} />)
    expect(document.querySelector('input')).toHaveValue('hello')
  })

  it('renders the placeholder', () => {
    render(<Input value="" onChange={() => {}} placeholder="Ton pseudo..." />)
    expect(document.querySelector('input')).toHaveAttribute('placeholder', 'Ton pseudo...')
  })

  it('calls onChange with the new value when typing', () => {
    const onChange = vi.fn()
    render(<Input value="" onChange={onChange} />)
    fireEvent.change(document.querySelector('input')!, { target: { value: 'alice' } })
    expect(onChange).toHaveBeenCalledWith('alice')
  })

  it('renders the animated variant when isAnimate=true', () => {
    const onChange = vi.fn()
    render(<Input value="x" onChange={onChange} isAnimate />)
    const input = document.querySelector('input')
    expect(input).toHaveValue('x')
    fireEvent.change(input!, { target: { value: 'xy' } })
    expect(onChange).toHaveBeenCalledWith('xy')
  })
})
