function makeOrbitForSpinner(spinner, orbitIndex, spinners) {
  return {
    id: getOrbitIdForSpinner(spinner),
    d: makePathDataForOrbit(spinner, orbitIndex, spinners)
  };
}

function makePathDataForOrbit(spinner, orbitIndex, spinners) {
  var orbitR = spinner.data.orbitR;
  var cx = spinner.data.orbitCenter.x;
  var cy = spinner.data.orbitCenter.y;
  var clockwise = spinner.data.orbitDirection === 'clockwise';
  var startAngle;
  var startPoint;

  if (spinner.data.ephemeralOrbitData) {
    startAngle = spinner.data.ephemeralOrbitData.startAngle;
    startPoint = spinner.data.ephemeralOrbitData.startPoint;
  } else if (spinners) {
    startAngle = ((2 * Math.PI) / spinners.length) * orbitIndex;
    startPoint = positionOnCircle(cx, cy, startAngle, orbitR);
    spinner.data.ephemeralOrbitData = { startAngle, startPoint };
  } else {
    return;
  }

  // var debugColor = ['red', 'orange', 'yellow', 'green', 'blue'][orbitIndex];
  // this.addDebugCircleD3(startPoint, debugColor);

  var rx = orbitR;
  var ry = orbitR;
  var xAxisRotation = 0;
  var largeArcFlag = 1;
  var sweepFlag = clockwise ? 1 : 0;

  var vectorToOpposite = {
    x: -2 * (startPoint.x - cx),
    y: -2 * (startPoint.y - cy)
  };

  var path =
    // Move command
    'M' +
    startPoint.x +
    ',' +
    startPoint.y +
    ' ' +
    // First arc command
    'a' +
    rx +
    ',' +
    ry +
    ' ' +
    xAxisRotation +
    ' ' +
    largeArcFlag +
    ' ' +
    sweepFlag +
    ' ' +
    vectorToOpposite.x +
    ',' +
    vectorToOpposite.y +
    ' ' +
    // Second arc command
    'a' +
    rx +
    ',' +
    ry +
    ' ' +
    xAxisRotation +
    ' ' +
    largeArcFlag +
    ' ' +
    sweepFlag +
    ' ' +
    -vectorToOpposite.x +
    ',' +
    -vectorToOpposite.y;

  return path;
}

function positionOnCircle(cx, cy, angle, radius) {
  var y = radius * Math.sin(angle);
  var x = radius * Math.cos(angle);
  return { x: cx + x, y: cy + y };
}

function getOrbitIdForSpinner(spinner) {
  return `orbit-${spinner.data.id}`;
}

module.exports = {
  makeOrbitForSpinner,
  getOrbitIdForSpinner
};
