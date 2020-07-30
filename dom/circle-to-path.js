var b2d = require('basic-2d-math');
const numberOfArcs = require('./number-of-arcs');
var shouldDisplaySublayout = require('./should-display-sublayout');

function centerDistForSpinner(spinner) {
  const isRotatingViaCSS = !shouldDisplaySublayout(spinner); // || isNaN(spinner.data.orbitR);

  // Using the upper left corner as the center of the circle
  // in order to align with the hack in renderSpinners
  // that needs to put the center in the upper left
  // corner instead of in the center so it can rotate
  // the spinner via CSS.
  // Except for spinners that display a sublayout while also
  // in orbit! Those do not rotate in that way, so their
  // centers should be in the proper center at (r, r).
  return isRotatingViaCSS ? 0 : spinner.r;
}

function pathCircleForSpinner(spinner) {
  const centerDist = centerDistForSpinner(spinner);
  return circleToPath({
    r: spinner.r,
    cx: centerDist,
    cy: centerDist,
    numberOfArcs,
    extrusionR: spinner.data.extrusionR
  });
}

function arcsCircleForSpinner({ spinner, r }) {
  const centerDist = centerDistForSpinner(spinner);
  return circleToArcs({ r, cx: centerDist, cy: centerDist, numberOfArcs });
}

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

function circleToPath({ r, cx, cy, numberOfArcs = 8, extrusionR }) {
  return arcsToBezierPath(
    circleToArcs({ r, cx, cy, numberOfArcs }),
    extrusionR
  );
}

// Produces quadratic bezier curves.
// Does not work well if there are less than around six arcs.
function arcsToBezierPath({ center, edgeStart, arcs }, extrusionR) {
  var path = `M ${(center.x + edgeStart.dx).toPrecision(4)} ${(
    center.y + edgeStart.dy
  ).toPrecision(4)}\n`;
  var firstControlPt = getFirstControlPt({
    center,
    edgeStart,
    extrusionR,
    arcAngle: (2 * Math.PI) / arcs.length
  });
  path += `Q ${firstControlPt[0].toPrecision(
    4
  )} ${firstControlPt[1].toPrecision(4)}, ${arcs[0].destX.toPrecision(
    4
  )} ${arcs[0].destY.toPrecision(4)}\n`;
  for (let i = 1; i < arcs.length; ++i) {
    path += `T ${arcs[i].destX.toPrecision(4)} ${arcs[i].destY.toPrecision(
      4
    )}\n`;
  }
  console.log('path', path);
  return path;
}

// See diagram for derivation: https://github.com/jimkang/spinners/blob/master/meta/how-to-find-the-first-control-point.jpg
// Lots of assumptions here, the first being that the first arc
// starts at cx + r, cy (0 rads) on the circle.
function getFirstControlPt({ center, extrusionR, arcAngle }) {
  const theta = arcAngle / 2;
  const r = extrusionR;
  const yDistToP = (r * Math.sin(theta)) / Math.cos(theta);
  return b2d.addPairs([center.x, center.y], [r, yDistToP]);
}

module.exports = {
  circleToPath,
  circleToArcs,
  arcsToBezierPath,
  pathCircleForSpinner,
  arcsCircleForSpinner
};
