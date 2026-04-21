import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import socket from '../lib/socket'
import TetrisBoard from '../components/Board'
import NextPiece from '../components/NextPiece'
import GameInfo from '../components/GameInfo'
import GameOver from '../components/GameOver'
import Lobby from '../components/lobby'

const Game = () => {
  const state = useSelector((state: any) => state)
  const { roomId, playerName } = useParams<{ roomId: string; playerName: string }>()

  const handleLancerPartie = () => {
    socket.emit('start_game')
  }

  console.log(state)

  return (
    <div className="h-screen flex flex-col items-center justify-center w-full bg-img">
      {state.gameStarted ? (
        <>
          {/* header */}
          <div className="flex items-center gap-6 mb-10">
            <span className="text-xs tracking-widest text-gray-400">
              ROOM <span className="text-cyan-400 font-bold">{roomId}</span>
            </span>
            <span className="text-xs text-gray-400">
              Player: <span className="text-white font-semibold">{playerName}</span>
            </span>
          </div>

          <div className="flex items-start gap-10">
            {/* opponents */}
            <span>opponents</span>
            {/* Main board */}
            <div>
              <TetrisBoard
                board={state.grid}
                currentPiece={state.currentPiece}
                ghostPiece={state.ghostPiece}
              />
            </div>
            {/* side panel */}
            <div>
              {state.nextPiece && <NextPiece piece={state.nextPiece} />}
              <GameInfo score={state.score} level={state.level} linesCleared={state.linesCleared} />
              {state.gameOver && (
                <div>
                  <GameOver winner={state.winner} />
                  {state.isHost ? (
                    <button onClick={handleLancerPartie}>REJOUER</button>
                  ) : (
                    <p>En attente du host...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <Lobby
          roomId={roomId!}
          playerName={playerName!}
          LancerPartie={handleLancerPartie}
          state={state}
        />
      )}
    </div>
  )
}

export default Game

// import { useEffect } from 'react'
// import { useParams } from 'react-router'
// import { useSelector } from 'react-redux'
// import { motion } from 'framer-motion'
// import socket from '../lib/socket'
// import Board, { CELL_COLORS } from '../components/Board'
// import type { Opponent, Piece } from '../types/tetris'

// // ─── Spectre adversaire ──────────────────────────────────────────────────────

// const SpectrumView = ({ opponent }: { opponent: Opponent }) => (
//   <div className="flex flex-col items-center gap-1">
//     <span
//       className="text-[8px] font-pixel"
//       style={{
//         color: opponent.alive ? 'oklch(92% 0.05 192)' : 'oklch(40% 0.03 240)',
//         textDecoration: opponent.alive ? 'none' : 'line-through',
//       }}
//     >
//       {opponent.name}
//     </span>
//     <div
//       style={{
//         display: 'flex',
//         alignItems: 'flex-end',
//         gap: 2,
//         height: 80,
//         padding: 4,
//         border: '1px solid oklch(28% 0.04 240)',
//         backgroundColor: 'oklch(17% 0.04 240)',
//       }}
//     >
//       {opponent.spectrum.map((height, i) => (
//         <div
//           key={i}
//           style={{
//             width: 6,
//             height: `${(height / 20) * 100}%`,
//             backgroundColor: opponent.alive
//               ? 'oklch(78% 0.17 192)'
//               : 'oklch(40% 0.03 240)',
//             flexShrink: 0,
//           }}
//         />
//       ))}
//     </div>
//   </div>
// )

// // ─── Aperçu pièce suivante ───────────────────────────────────────────────────

// const NextPieceView = ({ piece }: { piece: Piece }) => {
//   const grid = Array.from({ length: 4 }, () => Array(4).fill(null))
//   piece.shape.forEach((row, r) => {
//     row.forEach((cell: number, c: number) => {
//       if (cell && r < 4 && c < 4) grid[r][c] = piece.type
//     })
//   })
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//       {grid.map((row, r) => (
//         <div key={r} style={{ display: 'flex', gap: 2 }}>
//           {row.map((cell: string | null, c: number) => (
//             <div
//               key={c}
//               style={{
//                 width: 14,
//                 height: 14,
//                 backgroundColor: cell
//                   ? CELL_COLORS[cell]
//                   : 'oklch(17% 0.04 240)',
//               }}
//             />
//           ))}
//         </div>
//       ))}
//     </div>
//   )
// }

// // ─── Page principale ─────────────────────────────────────────────────────────

// const Game = () => {
//     console.log("game")
//   const { roomId, playerName } = useParams<{ roomId: string; playerName: string }>()
//   const state = useSelector((s: any) => s)
//   const {
//     players, isHost, gameStarted, gameOver,
//     board, currentPiece, nextPiece,
//     opponents, score, level, linesCleared,
//     winner, error,
//   } = state

//   // Rejoindre la room au montage
//   useEffect(() => {
//     if (roomId && playerName) {
//       socket.emit('join_room', { roomId, playerName })
//     }
//   }, [roomId, playerName])

//   // Contrôles clavier pendant la partie
//   useEffect(() => {
//     if (!gameStarted) return
//     const handleKeyDown = (e: KeyboardEvent) => {
//       switch (e.key) {
//         case 'ArrowLeft':
//           e.preventDefault()
//           socket.emit('move', { direction: 'left' })
//           break
//         case 'ArrowRight':
//           e.preventDefault()
//           socket.emit('move', { direction: 'right' })
//           break
//         case 'ArrowDown':
//           e.preventDefault()
//           socket.emit('move', { direction: 'down' })
//           break
//         case 'ArrowUp':
//           e.preventDefault()
//           socket.emit('rotate')
//           break
//         case ' ':
//           e.preventDefault()
//           socket.emit('drop')
//           break
//       }
//     }
//     window.addEventListener('keydown', handleKeyDown)
//     return () => window.removeEventListener('keydown', handleKeyDown)
//   }, [gameStarted])

//   // ── Game Over ──────────────────────────────────────────────────────────────
//   if (gameOver) {
//     return (
//       <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 bg-img">
//         <motion.h1
//           className="text-4xl text-primary text-shadow-cyan font-pixel"
//           initial={{ scale: 0.5, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           GAME OVER
//         </motion.h1>

//         {winner && (
//           <motion.p
//             className="text-accent text-shadow-yellow font-pixel text-sm"
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.3 }}
//           >
//             GAGNANT : {winner}
//           </motion.p>
//         )}

//         {isHost && (
//           <motion.button
//             className="font-pixel text-xs text-foreground border border-border px-6 py-3 hover:bg-card transition"
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.5 }}
//             onClick={() => socket.emit('restart_game')}
//           >
//             REJOUER
//           </motion.button>
//         )}

