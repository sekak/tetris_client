import { motion } from 'framer-motion'
import bgGrid from '../assets/background-grid.jpg'
import Interact from '../components/interact'

const Home = () => {
    return (
        <main
            className='min-h-screen flex flex-col items-center justify-center gap-9 p-4'
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bgGrid})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <motion.h1
                className="text-5xl md:text-6xl text-primary text-shadow-cyan text-center relative z-10 font-bold"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                TETRIS
            </motion.h1>

            <motion.p
                className="text-md text-secondary text-shadow-magenta relative z-10"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                MULTIPLAYER BATTLE
            </motion.p>

            {/* Interact component for user input and button */}
            <Interact />
            
        </main>
    )
}

export default Home
