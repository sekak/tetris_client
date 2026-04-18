import Home from './pages/home'
import { Routes, Route } from 'react-router'
import Game from './pages/game'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:roomId/:playerName" element={<Game />} />
    </Routes>
  )
}

export default App
