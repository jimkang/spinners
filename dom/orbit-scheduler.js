// NOTE: This is a singleton!
//
var d3 = require('d3-selection');
var curry = require('lodash.curry');
var Timer = require('d3-timer').timer;

var timer;
var lastElapsed;

function cancelOrbits() {
  if (timer) {
    timer.stop();
  }
}

function scheduleOrbits() {
  timer = Timer(updateSpinnersInOrbits);

  function updateSpinnersInOrbits(elapsed) {
    d3.selectAll('.orbiting-spinner').attr(
      'transform',
      curry(getOrbitTransform)(elapsed)
    );
  }
}

function getOrbitTransform(elapsed, spinner) {
  lastElapsed = elapsed;
  const msPerOrbit = 1000 / spinner.data.orbitSpeed;
  const rotationSign = spinner.data.orbitDirection === 'clockwise' ? -1 : 1;
  const orbitRotation =
    (spinner.data.orbitRotationOffset +
      (2 * Math.PI * elapsed * rotationSign) / msPerOrbit) %
    (2 * Math.PI);
  // Maybe saving a little unboxing by inlining positionOnCircle here.
  const x =
    spinner.data.orbitCenter.x + spinner.data.orbitR * Math.sin(orbitRotation);
  const y =
    spinner.data.orbitCenter.y + spinner.data.orbitR * Math.cos(orbitRotation);
  return 'translate(' + x + ', ' + y + ')';
}

function getLastElapsed() {
  return lastElapsed;
}

module.exports = {
  cancelOrbits,
  scheduleOrbits,
  getOrbitTransform,
  getLastElapsed
};
