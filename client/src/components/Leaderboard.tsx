import { motion } from 'framer-motion'
import type { LeaderboardProps } from '../types/tetris'

const Leaderboard = ({
  scores,
  currentPlayerName = null,
  title = 'TOP SCORES',
}: LeaderboardProps) => {
  return (
    <motion.div
      className="bg-card border border-border w-80 flex flex-col gap-3 p-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <span className="text-accent text-shadow-yellow text-xs font-pixel">{title}</span>

      {scores.length === 0 ? (
        <p className="text-[10px] font-pixel text-muted">Aucun score enregistré</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {scores.map((entry, i) => {
            const isMe = currentPlayerName && entry.name === currentPlayerName
            return (
              <li
                key={`${entry.name}-${entry.finishedAt}-${i}`}
                className={`flex items-center justify-between text-[10px] font-pixel px-2 py-1 border ${
                  isMe ? 'border-primary text-primary' : 'border-transparent text-foreground'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-muted w-4 shrink-0">{i + 1}.</span>
                  <span className="truncate">{entry.name}</span>
                  {i === 0 && <span className="text-accent">👑</span>}
                </span>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="text-accent">{entry.score}</span>
                  <span className="text-muted">L{entry.linesCleared}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </motion.div>
  )
}

export default Leaderboard
