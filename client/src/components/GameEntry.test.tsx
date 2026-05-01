import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const navigateMock = vi.fn()
vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}))

vi.mock('../lib/socket', () => ({
  default: { emit: vi.fn(), once: vi.fn(), on: vi.fn(), off: vi.fn() },
}))

import socket from '../lib/socket'
import GameEntry from './GameEntry'

describe('GameEntry Component', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    vi.mocked(socket.emit).mockReset()
    vi.mocked(socket.once).mockReset()
  })

  it('shows the two starter buttons in initial mode', () => {
    render(<GameEntry />)
    expect(screen.getByText('CRÉER UNE PARTIE')).toBeInTheDocument()
    expect(screen.getByText('REJOINDRE UNE PARTIE')).toBeInTheDocument()
    expect(document.querySelector('input')).toBeNull()
  })

  describe('Create mode', () => {
    it('shows the pseudo input and CRÉER button after clicking CRÉER UNE PARTIE', () => {
      render(<GameEntry />)
      fireEvent.click(screen.getByText('CRÉER UNE PARTIE'))
      expect(document.querySelector('input[placeholder="Ton pseudo..."]')).not.toBeNull()
      expect(screen.getByText('CRÉER')).toBeInTheDocument()
    })

    it('disables CRÉER when pseudo is empty', () => {
      render(<GameEntry />)
      fireEvent.click(screen.getByText('CRÉER UNE PARTIE'))
      expect(screen.getByText('CRÉER').closest('button')).toBeDisabled()
    })

    it('navigates to /<roomId>/<pseudo> when CRÉER is clicked with a valid pseudo', () => {
      render(<GameEntry />)
      fireEvent.click(screen.getByText('CRÉER UNE PARTIE'))
      const input = document.querySelector('input[placeholder="Ton pseudo..."]') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'alice' } })
      fireEvent.click(screen.getByText('CRÉER'))
      expect(navigateMock).toHaveBeenCalledTimes(1)
      const url = navigateMock.mock.calls[0][0] as string
      expect(url).toMatch(/^\/[A-Z0-9]+\/alice$/)
    })

    it('returns to initial mode on RETOUR', () => {
      render(<GameEntry />)
      fireEvent.click(screen.getByText('CRÉER UNE PARTIE'))
      fireEvent.click(screen.getByText('← RETOUR'))
      expect(screen.getByText('CRÉER UNE PARTIE')).toBeInTheDocument()
      expect(document.querySelector('input')).toBeNull()
    })
  })

  describe('Join mode', () => {
    it('shows pseudo + gameCode inputs after clicking REJOINDRE UNE PARTIE', () => {
      render(<GameEntry />)
      fireEvent.click(screen.getByText('REJOINDRE UNE PARTIE'))
      expect(document.querySelector('input[placeholder="Ton pseudo..."]')).not.toBeNull()
      expect(document.querySelector('input[placeholder="Code de la partie..."]')).not.toBeNull()
    })

    it('disables REJOINDRE when either field is empty', () => {
      render(<GameEntry />)
      fireEvent.click(screen.getByText('REJOINDRE UNE PARTIE'))
      expect(screen.getByText('REJOINDRE').closest('button')).toBeDisabled()
    })

    it('emits check_room on click and navigates when room exists', () => {
      render(<GameEntry />)
      fireEvent.click(screen.getByText('REJOINDRE UNE PARTIE'))
      const pseudo = document.querySelector(
        'input[placeholder="Ton pseudo..."]'
      ) as HTMLInputElement
      const code = document.querySelector(
        'input[placeholder="Code de la partie..."]'
      ) as HTMLInputElement
      fireEvent.change(pseudo, { target: { value: 'bob' } })
      fireEvent.change(code, { target: { value: 'abc123' } })
      fireEvent.click(screen.getByText('REJOINDRE'))

      expect(socket.emit).toHaveBeenCalledWith('check_room', { roomId: 'ABC123' })

      // Capture the once-callback and simulate a server response
      const cb = vi.mocked(socket.once).mock.calls[0][1] as (data: {
        exists: boolean
        error: string | null
      }) => void
      act(() => cb({ exists: true, error: null }))

      expect(navigateMock).toHaveBeenCalledWith('/ABC123/bob')
    })

    it('shows the error message when the room does not exist', () => {
      render(<GameEntry />)
      fireEvent.click(screen.getByText('REJOINDRE UNE PARTIE'))
      const pseudo = document.querySelector(
        'input[placeholder="Ton pseudo..."]'
      ) as HTMLInputElement
      const code = document.querySelector(
        'input[placeholder="Code de la partie..."]'
      ) as HTMLInputElement
      fireEvent.change(pseudo, { target: { value: 'bob' } })
      fireEvent.change(code, { target: { value: 'xyz' } })
      fireEvent.click(screen.getByText('REJOINDRE'))

      const cb = vi.mocked(socket.once).mock.calls[0][1] as (data: {
        exists: boolean
        error: string | null
      }) => void
      act(() => cb({ exists: false, error: 'Room not found' }))

      expect(screen.getByText('Room not found')).toBeInTheDocument()
      expect(navigateMock).not.toHaveBeenCalled()
    })

    it('falls back to "Room introuvable" when no error message provided', () => {
      render(<GameEntry />)
      fireEvent.click(screen.getByText('REJOINDRE UNE PARTIE'))
      const pseudo = document.querySelector(
        'input[placeholder="Ton pseudo..."]'
      ) as HTMLInputElement
      const code = document.querySelector(
        'input[placeholder="Code de la partie..."]'
      ) as HTMLInputElement
      fireEvent.change(pseudo, { target: { value: 'bob' } })
      fireEvent.change(code, { target: { value: 'xyz' } })
      fireEvent.click(screen.getByText('REJOINDRE'))

      const cb = vi.mocked(socket.once).mock.calls[0][1] as (data: {
        exists: boolean
        error: string | null
      }) => void
      act(() => cb({ exists: false, error: null }))

      expect(screen.getByText('Room introuvable')).toBeInTheDocument()
    })
  })
})
