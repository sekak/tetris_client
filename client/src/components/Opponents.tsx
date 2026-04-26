import { motion } from 'framer-motion'
import { BOARD_HEIGHT, BOARD_WIDTH } from '../types/tetris'

type OpponentPlayer = {
  socketId: string
  name: string
  alive: boolean
  spectrum: number[]
}

type OpponentsProps = {
  players: OpponentPlayer[]
  mySocketId: string | null
}

const heightColor = (height: number) => {
  if (height === 0) return 'bg-transparent border border-border/30'
  if (height <= 7) return 'bg-green-500'
  if (height <= 14) return 'bg-yellow-400'
  return 'bg-red-500'
}

const SpectrumBoard = ({ spectrum }: { spectrum: number[] }) => {
  const cells = []
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      const height = spectrum[col] ?? 0
      const filled = row >= BOARD_HEIGHT - height
      cells.push(
        <div
          key={`${row}-${col}`}
          className={`w-1.5 h-1.5 ${filled ? heightColor(height) : 'bg-card border border-border/20'}`}
        />
      )
    }
  }
  return (
    <div
      className="grid gap-px bg-border p-px"
      style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))` }}
    >
      {cells}
    </div>
  )
}

const Opponents = ({ players, mySocketId }: OpponentsProps) => {
  const opponents = (players || []).filter((p) => p.socketId !== mySocketId)

  if (opponents.length === 0) {
    return (
      <div className="w-32 flex items-center justify-center">
        <p className="text-muted text-[10px] font-pixel text-center">MODE SOLO</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="text-accent text-shadow-yellow text-[10px] font-pixel">ADVERSAIRES</span>
      {opponents.map((opp) => (
        <motion.div
          key={opp.socketId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-2 text-[10px] font-pixel">
            <span className={opp.alive ? 'text-foreground' : 'text-muted line-through'}>
              {opp.name}
            </span>
            {!opp.alive && <span>💀</span>}
          </div>
          <SpectrumBoard spectrum={opp.spectrum || []} />
        </motion.div>
      ))}
    </div>
  )
}

export default Opponents
