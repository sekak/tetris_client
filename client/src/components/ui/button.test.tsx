import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Button from './button'

describe('Button Component', () => {
  it('renders the text passed in', () => {
    render(<Button text="VALIDER" variant="primary" />)
    expect(document.querySelector('button')).toHaveTextContent('VALIDER')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button text="GO" variant="primary" onClick={onClick} />)
    fireEvent.click(document.querySelector('button')!)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<Button text="GO" variant="primary" onClick={onClick} disabled />)
    fireEvent.click(document.querySelector('button')!)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies the disabled class when disabled', () => {
    render(<Button text="X" variant="primary" disabled />)
    expect(document.querySelector('button')).toHaveClass('opacity-60')
    expect(document.querySelector('button')).toBeDisabled()
  })

  it.each([
    ['primary', 'bg-primary'],
    ['secondary', 'border-secondary'],
    ['accent', 'bg-accent'],
    ['ghost', 'bg-transparent'],
  ] as const)('applies the %s variant class', (variant, expectedClass) => {
    render(<Button text="X" variant={variant} />)
    expect(document.querySelector('button')).toHaveClass(expectedClass)
  })

  it('renders the animated variant when isAnimate=true', () => {
    const onClick = vi.fn()
    render(<Button text="ANIM" variant="accent" isAnimate onClick={onClick} />)
    const btn = document.querySelector('button')
    expect(btn).toHaveTextContent('ANIM')
    fireEvent.click(btn!)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
