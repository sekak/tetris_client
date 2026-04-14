import Home from "./pages/home"
import { Routes, Route } from 'react-router'
import Lobby from "./pages/lobby"


function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lobby/:roomId" element={<Lobby />} />
    </Routes>
  )
}

export default App
