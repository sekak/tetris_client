import { motion } from 'framer-motion'
import { useEffect } from 'react'
import Button from './ui/button'
import socket from '../lib/socket'
import Copier from './ui/copierLink'

const MAX_PLAYERS = 4

type LobbyProps = {
  state: any
  roomId: string
  playerName: string
  LancerPartie: () => void
}

const Lobby = ({ state, roomId, playerName, LancerPartie }: LobbyProps) => {
  const joueurs = state.players
  const roomUrl = window.location.href

  useEffect(() => {
    socket.emit('join_room', { roomId, playerName })
  }, [])

  return (
    <main className="flex flex-col items-center gap-8 py-10">
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
          {joueurs.map((player: any, i: number) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
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
        <Copier text={roomUrl} title="PARTAGE LE LIEN DE LA ROOM" />
        <Copier text={roomId!} title="PARTAGE LE ROOM ID" />

        {state.isHost && (
          <Button text="LANCER LA PARTIE" onClick={LancerPartie} variant="accent" isAnimate />
        )}

        <Button text="← RETOUR" onClick={() => window.history.back()} variant="ghost" />
      </motion.div>
    </main>
  )
}

export default Lobby
