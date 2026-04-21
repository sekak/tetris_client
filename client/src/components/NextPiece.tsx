import { CELL_COLORS } from '../types/tetris'

const NextPiece = ({ piece }: { piece: any }) => {
  const cols = piece?.shape?.length
  const rows = piece?.shape[0]?.length
  console.log(cols, rows)

  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-400 flex w-full mb-3">NEXT</span>
      <div className="border bg-card rounded-sm  w-35 h-35 flex items-center justify-center">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 2rem)` }}>
          {piece?.shape?.flat().map((cell: number, i: number) => (
            <div
              key={i}
              className="w-8 h-8 border border-card"
              style={{ backgroundColor: cell ? CELL_COLORS[cell] : '' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default NextPiece
