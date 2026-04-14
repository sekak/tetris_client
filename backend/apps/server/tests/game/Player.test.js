'use strict';

const Player = require('../../src/game/Player');
const { generatePieceSequence } = require('../../src/game/Piece');
const { GRID_ROWS, GRID_COLS } = require('../../src/game/logic');

const SEQ = generatePieceSequence(1, 200);

describe('Player constructor', () => {
  let player;
  beforeEach(() => { player = new Player('sock1', 'Alice'); });

  test('stores socketId and name', () => {
    expect(player.socketId).toBe('sock1');
    expect(player.name).toBe('Alice');
  });

  test('isHost defaults to false', () => {
    expect(player.isHost).toBe(false);
  });

  test('alive defaults to false', () => {
    expect(player.alive).toBe(false);
  });

  test('grid is 20×10 all zeros', () => {
    expect(player.grid).toHaveLength(GRID_ROWS);
    expect(player.grid[0]).toHaveLength(GRID_COLS);
    expect(player.grid.flat().every((c) => c === 0)).toBe(true);
  });

  test('currentPiece and nextPiece are null', () => {
    expect(player.currentPiece).toBeNull();
    expect(player.nextPiece).toBeNull();
  });

  test('piececIndex, score, level, linesCleared start at 0', () => {
    expect(player.pieceIndex).toBe(0);
    expect(player.score).toBe(0);
    expect(player.level).toBe(0);
    expect(player.linesCleared).toBe(0);
  });

  test('spectrum is an array of 10 zeros', () => {
    expect(player.spectrum).toEqual(new Array(10).fill(0));
  });
});

describe('Player.spawnPiece', () => {
  let player;
  beforeEach(() => { player = new Player('s', 'P'); });

  test('first spawn sets currentPiece and nextPiece', () => {
    player.spawnPiece(SEQ);
    expect(player.currentPiece).not.toBeNull();
    expect(player.nextPiece).not.toBeNull();
  });

  test('first spawn advances pieceIndex by 2', () => {
    player.spawnPiece(SEQ);
    expect(player.pieceIndex).toBe(2);
  });

  test('second spawn shifts window: old nextPiece becomes currentPiece', () => {
    player.spawnPiece(SEQ);
    const firstNext = player.nextPiece;
    player.spawnPiece(SEQ);
    expect(player.currentPiece).toBe(firstNext);
  });

  test('second spawn advances pieceIndex by 1 more', () => {
    player.spawnPiece(SEQ);
    player.spawnPiece(SEQ);
    expect(player.pieceIndex).toBe(3);
  });

  test('two players with same sequence receive same pieces', () => {
    const p1 = new Player('a', 'A');
    const p2 = new Player('b', 'B');
    p1.spawnPiece(SEQ);
    p2.spawnPiece(SEQ);
    expect(p1.currentPiece.id).toBe(p2.currentPiece.id);
    expect(p1.nextPiece.id).toBe(p2.nextPiece.id);
  });

  test('sequence wraps around (index mod length)', () => {
    // exhaust the sequence
    const shortSeq = generatePieceSequence(42, 5);
    player.spawnPiece(shortSeq);
    player.spawnPiece(shortSeq); // index = 3
    player.spawnPiece(shortSeq); // index = 4
    // Next spawn reads index 4 (wraps to 4 % 5), then nextPiece at index 5 % 5 = 0
    player.spawnPiece(shortSeq);
    expect(player.pieceIndex).toBe(5); // 4 spawns * 1 inc (after first spawn) + 2 = 5
  });
});

describe('Player.toJSON', () => {
  test('returns a plain object with expected keys', () => {
    const player = new Player('id', 'Bob');
    const json = player.toJSON();
    const keys = ['socketId', 'name', 'isHost', 'alive', 'grid',
                  'currentPiece', 'nextPiece', 'score', 'level',
                  'linesCleared', 'spectrum'];
    keys.forEach((k) => expect(json).toHaveProperty(k));
  });

  test('does not expose internal fields (gravityTimer, pendingGarbage)', () => {
    const json = new Player('x', 'Y').toJSON();
    expect(json).not.toHaveProperty('gravityTimer');
    expect(json).not.toHaveProperty('pendingGarbage');
  });
});
