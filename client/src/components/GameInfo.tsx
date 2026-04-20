import React from 'react'

const GameInfo = ({
  score,
  level,
  linesCleared,
}: {
  score: number
  level: number
  linesCleared: number
}) => {
  return (
    <div>
      <p>Score: {score}</p>
      <p>Level: {level}</p>
      <p>Lines Cleared: {linesCleared}</p>
    </div>
  )
}

export default GameInfo
