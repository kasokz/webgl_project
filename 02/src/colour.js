/**
 * Conducts a gamma adjustment with a given gamma value on the pixel
 * (x, y). The original colour information can be read from the source image.
 * The adjusted colour is to be saved in the dest array.
 * @param {number} gamma The gamma factor to adjust the brightness
 * @param {Array.<number>} source The original pixel data
 * @param {Array.<number>} dest The array to save the adjusted colour data to
 * @param {number} x The x coordinate of the pixel to adjust
 * @param {number} y The y coordinate of the pixel to adjust
 * @param {number} width The width of the image in pixels
 * @param {number} height The height of the image in pixels
 */
export function gammaAdjust(gamma, source, dest, x, y, width, height) {
  const index = 4 * width * y + 4 * x;
  const redCorrection = 255 * Math.pow(source[index] / 255, 1 / gamma);
  const greenCorrection = 255 * Math.pow(source[index + 1] / 255, 1 / gamma);
  const blueCorrection = 255 * Math.pow(source[index + 2] / 255, 1 / gamma);
  dest[index] = redCorrection;
  dest[index + 1] = greenCorrection;
  dest[index + 2] = blueCorrection;
}

/**
 * Converts the rgb colour information of the given pixel (x, y) into its cmyk
 * equivalent. Each component of the computed cmyk representation is then
 * separately converted back to rgb and saved into its own destination image.
 * @param {Array.<number>} data The source array containing the images
 *                              colour values
 * @param {number} x The x coordinate of the pixel to adjust
 * @param {number} y The y coordinate of the pixel to adjust
 * @param {number} width The width of the image in pixels
 * @param {number} height The height of the image in pixels
 * @param {Array.<number>} cData Destination array for the c component of the
 *                               cmyk decomposition converted to RGB
 * @param {Array.<number>} mData Destination array for the m component of the
 *                               cmyk decomposition converted to RGB
 * @param {Array.<number>} yData Destination array for the y component of the
 *                               cmyk decomposition converted to RGB
 * @param {Array.<number>} kData Destination array for the k component of the
 *                               cmyk decomposition converted to RGB
 */
export function cmyk(data, x, y, width, height, cData, mData, yData, kData) {
  const index = width * 4 * y + 4 * x;
  const red = data[index] / 255;
  const green = data[index + 1] / 255;
  const blue = data[index + 2] / 255;
  const K = 1 - Math.max(red, green, blue);
  const C = (1 - red - K) / (1 - K);
  const M = (1 - green - K) / (1 - K);
  const Y = (1 - blue - K) / (1 - K);
  drawCMYKAsRGB(cData, index, C, 0, 0, 0);
  drawCMYKAsRGB(mData, index, 0, M, 0, 0);
  drawCMYKAsRGB(yData, index, 0, 0, Y, 0);
  drawCMYKAsRGB(kData, index, 0, 0, 0, K);
}

const drawCMYKAsRGB = (data, index, c, m, y, k) => {
  data[index] = 255 * (1 - c) * (1 - k);
  data[index + 1] = 255 * (1 - m) * (1 - k);
  data[index + 2] = 255 * (1 - y) * (1 - k);
};
