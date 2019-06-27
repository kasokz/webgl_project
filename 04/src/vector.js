/**
 * Class representing a vector in 4D space
 */
export default class Vector {
  /**
   * Create a vector
   * @param  {number} x - The x component
   * @param  {number} y - The y component
   * @param  {number} z - The z component
   * @param  {number} w - The w component
   */
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * Returns the x component of the vector
   * @return {number} The x component of the vector
   */
  get x() {
    return this._x;
  }

  /**
   * Sets the x component of the vector to val
   * @param  {number} val - The new value
   */
  set x(val) {
    this._x = val;
  }

  /**
   * Returns the first component of the vector
   * @return {number} The first component of the vector
   */
  get r() {
    return this.x;
  }

  /**
   * Sets the first component of the vector to val
   * @param  {number} val - The new value
   */
  set r(val) {
    this.x = val;
  }

  /**
   * Returns the y component of the vector
   * @return {number} The y component of the vector
   */
  get y() {
    return this._y;
  }

  /**
   * Sets the y component of the vector to val
   * @param  {number} val - The new value
   */
  set y(val) {
    this._y = val;
  }

  /**
   * Returns the second component of the vector
   * @return {number} The second component of the vector
   */
  get g() {
    return this.y;
  }

  /**
   * Sets the second component of the vector to val
   * @param  {number} val - The new value
   */
  set g(val) {
    this.y = val;
  }

  /**
   * Returns the z component of the vector
   * @return {number} The z component of the vector
   */
  get z() {
    return this._z;
  }

  /**
   * Sets the z component of the vector to val
   * @param  {number} val - The new value
   */
  set z(val) {
    this._z = val;
  }

  /**
   * Returns the third component of the vector
   * @return {number} The third component of the vector
   */
  get b() {
    return this.z;
  }

  /**
   * Sets the third component of the vector to val
   * @param  {number} val - The new value
   */
  set b(val) {
    this.z = val;
  }

  /**
   * Returns the w component of the vector
   * @return {number} The w component of the vector
   */
  get w() {
    return this._w;
  }

  /**
   * Sets the w component of the vector to val
   * @param  {number} val - The new value
   */
  set w(val) {
    this._w = val;
  }

  /**
   * Returns the fourth component of the vector
   * @return {number} The fourth component of the vector
   */
  get a() {
    return this.w;
  }

  /**
   * Sets the fourth component of the vector to val
   * @param  {number} val - The new value
   */
  set a(val) {
    this.w = val;
  }

  /**
   * Creates a new vector with the vector added
   * @param {Vector} other - The vector to add
   * @return {Vector}        The new vector;
   */
  add(other) {
    return new Vector(
      this.x + other.x,
      this.y + other.y,
      this.z + other.z,
      1);
  }

  /**
   * Creates a new vector with the vector subtracted
   * @param {Vector} other - The vector to subtract
   * @return {Vector}        The new vector
   */
  sub(other) {
    return new Vector(
      this.x - other.x,
      this.y - other.y,
      this.z - other.z,
      1);
  }

  /**
   * Creates a new vector with the scalar multiplied
   * @param {number} other - The scalar to multiply
   * @return {Vector}        The new vector
   */
  mul(other) {
    return new Vector(
      this.x * other,
      this.y * other,
      this.z * other,
      1);
  }

  /**
 * Creates a new vector with the scalar multiplied
 * @param {Vector} other - The vector to multiply
 * @return {Vector}        The new vector
 */
  elementMul(other) {
    return new Vector(
      this.x * other.x,
      this.y * other.y,
      this.z * other.z,
      1);
  }

  /**
   * Creates a new vector with the scalar divided
   * @param {number} other - The scalar to divide
   * @return {Vector}        The new vector
   */
  div(other) {
    return new Vector(
      this.x / other,
      this.y / other,
      this.z / other,
      1);
  }

  /**
   * Dot product
   * @param {Vector} other - The vector to calculate the dot product with
   * @return {number}        The result of the dot product
   */
  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  /**
   * Cross product
   * @param {Vector} other - The vector to calculate the cross product with
   * @return {Vector}        The result of the cross product as new Vector
   */
  cross(other) {
    return new Vector(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
      1 //TODO: is this right?
    );
  }

  /**
   * Returns an array representation of the vector
   * @return {Array.<number>} An array representation.
   */
  valueOf() {
    return [this.x, this.y, this.z, this.w];
  }

  /**
   * Creates a new vector by normalising the vector
   * @return {Vector} A vector with length 1
   */
  normalised() {
    return this.div(this.length);
  }

  /**
   * Compares the vector to another
   * @param  {Vector} other - The vector to compare to.
   * @return {Boolean}        True if the vectors carry equal numbers. The fourth element may be both equivalent to undefined to still return true.
   */
  equals(other) {
    return (this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w)
  }

  /**
   * Calculates the length of the vector
   * @return {number} The length of the vector
   */
  get length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
  }
}