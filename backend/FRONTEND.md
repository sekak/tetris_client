# Red Tetris — Frontend Integration Guide

This document is written for the **frontend developer**.
It describes everything the backend exposes, how to connect, and exactly how to call each event.

---

## 1. Stack & Connection

The backend is a **Node.js + socket.io** server.
There is **no REST API** — all communication is done through **WebSocket events** via socket.io.

### Install the client library

```bash
npm install socket.io-client
```

### Connect to the server

```js
import { io } from 'socket.io-client'

const socket = io('http://localhost:4000')

socket.on('connect', () => {
  console.log('connected:', socket.id)
})
```

> The server runs on **port 4000** (`http://localhost:4000`).  
> CORS is open for `http://localhost:3000` (your Next.js dev port).

---

## 2. What the Backend Already Does For You

You do **not** need to implement any of this on the frontend:

| Done on server            | What it means for you                                               |
| ------------------------- | ------------------------------------------------------------------- |
| Piece gravity (auto-drop) | You never run a timer to move pieces down                           |
| Collision detection       | You never check if a move is valid before sending it                |
| Line clearing             | You never scan the grid — just render what you receive              |
| Garbage lines             | They appear automatically in the grid you receive                   |
| Piece sequence            | Every player gets the same pieces — you just display `currentPiece` |
| Score & level             | Calculated server-side, sent in every `game_state`                  |
| Winner detection          | Server fires `game_over` when the last player dies                  |
| Host reassignment         | Done automatically when host disconnects                            |

---

## 3. Data Structures

### Player object (received in most events)

```ts
{
  socketId: string,
  name: string,
  isHost: boolean,
  alive: boolean,
  grid: number[][],        // 20 rows × 10 cols
  currentPiece: Piece | null,
  nextPiece: Piece | null,
  score: number,
  level: number,
  linesCleared: number,
  spectrum: number[],      // array of 10 column heights (for other players' view)
}
```

### Piece object

```ts
{
  id: number,              // 1–7 (piece type)
  color: string,           // 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
  shape: number[][],       // 2D matrix — non-zero = filled cell
  x: number,               // current column on the grid
  y: number,               // current row on the grid
}
```

### Grid format

```
grid[row][col]

rows : 0 (top) → 19 (bottom)
cols : 0 (left) → 9  (right)

Cell values:
  0  = empty
  1  = I piece
  2  = O piece
  3  = T piece
  4  = S piece
  5  = Z piece
  6  = J piece
  7  = L piece
  8  = garbage line
```

---

## 4. All Socket Events

### Client → Server (you send these)

---

#### `join_room`

Call this when the player submits the join form.

```js
socket.emit('join_room', {
  roomId: 'my-room', // string, max 64 chars
  playerName: 'Alice', // string, max 32 chars
})
```

**Receives back:**

- `room_joined` (to you only)
- `player_joined` (to everyone else in the room)

---

#### `start_game`

Only the **host** can call this. Show the button only to `player.isHost === true`.

```js
socket.emit('start_game')
```

**Receives back:**

- `game_started` (to everyone in the room)

---

#### `move`

Send on **ArrowLeft**, **ArrowRight**, or **ArrowDown** keypress.

```js
socket.emit('move', { direction: 'left' }) // ArrowLeft
socket.emit('move', { direction: 'right' }) // ArrowRight
socket.emit('move', { direction: 'down' }) // ArrowDown (soft drop)
```

---

#### `rotate`

Send on **ArrowUp** (or whatever rotate key you choose).

```js
socket.emit('rotate')
```

---

#### `drop`

Send on **Space** for instant hard drop.

```js
socket.emit('drop')
```

---

#### `restart_game`

Only the **host** can call this, and only after a game has finished.

```js
socket.emit('restart_game')
```

**Receives back:**

- `game_reset` (to everyone in the room)

---

### Server → Client (you listen for these)

---

#### `room_joined`

Fired **only to you** when you successfully join a room.

```js
socket.on('room_joined', ({ roomId, player, players }) => {
  // player = your own player object
  // players = all players currently in the room (including you)
  // → navigate to the lobby / waiting screen
})
```

---

#### `player_joined`

Fired to **everyone already in the room** when a new player arrives.

```js
socket.on('player_joined', ({ player }) => {
  // → add player to the lobby player list
})
```

---

#### `game_started`

Fired to **everyone** when the host starts the game.

```js
socket.on('game_started', ({ players }) => {
  // → switch to the game screen
  // → render each player's grid
})
```

---

#### `game_state`

Fired **every 50 ms** to everyone while the game is running.
This is your main render loop — re-render on every event.

