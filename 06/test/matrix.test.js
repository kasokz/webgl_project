'use strict';
import Matrix from '../src/matrix.js';
import Vector from '../src/vector.js';

test('The identity matrix multiplied with the identity matrix should return the identity matrix', () => {
  const eye = Matrix.identity();

  expect(eye.mul(Matrix.identity())).toStrictEqual(Matrix.identity());
});

test('Matrix multiplied with a zero vector should return a zero vector', () => {
  const eye = Matrix.identity();
  expect(eye.mul(new Vector(0, 0, 0, 0))).toStrictEqual(new Vector(0, 0, 0, 0));
});
