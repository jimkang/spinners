function circleToPath({ r, cx, cy, numberOfArcs = 8 }) {
  const circlePortionAngle = (2 * Math.PI) / numberOfArcs;
  var path = `M ${cx} ${cy}\nm ${r} 0\n`;
  for (let arcIndex = 0; arcIndex < numberOfArcs - 1; ++arcIndex) {
    const rotation = (arcIndex + 1) * circlePortionAngle;
    const destX = cx + r * Math.cos(rotation);
    const destY = cy + r * Math.sin(rotation);
    path += `A ${r} ${r} 0 0 1 ${destX} ${destY}\n`;
  }
  path += `A ${r} ${r} 0 0 1 ${cx + r} ${cy}\n`;
  return path;
}

module.exports = circleToPath;
