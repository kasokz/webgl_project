const black = [0, 0, 0, 255];
const white = [255, 255, 255, 255];

/**
 * Determines the colour of a pixel (x, y) to create
 * a checkerboard pattern and saves it into the data array.
 * The data array holds the linearised pixel data of the target canvas
 * row major. Each pixel is of RGBA format.
 * @param  {Array.<number>} data - The linearised pixel array
 * @param  {number} x            - The x coordinate of the pixel
 * @param  {number} y            - The y coordinate of the pixel
 * @param  {number} width        - The width of the canvas
 * @param  {number} height       - The height of the canvas
 */
export function checkerboard(data, x, y, width, height) {
  let color;
  if (x % 2 === 0 && y % 2 === 0) {
    color = white;
  } else {
    color = black;
  }
  setColor(data, x, y, width, color);
}

/**
 * Determines the colour of a pixel (x, y) to create
 * a circle and saves it into the data array.
 * The data array holds the linearised pixel data of the target canvas
 * row major. Each pixel is of RGBA format.
 * @param  {Array.<number>} data - The linearised pixel array
 * @param  {number} x            - The x coordinate of the pixel
 * @param  {number} y            - The y coordinate of the pixel
 * @param  {number} width        - The width of the canvas
 * @param  {number} height       - The height of the canvas
 */
export function circle(data, x, y, width, height, radius) {
  const center = { x: width / 2, y: height / 2 };
  const distance = Math.abs(Math.sqrt((center.x - x) ** 2 + (center.y - y) ** 2));
  let color;
  if (distance <= radius) {
    color = black;
  } else {
    color = white;
  }
  setColor(data, x, y, width, color);
}

/**
 * Sets the color of the pixel (x, y) in the data array to the given color.
 * @param {Array.<number>} data
 * @param {number} x
 * @param {number} y
 * @param {Array.<number>} color
 */
function setColor(data, x, y, width, color) {
  data[width * y * 4 + 4 * x] = color[0];
  data[width * y * 4 + 4 * x + 1] = color[1];
  data[width * y * 4 + 4 * x + 2] = color[2];
  data[width * y * 4 + 4 * x + 3] = color[3];
}
