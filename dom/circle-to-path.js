function circleToArcs({ r, cx, cy, numberOfArcs = 8 }) {
  var center = { x: cx, y: cy };
  var edgeStart = { dx: r, dy: 0 };

  const circlePortionAngle = (2 * Math.PI) / numberOfArcs;
  var arcs = [];
  for (let arcIndex = 0; arcIndex < numberOfArcs - 1; ++arcIndex) {
    const rotation = (arcIndex + 1) * circlePortionAngle;
    const destX = cx + r * Math.cos(rotation);
    const destY = cy + r * Math.sin(rotation);
    arcs.push({ rx: r, ry: r, angle: 0, largeArc: 0, sweep: 1, destX, destY });
  }
  arcs.push({
    rx: r,
    ry: r,
    angle: 0,
    largeArc: 0,
    sweep: 1,
    destX: center.x + edgeStart.dx,
    destY: center.y + edgeStart.dy
  });
  return { center, edgeStart, arcs };
}

function circleToPath({ r, cx, cy, numberOfArcs = 8 }) {
  return arcsToPath(circleToArcs({ r, cx, cy, numberOfArcs }));
}

function arcsToPath({ center, edgeStart, arcs }) {
  var path = `M ${center.x} ${center.y}\nm ${edgeStart.dx} ${edgeStart.dy}\n`;
  path += arcs.map(arcToPathCmd).join(' ');
  return path;
}

function arcToPathCmd(arc) {
  return `A ${arc.rx} ${arc.ry} ${arc.angle} ${arc.largeArc} ${arc.sweep} ${
    arc.destX
  }, ${arc.destY}\n`;
}

module.exports = { circleToPath, circleToArcs, arcsToPath };
