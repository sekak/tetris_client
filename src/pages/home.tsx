import { motion } from 'framer-motion'
import bgGrid from '../assets/background-grid.jpg'

const Home = () => {
    return (
        <div
            className='min-h-screen flex flex-col items-center justify-center gap-9 p-4'
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bgGrid})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <motion.h1
                className="text-5xl md:text-6xl text-primary text-glow-cyan text-center relative z-10 font-bold"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                TETRIS
            </motion.h1>

            <motion.p
                className="text-md text-secondary text-glow-magenta relative z-10"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                MULTIPLAYER BATTLE
            </motion.p>

            <div className='flex flex-col gap-5'>
                <motion.input
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    type='text' placeholder='Ton pseudo...'
          className="bg-card py-3 border-border text-foreground text-center text-xs font-pixel placeholder:text-muted-foreground"
                />
                <motion.button
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="w-full  bg-primary text-primary-foreground hover:bg-primary/80 text-md p-3 font-pixel box-glow-cyan"
                >
                    Jouer
                </motion.button>
            </div>

        </div>
    )
}

export default Home
