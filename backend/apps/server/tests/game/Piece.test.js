'use strict';

const { PIECE_TYPES, createPiece, mulberry32, generatePieceSequence } = require('../../src/game/Piece');

describe('PIECE_TYPES', () => {
  test('contains 7 piece definitions', () => {
    expect(PIECE_TYPES).toHaveLength(7);
  });

  test('each piece has id, color, and shape', () => {
    PIECE_TYPES.forEach((pt) => {
      expect(pt).toHaveProperty('id');
      expect(pt).toHaveProperty('color');
      expect(pt).toHaveProperty('shape');
    });
  });

  test('piece IDs are 1–7', () => {
    const ids = PIECE_TYPES.map((pt) => pt.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('createPiece', () => {
  test('returns a piece with shape, x, y, id, color', () => {
    const piece = createPiece(0);
    expect(piece).toHaveProperty('shape');
    expect(piece).toHaveProperty('x');
    expect(piece).toHaveProperty('y');
    expect(piece).toHaveProperty('id');
    expect(piece).toHaveProperty('color');
  });

  test('y starts at 0', () => {
    expect(createPiece(0).y).toBe(0);
  });

  test('x centres the piece on a 10-wide grid', () => {
    for (let i = 0; i < PIECE_TYPES.length; i++) {
      const piece = createPiece(i);
      const cols = piece.shape[0].length;
      expect(piece.x).toBe(Math.floor((10 - cols) / 2));
    }
  });

  test('shape is a deep copy (mutations do not affect PIECE_TYPES)', () => {
    const piece = createPiece(0);
    piece.shape[0][0] = 999;
    expect(PIECE_TYPES[0].shape[0][0]).not.toBe(999);
  });

  test('typeIndex wraps correctly (mod 7)', () => {
    expect(createPiece(7).id).toBe(createPiece(0).id);
    expect(createPiece(8).id).toBe(createPiece(1).id);
  });
});

describe('mulberry32', () => {
  test('returns a function', () => {
    expect(typeof mulberry32(42)).toBe('function');
  });

  test('outputs values in [0, 1)', () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  test('same seed produces same sequence', () => {
    const a = mulberry32(777);
    const b = mulberry32(777);
    for (let i = 0; i < 20; i++) {
      expect(a()).toBe(b());
    }
  });

  test('different seeds produce different sequences', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });
});

describe('generatePieceSequence', () => {
  test('returns an array of the requested length', () => {
    expect(generatePieceSequence(42, 100)).toHaveLength(100);
  });

  test('all values are valid piece-type indices (0–6)', () => {
    const seq = generatePieceSequence(42, 200);
    expect(seq.every((v) => v >= 0 && v <= 6)).toBe(true);
  });

  test('same seed produces identical sequences', () => {
    const s1 = generatePieceSequence(99, 50);
    const s2 = generatePieceSequence(99, 50);
    expect(s1).toEqual(s2);
  });

  test('different seeds produce different sequences', () => {
    const s1 = generatePieceSequence(1, 50);
    const s2 = generatePieceSequence(2, 50);
    expect(s1).not.toEqual(s2);
  });

  test('default length is 1000', () => {
    expect(generatePieceSequence(0)).toHaveLength(1000);
  });
});
