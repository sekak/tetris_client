import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const controls = [
  { key: '←  →', action: 'Déplacer la pièce' },
  { key: '↑', action: 'Rotation' },
  { key: '↓', action: 'Chute rapide' },
  { key: 'ESPACE', action: 'Hard drop' },
  { key: 'ÉCHAP', action: 'Pause' },
]

const HowToPlay = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => setIsOpen(true)}
        className="text-muted font-pixel text-xs hover:text-primary transition-colors cursor-pointer"
      >
        [ COMMENT JOUER ? ]
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/70" />

            <motion.div
              className="relative z-10 bg-card border border-border w-80 p-6 flex flex-col gap-5"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-primary text-shadow-cyan text-sm font-pixel text-center">
                COMMENT JOUER
              </h2>

              <div className="flex flex-col gap-3">
                {controls.map(({ key, action }) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <span className="text-accent font-pixel text-xs bg-surface border border-border px-2 py-1 min-w-fit">
                      {key}
                    </span>
                    <span className="text-muted font-pixel text-xs text-right">{action}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <p className="text-muted font-pixel text-xs text-center leading-5">
                  Complète des lignes pour marquer des points.
                </p>
                <p className="text-muted font-pixel text-xs text-center leading-5">
                  Plus tu montes en niveau, plus ça va vite.
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-muted font-pixel text-xs hover:text-accent transition-colors cursor-pointer text-center"
              >
                [ FERMER ]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default HowToPlay
