import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HowToPlay from './HowToPlay'

describe('HowToPlay Component', () => {
  it('should render the HowToPlay component', () => {
    render(<HowToPlay />)
    expect(document.querySelector('button')).toHaveTextContent('[ COMMENT JOUER ? ]')
  })

  it('should open the modal when the button is clicked, then close it', async () => {
    render(<HowToPlay />)

    fireEvent.click(document.getElementById('btn-1') as HTMLButtonElement)
    const heading = await screen.findByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('COMMENT JOUER')

    fireEvent.click(document.getElementById('btn-2') as HTMLButtonElement)
    // framer-motion <AnimatePresence> keeps the modal mounted during the exit
    // animation, so we wait for the heading to be fully removed.
    await waitForElementToBeRemoved(() => screen.queryByRole('heading', { level: 2 }))
  })
})
