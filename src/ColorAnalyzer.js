const MIN_CHROMA = 20;

export default class ColorAnalyzer {
  async getDominantColor(imageUrl, width, height) {
    const image = new Image(width, height);
    image.crossOrigin = "Anonymous";
    image.src = imageUrl;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.getElementById("colorCanvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const canvasContext = canvas.getContext("2d");
        canvasContext.drawImage(image, 0, 0);

        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

        resolve(this._getDominantColor(imageData.data));
      };
    });
  }

  _getDominantColor(imageData) {
    let pixels = this._getPixels(imageData);

    pixels = pixels.filter(p => p.chroma >= MIN_CHROMA);
    const dominantChannel = this._getDominantChannel(pixels);

    pixels.sort((a, b) => a[dominantChannel] - b[dominantChannel]);

    const colors = this._medianCut(pixels, dominantChannel, 4);

    colors.sort((a, b) => b.chroma - a.chroma);

    return colors[0];
  }

  _getPixels(imageData) {
    const pixels = [];

    for (let i = 0; i < imageData.length; i += 4) {
      let pixel = {
        r: imageData[i],
        g: imageData[i + 1],
        b: imageData[i + 2]
      };

      this._setColorData(pixel);

      pixels.push(pixel);
    }

    return pixels;
  }

  _getDominantChannel(pixels) {
    let ranges = {
      r: [0, 0],
      g: [0, 0],
      b: [0, 0]
    }

    pixels.forEach(pixel => {
      ranges = {
        r: [Math.min(ranges.r[0], pixel.r), Math.max(ranges.r[1], pixel.r)],
        g: [Math.min(ranges.g[0], pixel.g), Math.max(ranges.g[1], pixel.g)],
        b: [Math.min(ranges.b[0], pixel.b), Math.max(ranges.b[1], pixel.b)]
      }
    });

    const bestChannel = Object.entries(ranges)
      .map(range => [range[0], range[1][1] - range[1][0]])
      .sort((a, b) => b[1] - a[1])[0][0];

    return bestChannel;
  }

  _medianCut(pixels, channel, divisions) {
    if (divisions === 1) {
      let combinedPixel = {
        r: 0,
        g: 0,
        b: 0
      };

      pixels.forEach(pixel => {
        combinedPixel.r += pixel.r;
        combinedPixel.g += pixel.g;
        combinedPixel.b += pixel.b;
      });

      combinedPixel = {
        r: combinedPixel.r / Math.max(pixels.length, 1),
        g: combinedPixel.g / Math.max(pixels.length, 1),
        b: combinedPixel.b / Math.max(pixels.length, 1)
      }

      this._setColorData(combinedPixel);

      return [combinedPixel];
    }

    let firstHalf = this._medianCut(pixels.slice(0, Math.floor(pixels.length / 2)), channel, divisions / 2);
    let secondHalf = this._medianCut(pixels.slice(Math.floor(pixels.length / 2)), channel, divisions / 2);

    return [...firstHalf, ...secondHalf];
  }

  _setColorData(pixel) {
    let values = [pixel.r, pixel.g, pixel.b];
    pixel.chroma = Math.max(...values) - Math.min(...values);
    pixel.brightness = values.reduce((a, b) => a + b) / 3;
  }
}