import { motion } from 'framer-motion'
import Leaderboard from './Leaderboard'

const GameOver = ({ state }: { state: any }) => {
  const isWinner = state.winner ? state.socketId === state.winner.socketId : false

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 bg-card border border-border p-6 my-3"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.h1
        className={`text-2xl font-pixel ${
          isWinner ? 'text-accent text-shadow-yellow' : 'text-primary text-shadow-cyan'
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isWinner ? 'YOU WIN !' : 'GAME OVER'}
      </motion.h1>

      {state.winner && !isWinner && (
        <motion.p
          className="text-[10px] font-pixel text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          GAGNANT : <span className="text-accent">{state.winner.name}</span>
        </motion.p>
      )}

      <Leaderboard
        scores={state.roomScores || []}
        currentPlayerName={state.playerName}
        title="TOP SCORES — ROOM"
      />
    </motion.div>
  )
}

export default GameOver
