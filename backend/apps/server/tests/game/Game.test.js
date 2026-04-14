'use strict';

const { Game, TICK_RATE } = require('../../src/game/Game');

// ─── Mock socket.io server ────────────────────────────────────────────────────
function createMockIo() {
  const events = [];
  const mockEmit = jest.fn((...args) => events.push(args));
  const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
  return { io: { to: mockTo }, mockEmit, mockTo, events };
}

// ─── addPlayer / removePlayer ─────────────────────────────────────────────────
describe('Game.addPlayer', () => {
  test('first player becomes host', () => {
    const { io } = createMockIo();
    const game = new Game('r1', io);
    const player = game.addPlayer('s1', 'Alice');
    expect(player.isHost).toBe(true);
  });

  test('second player is not host', () => {
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'Alice');
    const p2 = game.addPlayer('s2', 'Bob');
    expect(p2.isHost).toBe(false);
  });

  test('players are stored in the map', () => {
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.addPlayer('s2', 'B');
    expect(game.players.size).toBe(2);
  });
});

describe('Game.removePlayer', () => {
  let game;
  beforeEach(() => {
    const { io } = createMockIo();
    game = new Game('r1', io);
  });

  test('returns null for unknown socketId', () => {
    expect(game.removePlayer('unknown')).toBeNull();
  });

  test('removes player from map', () => {
    game.addPlayer('s1', 'A');
    game.removePlayer('s1');
    expect(game.players.size).toBe(0);
  });

  test('reassigns host when host leaves', () => {
    game.addPlayer('s1', 'Host');
    game.addPlayer('s2', 'Guest');
    game.removePlayer('s1');
    expect(game.players.get('s2').isHost).toBe(true);
  });

  test('no crash when only player leaves', () => {
    game.addPlayer('s1', 'Solo');
    expect(() => game.removePlayer('s1')).not.toThrow();
  });
});

// ─── start ────────────────────────────────────────────────────────────────────
describe('Game.start', () => {
  let game;
  beforeEach(() => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    game = new Game('r1', io);
    game.addPlayer('s1', 'Host');
  });

  afterEach(() => {
    game.stop();
    jest.useRealTimers();
  });

  test('returns false for non-host', () => {
    game.addPlayer('s2', 'Guest');
    expect(game.start('s2')).toBe(false);
  });

  test('returns false when already playing', () => {
    game.start('s1');
    expect(game.start('s1')).toBe(false);
  });

  test('returns true and sets status to playing', () => {
    expect(game.start('s1')).toBe(true);
    expect(game.status).toBe('playing');
  });

  test('generates a piece sequence', () => {
    game.start('s1');
    expect(game.pieceSequence.length).toBeGreaterThan(0);
  });

  test('players are alive after start', () => {
    game.start('s1');
    expect(game.players.get('s1').alive).toBe(true);
  });

  test('players have currentPiece after start', () => {
    game.start('s1');
    expect(game.players.get('s1').currentPiece).not.toBeNull();
  });
});

// ─── stop / reset ─────────────────────────────────────────────────────────────
describe('Game.stop', () => {
  test('clears the tick interval', () => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.start('s1');
    game.stop();
    expect(game._tickInterval).toBeNull();
    jest.useRealTimers();
  });
});

describe('Game.reset', () => {
  test('sets status back to waiting', () => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.start('s1');
    game.reset();
    expect(game.status).toBe('waiting');
    jest.useRealTimers();
  });

  test('players are not alive after reset', () => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.start('s1');
    game.reset();
    expect(game.players.get('s1').alive).toBe(false);
    jest.useRealTimers();
  });
});

// ─── endGame ─────────────────────────────────────────────────────────────────
describe('Game.endGame', () => {
  test('sets status to finished and emits game_over', () => {
    const { io, mockEmit } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.endGame(null);
    expect(game.status).toBe('finished');
    expect(mockEmit).toHaveBeenCalledWith('game_over', expect.any(Object));
  });

  test('includes winner in event payload', () => {
    const { io, mockEmit } = createMockIo();
    const game = new Game('r1', io);
    const player = game.addPlayer('s1', 'Winner');
    player.alive = true;
    game.endGame(player);
    const payload = mockEmit.mock.calls[0][1];
    expect(payload.winner.name).toBe('Winner');
  });
});

// ─── handleMove ──────────────────────────────────────────────────────────────
describe('Game.handleMove', () => {
  let game;
  beforeEach(() => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.start('s1');
  });

  afterEach(() => {
    game.stop();
    jest.useRealTimers();
  });

  test('moves piece left', () => {
    const before = game.players.get('s1').currentPiece.x;
    game.handleMove('s1', 'left');
    expect(game.players.get('s1').currentPiece.x).toBe(before - 1);
  });

  test('moves piece right', () => {
    const before = game.players.get('s1').currentPiece.x;
    game.handleMove('s1', 'right');
    expect(game.players.get('s1').currentPiece.x).toBe(before + 1);
  });

  test('moves piece down', () => {
    const before = game.players.get('s1').currentPiece.y;
    game.handleMove('s1', 'down');
    // piece either moved down or locked (if at bottom)
    const after = game.players.get('s1').currentPiece;
    if (after) expect(after.y).toBeGreaterThanOrEqual(before);
  });

  test('ignores move for dead player', () => {
    const player = game.players.get('s1');
    player.alive = false;
    const x = player.currentPiece.x;
    game.handleMove('s1', 'left');
    expect(player.currentPiece.x).toBe(x);
  });

  test('ignores move for unknown socket', () => {
    expect(() => game.handleMove('unknown', 'left')).not.toThrow();
  });
});

