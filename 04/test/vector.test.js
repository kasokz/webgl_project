import Vector from '../src/vector';

test('Vector should have provided values after construction', () => {
  let vec = new Vector(0, 0, 0, 1);
  expect(vec.x).toBe(0);
  expect(vec.y).toBe(0);
  expect(vec.z).toBe(0);
  expect(vec.w).toBe(1);
});

test('X should be read- and writeable', () => {
  let vec = new Vector(0, 0, 0, 1);
  expect(vec.x).toBe(0);
  vec.x = 1;
  expect(vec.x).toBe(1);
});

test('Y should be read- and writeable', () => {
  let vec = new Vector(0, 0, 0, 1);
  expect(vec.y).toBe(0);
  vec.y = 1;
  expect(vec.y).toBe(1);
});
test('Z should be read- and writeable', () => {
  let vec = new Vector(0, 0, 0, 1);
  expect(vec.z).toBe(0);
  vec.z = 1;
  expect(vec.z).toBe(1);
});

test('W should be read- and writeable', () => {
  let vec = new Vector(0, 0, 0, 1);
  expect(vec.w).toBe(1);
  vec.w = 2;
  expect(vec.w).toBe(2);
});

test('Vector addition should add another vector correctly', () => {
  let vec = new Vector(0, 0, 0, 1);
  let vec2 = new Vector(1, 1, 1, 1);
  let addedVec = vec.add(vec2);
  expect(addedVec.x).toBe(1);
  expect(addedVec.y).toBe(1);
  expect(addedVec.z).toBe(1);
  expect(addedVec.w).toBe(2);
});

test('Vector length should be calculated correctly', () => {
  let vec = new Vector(0, 0, 0, 1);
  let length = vec.length;
  expect(length).toBe(1);
  vec = new Vector(0, 0, 0, 2);
  expect(vec.length).toBe(2);
});

test('Vector should normalize correctly', () => {
  let vec = new Vector(0, 0, 0, 2);
  let normalised = vec.normalised();
  expect(normalised.length).toBe(1);
});
