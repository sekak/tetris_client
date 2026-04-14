import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router'
import Button from '../components/ui/button'
import { socket } from '../lib/socket'

type Player = {
    socketId: string
    name: string
    isHost: boolean
    alive: boolean
}

const MAX_PLAYERS = 4

const Lobby = () => {
    const { roomId } = useParams<{ roomId: string }>()
    const location = useLocation()
    const playerName = (location.state as { playerName?: string })?.playerName ?? 'Guest'

    const [copied, setCopied] = useState(false)
    const [players, setPlayers] = useState<Player[]>([])
    const [isHost, setIsHost] = useState(false)

    const roomUrl = `${window.location.origin}/lobby/${roomId}`

    useEffect(() => {
        socket.connect()
        socket.emit('join_room', { roomId, playerName })

        socket.on('room_joined', ({ player, players: all }: { player: Player; players: Player[] }) => {
            setPlayers(all)
            setIsHost(player.isHost)
        })

        socket.on('player_joined', ({ player }: { player: Player }) => {
            setPlayers(prev => [...prev, player])
        })

        socket.on('error', ({ message }: { message: string }) => {
            console.error('[lobby]', message)
        })

        return () => {
            socket.off('room_joined')
            socket.off('player_joined')
            socket.off('error')
            socket.disconnect()
        }
    }, [roomId, playerName])

    const handleCopy = () => {
        navigator.clipboard.writeText(roomUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleStart = () => {
        socket.emit('start_game')
    }

    return (
        <main
            className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 bg-img">
            {/* Header */}
            <motion.h1
                className="text-3xl md:text-4xl text-primary text-shadow-cyan font-pixel text-center"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {roomId}
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
                    JOUEURS ({players.length}/{MAX_PLAYERS})
                </span>

                <ul className="flex flex-col gap-2">
                    {players.map((player, index) => (
                        <motion.li
                            key={player.socketId}
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.15 }}
                            className="flex items-center gap-2 text-xs text-foreground font-pixel"
                        >
                            <div className="w-2 h-2 rounded-full bg-primary box-shadow-cyan shrink-0" />
                            {player.name}{player.isHost ? ' 👑' : ''}
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
                <span className="text-primary text-[9px] font-pixel">
                    PARTAGE CE LIEN
                </span>

                <p
                    className="bg-card border border-border w-80 flex flex-col gap-3 p-5 text-[9px] text-gray-500 text-center"
                >
                    {roomUrl}
                </p>

                <Button
                    text={copied ? "LIEN COPIÉ !" : "COPIER LE LIEN"}
                    onClick={handleCopy}
                    variant="secondary"
                    isAnimate
                />

                {isHost && (
                    <Button
                        text="LANCER LA PARTIE"
                        onClick={handleStart}
                        variant="accent"
                        isAnimate
                    />
                )}

                <Button
                    text="← RETOUR"
                    onClick={() => window.history.back()}
                    variant="ghost"
                />
            </motion.div>
        </main>
    )
}

export default Lobby
