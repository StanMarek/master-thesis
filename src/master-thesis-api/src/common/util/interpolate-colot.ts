function interpolateColor(value: number, min: number, max: number): string {
  const normalize = (value - min) / (max - min);

  const red = Math.round(255 * normalize);
  const blue = Math.round(255 * (1 - normalize));

  const redHex = red.toString(16).padStart(2, '0');
  const greenHex = '00';
  const blueHex = blue.toString(16).padStart(2, '0');

  return `#${redHex}${greenHex}${blueHex}`;
}
