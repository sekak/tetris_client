import React from 'react'

const GameOver = ({ winner }: { winner: boolean }) => {
  return (
    <div>
      <h1>{winner ? 'You Win!' : 'Game Over'}</h1>
    </div>
  )
}

export default GameOver
