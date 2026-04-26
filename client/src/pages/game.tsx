import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import socket from '../lib/socket'
import NextPiece from '../components/NextPiece'
import GameInfo from '../components/GameInfo'
import GameOver from '../components/GameOver'
import Lobby from '../components/lobby'
import TetrisBoard from '../components/TetrisBoard'
import Button from '../components/ui/button'

const Game = () => {
  const state = useSelector((state: any) => state)
  const { roomId, playerName } = useParams<{ roomId: string; playerName: string }>()

  const handleRelancer = () => {
    console.log('hna rejouer')
    socket.emit('restart_game')
  }

  const handleLancerPartie = () => {
    socket.emit('start_game')
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center w-full bg-img">
      {state.gameStarted ? (
        <>
          <div className="flex items-start gap-10">
            {/* opponents */}
            <span>opponents</span>
            {/* Main board */}
            <div className="flex flex-col gap-3">
              {/* header */}
              <div className="flex items-center justify-between bg-card border border-border px-4 py-3 w-81">
                <span className="text-[10px] font-pixel tracking-widest text-muted">
                  ROOM
                  <span className="text-primary text-shadow-cyan ml-1">{roomId}</span>
                </span>
                <span className="w-px h-4 bg-border" />
                <span className="text-[10px] font-pixel tracking-widest text-muted">
                  PLAYER
                  <span className="text-accent text-shadow-yellow ml-1">{playerName}</span>
                </span>
              </div>
              {/* board */}
              <TetrisBoard
                board={state.grid}
                currentPiece={state.currentPiece}
                ghostPiece={state.ghostPiece}
              />
            </div>
            {/* side panel */}
            <div className="w-75">
              {state.nextPiece && <NextPiece piece={state.nextPiece} />}
              <GameInfo score={state.score} level={state.level} linesCleared={state.linesCleared} />
              {state.gameOver && (
                <div>
                  <GameOver state={state} />
                  {state.isHost && state.gameOver ? (
                    <Button text="REJOUER" onClick={handleRelancer} variant="accent" isAnimate />
                  ) : (
                    <p className="text-muted text-[10px] font-pixel text-center mt-2">
                      En attente du host...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <Lobby
          playerName={playerName!}
          roomId={roomId!}
          state={state}
          LancerPartie={handleLancerPartie}
        />
      )}
    </div>
  )
}

export default Game
