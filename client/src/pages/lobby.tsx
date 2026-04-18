import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Button from '../components/ui/button'
import { useSelector } from 'react-redux'
import socket from '../lib/socket'
import { useParams } from 'react-router'

const MAX_PLAYERS = 4

const Lobby = () => {
  const state = useSelector((state: any) => state)
  const { roomId, playerName } = useParams<{ roomId: string; playerName: string }>()

  const [copied, setCopied] = useState(false)
  const joueurs = state.players
  const roomUrl = window.location.href

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    console.log('verfier roomId au cas de rejoindre', roomId)
    socket.emit('join_room', { roomId, playerName }, (data: any) => {
      console.log('Joined room:', data)
    })
  }, [])

  console.log(state)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 bg-img">
      {/* Header */}
      <motion.h1
        className="text-3xl md:text-4xl text-primary text-shadow-cyan font-pixel text-center"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        ROOM NAME
      </motion.h1>

      <motion.p
        className="text-xs text-muted font-pixel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        En attente des joueurs...
      </motion.p>

      {/* Players card */}
      <motion.div
        className="bg-card border border-border w-80 flex flex-col gap-4 p-5"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-accent text-shadow-yellow text-xs font-pixel">
          JOUEURS ({joueurs.length}/{MAX_PLAYERS})
        </span>

        <ul className="flex flex-col gap-2">
          {joueurs.map((player: any, index: number) => (
            <motion.li
              key={player.id}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.15 }}
              className="flex items-center gap-2 text-xs text-foreground font-pixel"
            >
              <div className="w-2 h-2 rounded-full bg-primary box-shadow-cyan shrink-0" />
              {player.name}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Share section */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-primary text-[9px] font-pixel">PARTAGE CE LIEN</span>

        <p className="bg-card border border-border w-80 flex flex-col gap-3 p-5 text-[9px] text-gray-500 text-center">
          {roomUrl}
        </p>
        <span className="text-primary text-[9px] font-pixel">PARATAGE ROOM ID</span>

        <p className="bg-card border border-border w-80 flex flex-col gap-3 p-5 text-[9px] text-gray-500 text-center">
          {roomId}
        </p>

        <Button
          text={copied ? 'LIEN COPIÉ !' : 'COPIER LE LIEN'}
          onClick={handleCopy}
          variant="secondary"
          isAnimate
        />

        {state.isHost && (
          <Button
            text="LANCER LA PARTIE"
            // onClick={handle}
            variant="accent"
            isAnimate
          />
        )}

        <Button text="← RETOUR" onClick={() => window.history.back()} variant="ghost" />
      </motion.div>
    </main>
  )
}

export default Lobby
