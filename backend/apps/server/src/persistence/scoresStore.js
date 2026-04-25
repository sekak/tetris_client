'use strict'

const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')

const TOP_N = 10
const DEFAULT_FILE = path.resolve(__dirname, '../../data/scores.json')

function createScoresStore({ filePath = process.env.SCORES_FILE || DEFAULT_FILE } = {}) {
  let data = {}
  let writeQueue = Promise.resolve()

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8')
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        data = parsed
      }
    }
  } catch (err) {
    console.error('[scoresStore] failed to load file, starting empty:', err.message)
    data = {}
  }

  const persist = () => {
    const snapshot = JSON.stringify(data, null, 2)
    writeQueue = writeQueue.then(async () => {
      const tmp = `${filePath}.${process.pid}.tmp`
      try {
        await fsp.writeFile(tmp, snapshot, 'utf8')
        await fsp.rename(tmp, filePath)
      } catch (err) {
        console.error('[scoresStore] failed to write file:', err.message)
      }
    })
    return writeQueue
  }

  const sortAndTrim = (entries) =>
    [...entries]
      .sort((a, b) => b.score - a.score || b.linesCleared - a.linesCleared)
      .slice(0, TOP_N)

  return {
    getScores(roomId) {
      return data[roomId] ? [...data[roomId]] : []
    },

    addScores(roomId, entries) {
      if (!roomId || !Array.isArray(entries) || entries.length === 0) {
        return data[roomId] ? [...data[roomId]] : []
      }
      const cleaned = entries
        .filter((e) => e && typeof e.name === 'string' && Number.isFinite(e.score) && e.score > 0)
        .map((e) => ({
          name: String(e.name).slice(0, 32),
          score: Math.floor(e.score),
          level: Math.floor(e.level ?? 0),
          linesCleared: Math.floor(e.linesCleared ?? 0),
          isWinner: !!e.isWinner,
          finishedAt: e.finishedAt || new Date().toISOString(),
        }))

      if (cleaned.length === 0) {
        return data[roomId] ? [...data[roomId]] : []
      }

      const merged = sortAndTrim([...(data[roomId] || []), ...cleaned])
      data[roomId] = merged
      persist()
      return [...merged]
    },

    _flush() {
      return writeQueue
    },
  }
}

module.exports = { createScoresStore }
