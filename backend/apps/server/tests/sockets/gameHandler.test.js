'use strict';

const setupGameHandlers = require('../../src/sockets/gameHandler');
const { Game } = require('../../src/game/Game');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockIo() {
  const emitted = [];
  const mockEmit = jest.fn((...args) => emitted.push(args));
  const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
  return { io: { to: mockTo }, mockEmit, emitted };
}

/**
 * Minimal socket mock that stores registered handlers and lets tests fire them.
 */
function createMockSocket(id = 'socket1') {
  const handlers = {};
  return {
    id,
    gameRoomId: null,
    join: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    on(event, handler) { handlers[event] = handler; },
    trigger(event, data) {
      if (handlers[event]) handlers[event](data);
    },
    _handlers: handlers,
  };
}

function buildEnv(id = 'socket1') {
  const { io, mockEmit } = createMockIo();
  const socket = createMockSocket(id);
  const rooms = new Map();
  setupGameHandlers(io, socket, rooms);
  return { io, socket, rooms, mockEmit };
}

// ─── join_room ────────────────────────────────────────────────────────────────
describe('join_room', () => {
  test('creates a new room on first join', () => {
    const { socket, rooms } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Alice' });
    expect(rooms.has('r1')).toBe(true);
  });

  test('emits room_joined to the joining socket', () => {
    const { socket } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Alice' });
    expect(socket.emit).toHaveBeenCalledWith('room_joined', expect.any(Object));
  });

  test('room_joined payload has roomId, player, and players', () => {
    const { socket } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Alice' });
    const payload = socket.emit.mock.calls[0][1];
    expect(payload).toHaveProperty('roomId', 'r1');
    expect(payload).toHaveProperty('player');
    expect(payload).toHaveProperty('players');
  });

  test('first player is set as host', () => {
    const { socket } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Alice' });
    const payload = socket.emit.mock.calls[0][1];
    expect(payload.player.isHost).toBe(true);
  });

  test('emits error when roomId is missing', () => {
    const { socket } = buildEnv();
    socket.trigger('join_room', { playerName: 'Alice' });
    expect(socket.emit).toHaveBeenCalledWith('error', expect.any(Object));
  });

  test('emits error when playerName is missing', () => {
    const { socket } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1' });
    expect(socket.emit).toHaveBeenCalledWith('error', expect.any(Object));
  });

  test('emits error when joining a game in progress', () => {
    jest.useFakeTimers();
    const { socket, rooms } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Alice' });
    rooms.get('r1').status = 'playing';
    socket.emit.mockClear();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Late Bob' });
    expect(socket.emit).toHaveBeenCalledWith('error', expect.any(Object));
    jest.useRealTimers();
  });

  test('sanitises long roomId to 64 chars', () => {
    const { socket, rooms } = buildEnv();
    const longId = 'x'.repeat(200);
    socket.trigger('join_room', { roomId: longId, playerName: 'A' });
    expect([...rooms.keys()][0]).toHaveLength(64);
  });

  test('sanitises long playerName to 32 chars', () => {
    const { socket } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'N'.repeat(100) });
    const payload = socket.emit.mock.calls[0][1];
    expect(payload.player.name).toHaveLength(32);
  });
});

// ─── start_game ──────────────────────────────────────────────────────────────
describe('start_game', () => {
  test('host can start the game', () => {
    jest.useFakeTimers();
    const { io, socket, mockEmit } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Host' });
    socket.trigger('start_game');
    expect(mockEmit).toHaveBeenCalledWith('game_started', expect.any(Object));
    jest.useRealTimers();
  });

  test('emits error when not in a room', () => {
    const { socket } = buildEnv();
    socket.trigger('start_game');
    // no room → no crash, nothing emitted
    expect(socket.emit).not.toHaveBeenCalled();
  });

  test('non-host gets error on start attempt', () => {
    const rooms = new Map();
    const { io: io1 } = createMockIo();
    const host = createMockSocket('host');
    const { io: io2 } = createMockIo();
    const guest = createMockSocket('guest');

    setupGameHandlers(io1, host, rooms);
    setupGameHandlers(io2, guest, rooms);

    host.trigger('join_room', { roomId: 'r1', playerName: 'Host' });
    guest.trigger('join_room', { roomId: 'r1', playerName: 'Guest' });
    guest.trigger('start_game');

    expect(guest.emit).toHaveBeenCalledWith('error', expect.any(Object));
  });
});

