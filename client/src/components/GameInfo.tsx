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
    <div className="flex flex-col gap-3 mt-4">
      {[
        { label: 'SCORE', value: score, color: 'text-cyan-400' },
        { label: 'NIVEAU', value: level, color: 'text-yellow-400' },
        { label: 'LIGNES', value: linesCleared, color: 'text-white' },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          className="border border-gray-700 bg-card rounded-sm p-3 flex flex-col gap-1"
        >
          <span className="text-xs text-gray-400">{label}</span>
          <span className={`${color} text-lg font-bold`}>{value}</span>
        </div>
      ))}
    </div>
  )
}

export default GameInfo
