var { pathCircleForSpinner } = require('./circle-to-path');

function animateHalos({ targetsSelection }) {
  targetsSelection.interrupt();

  targetsSelection.each(animateHalo);

  targetsSelection
    .transition()
    .duration(getFadeInDuration)
    .attr('stroke-width', 0.25)
    .attr('opacity', 1.0);

  targetsSelection
    .transition()
    .delay(getPrimeDuration)
    .duration(getFadeOutDuration)
    .attr('stroke-width', 0)
    .attr('opacity', 0);
}

function animateHalo(spinner) {
  var pathEl = this;

  const startTime = performance.now();
  var pulseCount = 0;

  requestAnimationFrame(setHaloPath);

  function setHaloPath(t) {
    const elapsed = t - startTime;
    const pulsePortion =
      (elapsed % spinner.data.wobble.pulseDuration) /
      spinner.data.wobble.pulseDuration;
    const pulseVal = Math.sin(pulsePortion * 2 * Math.PI);
    const pulseDirection = pulseVal > 0 ? 1 : -1;
    const pulseMagnitude = Math.abs(pulseVal) * spinner.data.wobble.intensity;

    pathEl.setAttribute(
      'd',
      pathCircleForSpinner(spinner, pulseDirection, pulseMagnitude)
    );
    pulseCount = ~~(elapsed / spinner.data.wobble.pulseDuration);
    if (pulseCount < spinner.data.wobble.pulses) {
      requestAnimationFrame(setHaloPath);
    }
  }
}

function getTotalDuration(spinner) {
  return spinner.data.wobble.pulses * spinner.data.wobble.pulseDuration;
}
function getPrimeDuration(spinner) {
  return getTotalDuration(spinner) * 0.75;
}

function getFadeOutDuration(spinner) {
  return getTotalDuration(spinner) * 0.2;
}

function getFadeInDuration(spinner) {
  return getTotalDuration(spinner) * 0.05;
}

module.exports = animateHalos;