//         {!isHost && (
//           <p className="text-muted text-[9px] font-pixel">
//             En attente du host pour rejouer...
//           </p>
//         )}
//       </main>
//     )
//   }

//   // ── Partie en cours ────────────────────────────────────────────────────────
//   if (gameStarted) {
//     return (
//       <main className="min-h-screen flex items-center justify-center gap-6 p-4 bg-img">
//         {/* Adversaires (spectres) */}
//         <div className="flex flex-col gap-4 min-w-16">
//           {opponents.map((opp: Opponent) => (
//             <SpectrumView key={opp.name} opponent={opp} />
//           ))}
//         </div>

//         {/* Grille principale */}
//         <Board board={board} currentPiece={currentPiece} />

//         {/* Stats + pièce suivante */}
//         <div className="flex flex-col gap-3">
//           {[
//             { label: 'SCORE', value: score, color: 'text-primary text-shadow-cyan' },
//             { label: 'NIVEAU', value: level, color: 'text-accent text-shadow-yellow' },
//             { label: 'LIGNES', value: linesCleared, color: 'text-foreground' },
//           ].map(({ label, value, color }) => (
//             <div key={label} className="bg-card border border-border p-3 flex flex-col gap-1">
//               <span className="text-[8px] text-muted font-pixel">{label}</span>
//               <span className={`${color} text-sm font-pixel`}>{value}</span>
//             </div>
//           ))}

//           {nextPiece && (
//             <div className="bg-card border border-border p-3 flex flex-col gap-2">
//               <span className="text-[8px] text-muted font-pixel">SUIVANT</span>
//               <NextPieceView piece={nextPiece} />
//             </div>
//           )}
//         </div>
//       </main>
//     )
//   }

//   // ── Lobby (attente) ────────────────────────────────────────────────────────
//   return (
//     <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4 bg-img">
//       <motion.h1
//         className="text-3xl text-primary text-shadow-cyan font-pixel text-center"
//         initial={{ y: -40, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.6 }}
//       >
//         {roomId}
//       </motion.h1>

//       <motion.p
//         className="text-xs text-muted font-pixel"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.3 }}
//       >
//         En attente des joueurs...
//       </motion.p>

//       {error && (
//         <p className="text-destructive text-xs font-pixel">{error}</p>
//       )}

//       {/* Liste des joueurs */}
//       <motion.div
//         className="bg-card border border-border w-80 flex flex-col gap-4 p-5"
//         initial={{ y: 40, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.4 }}
//       >
//         <span className="text-accent text-shadow-yellow text-xs font-pixel">
//           JOUEURS ({players.length}/4)
//         </span>
//         <ul className="flex flex-col gap-2">
//           {players.map((p: any) => (
//             <li
//               key={p.socketId}
//               className="flex items-center gap-2 text-xs text-foreground font-pixel"
//             >
//               <div className="w-2 h-2 rounded-full bg-primary box-shadow-cyan shrink-0" />
//               {p.name}
//               {p.isHost && (
//                 <span className="text-accent text-[8px] ml-1">HOST</span>
//               )}
//             </li>
//           ))}
//         </ul>
//       </motion.div>

//       {/* Lien à partager */}
//       <motion.div
//         className="flex flex-col items-center gap-3"
//         initial={{ y: 40, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ delay: 0.6 }}
//       >
//         <span className="text-primary text-[9px] font-pixel">PARTAGE CE LIEN</span>
//         <p className="bg-card border border-border w-80 p-4 text-[9px] text-muted text-center font-pixel break-all">
//           {window.location.href}
//         </p>

//         {!isHost ? (
//           <button
//             className="font-pixel text-xs text-foreground border border-border px-6 py-3 hover:bg-card transition"
//             onClick={() => socket.emit('start_game')}
//           >
//             LANCER LA PARTIE
//           </button>
//         ) : (
//           <p className="text-muted text-[9px] font-pixel">
//             En attente du host...
//           </p>
//         )}

//         <button
//           className="font-pixel text-[9px] text-muted hover:text-foreground transition mt-1"
//           onClick={() => window.history.back()}
//         >
//           ← RETOUR
//         </button>
//       </motion.div>
//     </main>
//   )
// }

// export default Game
