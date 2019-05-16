/**
 * Draws a line from pointA to pointB on the canvas
 * with the DDA algorithm.
 * @param  {Array.<number>} data   - The linearised pixel array
 * @param  {Array.<number>} pointA - The start point of the line
 * @param  {Array.<number>} pointB - The end point of the line
 * @param  {number} width          - The width of the canvas
 * @param  {number} height         - The height of the canvas
 */
export function dda(data, pointA, pointB, width, height) {
  let [p1x, p1y] = pointA;
  let [p2x, p2y] = pointB;
  // setPixel(data, p1x, p1y, width);
  // setPixel(data, p2x, p2y, width);
  const [centerX, centerY] = [width / 2, height / 2];
  let m = (p2y - centerY) / (p2x - centerX);
  if (Math.abs(p2y - centerY) > Math.abs(p2x - centerX)) {
    if (p2y > p1y) {
      for (let y = p1y; y < p2y; y++) {
        setPixel(data, Math.round((y - centerY) / m + centerX), y, width);
      }
    } else {
      for (let y = p1y; y > p2y; y--) {
        setPixel(data, Math.round((y - centerY) / m + centerX), y, width);
      }
    }
  } else {
    if (p2x > p1x) {
      for (let x = p1x; x < p2x; x++) {
        setPixel(data, x, Math.round(m * (x - centerX) + centerY), width);
      }
    } else {
      for (let x = p1x; x > p2x; x--) {
        setPixel(data, x, Math.round(m * (x - centerX) + centerY), width);
      }
    }
  }
}

/**
 * Draws a line from pointA to pointB on the canvas
 * with the Bresenham algorithm.
 * @param  {Array.<number>} data   - The linearised pixel array
 * @param  {Array.<number>} pointA - The start point of the line
 * @param  {Array.<number>} pointB - The end point of the line
 * @param  {number} width          - The width of the canvas
 * @param  {number} height         - The height of the canvas
 */
export function bresenham(data, pointA, pointB, width, height) {
  let [p1x, p1y] = pointA;
  let [p2x, p2y] = pointB;
  const dx = Math.abs(p2x - p1x);
  const dy = Math.abs(p2y - p1y);
  setPixel(data, p1x, p1y, width);
  setPixel(data, p2x, p2y, width);
  const stepX = p1x < p2x ? 1 : -1;
  const stepY = p1y < p2y ? 1 : -1;
  let error = dx - dy;
  while (p1x !== p2x || p1y !== p2y) {
    const e2 = error * 2;
    if (e2 > -dy) {
      error -= dy;
      p1x += stepX;
    }
    if (e2 < dx) {
      error += dx;
      p1y += stepY;
    }
    setPixel(data, p1x, p1y, width);
  }
}

const setPixel = (data, x, y, width) => {
  const index = 4 * (width * y + x);
  data[index] = 0;
  data[index + 1] = 0;
  data[index + 2] = 0;
  data[index + 3] = 255;
};
