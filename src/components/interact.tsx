import { useState } from 'react'
import Button from './button'
import Input from './input'
import HowToPlay from './HowToPlay'

const Interact = () => {

    const [mode, setMode] = useState<'' | 'create' | 'join'>('')
    const [pseudo, setPseudo] = useState<string>('')
    const [gameCode, setGameCode] = useState<string>('')

    console.log(mode)

    return (
        <div className='flex flex-col gap-3 w-82 '>
            <Input
                value={pseudo}
                onChange={setPseudo}
                placeholder="Ton pseudo..."
                isAnimate
                delay={0.8}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            />

            {mode === 'join' && (
                <Input
                    value={gameCode}
                    onChange={setGameCode}
                    placeholder="Code de la partie..."
                    isAnimate
                    delay={0.2}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                />
            )}

            {mode !== "join" && <Button
                text="CRÉER UNE PARTIE"
                onClick={() => setMode('create')}
                variant="primary"
                delay={0.6}
                isAnimate
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                disabled={!pseudo.trim()}
            />
            }

            {mode !== "join" && (
                <Button
                    text="REJOINDRE UNE PARTIE"
                    onClick={() => setMode('join')}
                    variant="secondary"
                    delay={0.7}
                    isAnimate
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                />
            )}

            {mode === "join" && (
                <div className="flex flex-col gap-2">
                    <Button
                        text="REJOINDRE"
                        onClick={() => { }}
                        variant="accent"
                        disabled={!gameCode.trim() || !pseudo.trim()}
                    />
                    <Button
                        text="← RETOUR"
                        onClick={() => setMode("create")}
                        variant="ghost"
                    />
                </div>
            )}
            
            <HowToPlay />
        </div>
    )
}

export default Interact