```js
socket.on('game_state', ({ roomId, status, players }) => {
  // status: 'waiting' | 'playing' | 'finished'
  // players: full array of all player objects
  //
  // → find your own player: players.find(p => p.socketId === socket.id)
  // → render your grid + current piece
  // → render other players' spectrums (their column heights)
})
```

---

#### `player_game_over`

Fired to **everyone** when a single player is eliminated (dies).

```js
socket.on('player_game_over', ({ socketId, name }) => {
  // → show "X was eliminated" message
  // → grey out that player's grid
})
```

---

#### `game_over`

Fired to **everyone** when the game ends (last player survives or everyone dies).

```js
socket.on('game_over', ({ winner, players }) => {
  // winner: player object of the winner, or null if everyone lost
  // players: final state of all players
  // → show winner screen
  // → show restart button to host
})
```

---

#### `game_reset`

Fired to **everyone** when the host restarts after a finished game.

```js
socket.on('game_reset', ({ players }) => {
  // → reset all grids to empty
  // → go back to the waiting / lobby screen
})
```

---

#### `player_left`

Fired to **everyone** when a player disconnects.

```js
socket.on('player_left', ({ socketId, name, newHost }) => {
  // newHost: player object of the new host (or null if room is empty)
  // → remove player from UI
  // → if newHost.socketId === socket.id → show Start button to you
})
```

---

#### `error`

Fired **only to you** when you send an invalid action.

```js
socket.on('error', ({ message }) => {
  // possible messages:
  //   "roomId and playerName are required"
  //   "Game already in progress"
  //   "Only the host can start the game"
  //   "Only the host can restart the game"
  // → show the message to the user
})
```

---

## 5. How to Render the Grid

The grid is a 2D array. Here is a minimal React example:

```jsx
function Grid({ grid, currentPiece }) {
  // Merge the falling piece into the grid for display
  const display = grid.map((row) => [...row])

  if (currentPiece) {
    currentPiece.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell !== 0) {
          const r = currentPiece.y + dy
          const c = currentPiece.x + dx
          if (r >= 0 && r < 20 && c >= 0 && c < 10) {
            display[r][c] = cell
          }
        }
      })
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 30px)' }}>
      {display.flat().map((cell, i) => (
        <div
          key={i}
          style={{
            width: 30,
            height: 30,
            background: COLORS[cell] ?? 'black',
            border: '1px solid #333',
          }}
        />
      ))}
    </div>
  )
}

const COLORS = {
  0: '#111', // empty
  1: '#00f0f0', // I
  2: '#f0f000', // O
  3: '#a000f0', // T
  4: '#00f000', // S
  5: '#f00000', // Z
  6: '#0000f0', // J
  7: '#f0a000', // L
  8: '#555', // garbage
}
```

---

## 6. How to Handle Keyboard Input

```js
useEffect(() => {
  const handleKey = (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        socket.emit('move', { direction: 'left' })
        break
      case 'ArrowRight':
        socket.emit('move', { direction: 'right' })
        break
      case 'ArrowDown':
        socket.emit('move', { direction: 'down' })
        break
      case 'ArrowUp':
        socket.emit('rotate')
        break
      case ' ':
        socket.emit('drop')
        break
    }
  }
  window.addEventListener('keydown', handleKey)
  return () => window.removeEventListener('keydown', handleKey)
}, [socket])
```

---

## 7. How to Render Other Players (Spectrum)

Instead of showing full grids for opponents, show their **spectrum** (column heights):

```js
// spectrum = [height0, height1, ..., height9]
// height is how many cells are filled from the bottom in that column
function Spectrum({ spectrum }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {spectrum.map((height, col) => (
        <div
          key={col}
          style={{
            width: 12,
            height: 200, // fixed container height
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ height: `${(height / 20) * 100}%`, background: '#888' }} />
        </div>
      ))}
    </div>
  )
}
```

---

## 8. Suggested Screen Flow

```
/ (home)
  → form: enter name + room ID
  → on submit: socket.emit('join_room', ...)

/lobby  (after room_joined)
  → show list of players
  → "Start Game" button (only if isHost)
  → listen for player_joined, player_left
  → on start_game click: socket.emit('start_game')

/game   (after game_started)
  → render own 20×10 grid (grid + currentPiece merged)
  → show nextPiece preview
  → show score, level, lines
  → show other players' spectrums
  → keyboard input sends move / rotate / drop
  → listen for game_state (re-render every 50ms)
  → listen for player_game_over (eliminate players from UI)
  → listen for game_over → go to /result

/result (after game_over)
  → show winner name
  → show final scores
  → "Play Again" button (only if isHost) → socket.emit('restart_game')
  → listen for game_reset → go back to /lobby
```
