import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from './ui/button'
import Input from './ui/input'
import HowToPlay from './HowToPlay'

const generateRoomId = () =>
    Math.random().toString(36).slice(2, 8).toUpperCase()

const GameEntry = () => {
    const navigate = useNavigate()
    const [mode, setMode] = useState<'' | 'create' | 'join'>('')
    const [pseudo, setPseudo] = useState<string>('')
    const [gameCode, setGameCode] = useState<string>('')

    const handleCreation = () => {
        setMode('create')
    }

    const handleCreate = () => {
        if (!pseudo.trim()) return
        const roomId = generateRoomId()
        navigate(`/lobby/${roomId}`, { state: { playerName: pseudo.trim() } })
    }

    const handleJoin = () => {
        if (!pseudo.trim() || !gameCode.trim()) return
        navigate(`/lobby/${gameCode.trim().toUpperCase()}`, {
            state: { playerName: pseudo.trim() },
        })
    }

    return (
        <div className='flex flex-col gap-3 w-82 '>
            {mode === 'create' && (
                <p className="text-[10px] text-gray-400 text-justify">
                    En créant une partie, tu seras automatiquement redirigé dans le lobby d'attente. Partage le code de la partie à tes amis pour qu'ils puissent te rejoindre et affronter leurs compétences de Tetris !
                </p>
            )}
            {mode === 'create' || mode === 'join' ? (
                <Input
                    value={pseudo}
                    onChange={setPseudo}
                    placeholder="Ton pseudo..."
                    isAnimate
                    delay={0.2}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                />
            ) : null}

            {mode === 'join' && (
                <Input
                    value={gameCode}
                    onChange={setGameCode}
                    placeholder="Code de la partie..."
                    isAnimate
                    delay={0.1}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                />
            )}

            {mode === "" && <Button
                text="CRÉER UNE PARTIE"
                onClick={handleCreation}
                variant="primary"
                delay={0.1}
                isAnimate
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            />
            }

            {mode === "" && <Button
                text="REJOINDRE UNE PARTIE"
                onClick={() => setMode('join')}
                variant="secondary"
                delay={0.1}
                isAnimate
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            />
            }

            {mode === "create" && (
                <div className="flex flex-col gap-2">
                    <Button
                        text="CRÉER"
                        onClick={handleCreate}
                        variant="accent"
                        disabled={!pseudo.trim()}
                    />
                    <Button
                        text="← RETOUR"
                        onClick={() => setMode("")}
                        variant="ghost"
                    />
                </div>
            )}

            {mode === "join" && (
                <div className="flex flex-col gap-2">
                    <Button
                        text="REJOINDRE"
                        onClick={handleJoin}
                        variant="accent"
                        disabled={!gameCode.trim() || !pseudo.trim()}
                    />
                    <Button
                        text="← RETOUR"
                        onClick={() => setMode("")}
                        variant="ghost"
                    />
                </div>
            )}

            <HowToPlay />
        </div>
    )
}

export default GameEntry