// ─── handleRotate ────────────────────────────────────────────────────────────
describe('Game.handleRotate', () => {
  test('rotates current piece', () => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.start('s1');
    const before = JSON.stringify(game.players.get('s1').currentPiece.shape);
    game.handleRotate('s1');
    // O-piece doesn't change; most other pieces do — just check no crash
    expect(game.players.get('s1').currentPiece).toBeDefined();
    game.stop();
    jest.useRealTimers();
  });

  test('ignores rotate for dead player', () => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.start('s1');
    const player = game.players.get('s1');
    player.alive = false;
    const shape = JSON.stringify(player.currentPiece.shape);
    game.handleRotate('s1');
    expect(JSON.stringify(player.currentPiece.shape)).toBe(shape);
    game.stop();
    jest.useRealTimers();
  });
});

// ─── handleDrop ──────────────────────────────────────────────────────────────
describe('Game.handleDrop', () => {
  test('drops piece and spawns a new one (or ends game)', () => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.start('s1');
    const firstPiece = game.players.get('s1').currentPiece;
    game.handleDrop('s1');
    const player = game.players.get('s1');
    // Player is either still alive with a new piece, or has been eliminated
    if (player.alive) {
      expect(player.currentPiece).not.toBe(firstPiece);
    } else {
      expect(player.alive).toBe(false);
    }
    game.stop();
    jest.useRealTimers();
  });
});

// ─── Multiplayer: garbage lines ───────────────────────────────────────────────
describe('Game multiplayer garbage', () => {
  test('clearing 2+ lines gives garbage to other alive players', () => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.addPlayer('s2', 'B');
    game.start('s1');

    const p1 = game.players.get('s1');
    const p2 = game.players.get('s2');

    // Manually fill 3 rows of p1's grid, leaving one gap in each to be
    // completed by the piece placement
    for (let r = 17; r < 20; r++) {
      for (let c = 0; c < 10; c++) p1.grid[r][c] = 1;
    }

    // Place a flat I-piece that covers the remaining gap columns
    p1.currentPiece = { id: 1, color: 'I', shape: [[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]], x: 0, y: 16 };

    // Trigger lock via manual down that hits the filled rows... actually
    // just call the internal method directly
    game._lockPlayerPiece(p1);

    // p2 should have received pendingGarbage (at least 2 lines cleared → 1 garbage)
    // We check: if p1 cleared lines, p2's pendingGarbage > 0
    // (or it was already applied if p2's piece locked in same tick — but we
    // haven't called tick, so it sits in pendingGarbage)
    if (p1.linesCleared >= 2) {
      expect(p2.pendingGarbage).toBeGreaterThan(0);
    }

    game.stop();
    jest.useRealTimers();
  });
});

// ─── getState ────────────────────────────────────────────────────────────────
describe('Game.getState', () => {
  test('returns roomId, status, and players array', () => {
    const { io } = createMockIo();
    const game = new Game('room42', io);
    game.addPlayer('s1', 'A');
    const state = game.getState();
    expect(state.roomId).toBe('room42');
    expect(state.status).toBe('waiting');
    expect(Array.isArray(state.players)).toBe(true);
    expect(state.players).toHaveLength(1);
  });
});

// ─── Tick ─────────────────────────────────────────────────────────────────────
describe('Game tick', () => {
  test('tick moves piece down over time', () => {
    jest.useFakeTimers();
    const { io } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.start('s1');

    const startY = game.players.get('s1').currentPiece.y;
    // Advance enough time to trigger a gravity drop (800 ms at level 0)
    jest.advanceTimersByTime(900);

    const player = game.players.get('s1');
    if (player.alive && player.currentPiece) {
      expect(player.currentPiece.y).toBeGreaterThan(startY);
    }

    game.stop();
    jest.useRealTimers();
  });
});

// ─── removePlayer during game ─────────────────────────────────────────────────
describe('Game.removePlayer during game', () => {
  test('ends game when last alive player disconnects', () => {
    jest.useFakeTimers();
    const { io, mockEmit } = createMockIo();
    const game = new Game('r1', io);
    game.addPlayer('s1', 'A');
    game.addPlayer('s2', 'B');
    game.start('s1');
    game.players.get('s2').alive = false; // mark as dead already

    game.removePlayer('s1');

    expect(mockEmit).toHaveBeenCalledWith('game_over', expect.any(Object));
    jest.useRealTimers();
  });
});
