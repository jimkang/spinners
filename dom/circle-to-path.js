var math = require('basic-2d-math');
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

function pathCircleForSpinner(spinner, wobbleDirection, wobbleLevel) {
  const centerDist = centerDistForSpinner(spinner);
  return getCircleAsBezierCurvesPath({
    cx: centerDist,
    cy: centerDist,
    r: spinner.r * 1.2,
    segmentCount: spinner.data.wobble.segments,
    wobbleLevel,
    wobbleDirection
  });
}

function getCircleAsBezierCurvesPath({
  cx,
  cy,
  r,
  segmentCount,
  wobbleLevel = 0.0,
  wobbleDirection = -1
}) {
  var path = '';
  const segAngle = (2 * Math.PI) / segmentCount;
  const vMagnitudeFactor = 2 / segmentCount;
  var vecStart = [r, 0];
  var segStart = [cx + vecStart[0], cy + vecStart[1]];
  path += `M ${segStart[0]} ${segStart[1]}\n`;

  for (var segIndex = 1; segIndex <= segmentCount; ++segIndex) {
    let center = [cx, cy];
    let vecToCP1 = math.multiplyPairBySingleValue(
      [-vecStart[1], vecStart[0]],
      vMagnitudeFactor
    );
    let cp1 = math.addPairs(math.addPairs(center, vecStart), vecToCP1);
    cp1 = wobbleCP(cp1, cx, cy, wobbleLevel, wobbleDirection);
    let vecEnd = getSpotOnOriginCircle(segIndex * segAngle, r);
    let vecToCP2 = math.multiplyPairBySingleValue(
      [vecEnd[1], -vecEnd[0]],
      vMagnitudeFactor
    );
    let segEnd = math.addPairs(center, vecEnd);

    //addDot(segEnd, svg);
    let cp2 = math.addPairs(segEnd, vecToCP2);
    cp2 = wobbleCP(cp2, cx, cy, wobbleLevel, wobbleDirection);

    path += `C ${cp1[0].toPrecision(3)} ${cp1[1].toPrecision(
      3
    )}, ${cp2[0].toPrecision(3)} ${cp2[1].toPrecision(
      3
    )}, ${segEnd[0].toPrecision(3)} ${segEnd[1].toPrecision(3)}\n`;

    vecStart = vecEnd;
    wobbleDirection *= -1;
  }

  return path;
}

function getSpotOnOriginCircle(angle, r) {
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

// Control point for the wobbled bezier curve.
function wobbleCP(cp, cx, cy, wobbleLevel, wobbleDirection) {
  if (wobbleLevel > 0.0) {
    // Direction: center to cp * wobbleDirection. Magnitude: wobbleLevel
    let centerToCP = [cp[0] - cx, cp[1] - cy];
    const centerToCPLength = Math.sqrt(
      centerToCP[0] * centerToCP[0] + centerToCP[1] * centerToCP[1]
    );
    let cpWobbleVec = [
      (centerToCP[0] / centerToCPLength) * wobbleDirection * wobbleLevel,
      (centerToCP[1] / centerToCPLength) * wobbleDirection * wobbleLevel
    ];
    return [cp[0] + cpWobbleVec[0], cp[1] + cpWobbleVec[1]];
  }
  return cp;
}

module.exports = {
  pathCircleForSpinner,
  getCircleAsBezierCurvesPath
};
