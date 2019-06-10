var b2d = require('basic-2d-math');

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
  return arcsToBezierPath(circleToArcs({ r, cx, cy, numberOfArcs }));
}

// Produces quadratic bezier curves.
// Does not work well if there are less than around six arcs.
function arcsToBezierPath({ center, edgeStart, arcs }) {
  var path = `M ${center.x + edgeStart.dx} ${center.y + edgeStart.dy}\n`;
  var firstControlPt = getFirstControlPt({
    center,
    edgeStart,
    firstArc: arcs[0],
    arcAngle: (2 * Math.PI) / arcs.length
  });
  path += `Q ${firstControlPt[0]} ${firstControlPt[1]}, ${arcs[0].destX} ${
    arcs[0].destY
  }\n`;
  for (let i = 1; i < arcs.length; ++i) {
    path += `T ${arcs[i].destX} ${arcs[i].destY}\n`;
  }
  return path;
}

// See diagram for derivation.
// Lots of assumptions here, the first being that the first arc
// starts at cx + r, cy (0 rads) on the circle.
function getFirstControlPt({ center, firstArc, arcAngle }) {
  const theta = arcAngle / 2;
  const r = firstArc.rx; // Assumes rx and ry are the same.
  const yDistToP = (r * Math.sin(theta)) / Math.cos(theta);
  return b2d.addPairs([center.x, center.y], [r, yDistToP]);
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

module.exports = { circleToPath, circleToArcs, arcsToPath, arcsToBezierPath };