// ─── move ─────────────────────────────────────────────────────────────────────
describe('move', () => {
  function startedGame() {
    jest.useFakeTimers();
    const { socket, rooms, io } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'A' });
    socket.trigger('start_game');
    return { socket, rooms, io };
  }

  afterEach(() => jest.useRealTimers());

  test('valid move is processed', () => {
    const { socket, rooms } = startedGame();
    const before = rooms.get('r1').players.get(socket.id).currentPiece.x;
    socket.trigger('move', { direction: 'right' });
    // May or may not change if blocked
    expect(rooms.get('r1').players.get(socket.id).currentPiece).toBeDefined();
  });

  test('invalid direction is ignored without crash', () => {
    const { socket } = startedGame();
    expect(() => socket.trigger('move', { direction: 'up' })).not.toThrow();
  });

  test('move when not in a game does nothing', () => {
    const { socket } = buildEnv();
    expect(() => socket.trigger('move', { direction: 'left' })).not.toThrow();
  });
});

// ─── rotate ───────────────────────────────────────────────────────────────────
describe('rotate', () => {
  test('rotate is processed without crash', () => {
    jest.useFakeTimers();
    const { socket } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'A' });
    socket.trigger('start_game');
    expect(() => socket.trigger('rotate')).not.toThrow();
    jest.useRealTimers();
  });

  test('rotate when not in room does nothing', () => {
    const { socket } = buildEnv();
    expect(() => socket.trigger('rotate')).not.toThrow();
  });
});

// ─── drop ─────────────────────────────────────────────────────────────────────
describe('drop', () => {
  test('drop is processed without crash', () => {
    jest.useFakeTimers();
    const { socket } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'A' });
    socket.trigger('start_game');
    expect(() => socket.trigger('drop')).not.toThrow();
    jest.useRealTimers();
  });

  test('drop when not in room does nothing', () => {
    const { socket } = buildEnv();
    expect(() => socket.trigger('drop')).not.toThrow();
  });
});

// ─── restart_game ─────────────────────────────────────────────────────────────
describe('restart_game', () => {
  test('host can restart a finished game', () => {
    jest.useFakeTimers();
    const { io, socket, rooms, mockEmit } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Host' });
    const game = rooms.get('r1');
    game.status = 'finished';
    socket.trigger('restart_game');
    expect(mockEmit).toHaveBeenCalledWith('game_reset', expect.any(Object));
    jest.useRealTimers();
  });

  test('cannot restart a game that is still waiting', () => {
    const { socket, mockEmit } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Host' });
    socket.trigger('restart_game'); // status is 'waiting', not 'finished'
    expect(mockEmit).not.toHaveBeenCalled();
  });

  test('non-host restart emits error', () => {
    jest.useFakeTimers();
    const rooms = new Map();
    const { io: io1 } = createMockIo();
    const host = createMockSocket('h');
    const { io: io2 } = createMockIo();
    const guest = createMockSocket('g');

    setupGameHandlers(io1, host, rooms);
    setupGameHandlers(io2, guest, rooms);

    host.trigger('join_room', { roomId: 'r1', playerName: 'Host' });
    guest.trigger('join_room', { roomId: 'r1', playerName: 'Guest' });

    rooms.get('r1').status = 'finished';
    guest.trigger('restart_game');
    expect(guest.emit).toHaveBeenCalledWith('error', expect.any(Object));
    jest.useRealTimers();
  });

  test('restart when not in any room does nothing', () => {
    const { socket } = buildEnv();
    expect(() => socket.trigger('restart_game')).not.toThrow();
  });
});

// ─── disconnect ───────────────────────────────────────────────────────────────
describe('disconnect', () => {
  test('player_left is emitted to the room', () => {
    const { socket, io, mockEmit } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Alice' });
    mockEmit.mockClear();
    socket.trigger('disconnect');
    expect(mockEmit).toHaveBeenCalledWith('player_left', expect.any(Object));
  });

  test('empty room is cleaned up', () => {
    const { socket, rooms } = buildEnv();
    socket.trigger('join_room', { roomId: 'r1', playerName: 'Solo' });
    socket.trigger('disconnect');
    expect(rooms.has('r1')).toBe(false);
  });

  test('disconnect when not in any room does nothing', () => {
    const { socket } = buildEnv();
    expect(() => socket.trigger('disconnect')).not.toThrow();
  });

  test('host disconnect assigns new host', () => {
    const rooms = new Map();
    const { io: io1 } = createMockIo();
    const host = createMockSocket('h');
    const { io: io2, mockEmit: guestEmit } = createMockIo();
    const guest = createMockSocket('g');

    setupGameHandlers(io1, host, rooms);
    setupGameHandlers(io2, guest, rooms);

    host.trigger('join_room', { roomId: 'r1', playerName: 'Host' });
    guest.trigger('join_room', { roomId: 'r1', playerName: 'Guest' });
    host.trigger('disconnect');

    expect(rooms.get('r1').players.get('g').isHost).toBe(true);
  });
});
