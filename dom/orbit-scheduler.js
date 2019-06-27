var d3 = require('d3-selection');
var curry = require('lodash.curry');
var Timer = require('d3-timer').timer;
var { positionOnCircle } = require('./orbit');

var timer;

function cancelOrbits() {
  if (timer) {
    timer.stop();
  }
}

function scheduleOrbits() {
  timer = Timer(updateSpinnersInOrbits);

  function updateSpinnersInOrbits(elapsed) {
    d3.selectAll('.orbiting-spinner').each(
      curry(updateSpinnerInOrbit)(elapsed)
    );
  }
}

function updateSpinnerInOrbit(elapsed, spinner) {
  const msPerOrbit = 1000 / spinner.data.orbitSpeed;
  const orbitRotation = ((2 * Math.PI * elapsed) / msPerOrbit) % (2 * Math.PI);
  let { x, y } = positionOnCircle(
    spinner.data.orbitCenter.x,
    spinner.data.orbitCenter.y,
    orbitRotation,
    spinner.data.orbitR
  );
  var spinnerSel = d3.select(this);
  spinnerSel.attr('transform', `translate(${x}, ${y})`);
}

module.exports = { cancelOrbits, scheduleOrbits };
