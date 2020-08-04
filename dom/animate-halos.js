var { pathCircleForSpinner } = require('./circle-to-path');

const maxPulseValToSegmentRatio = 0.05;

function animateHalos({ targetsSelection }) {
  targetsSelection.interrupt();

  targetsSelection
    .transition()
    .duration(getTotalDuration)
    .attrTween('d', GetHaloPath)
    .attr('stroke-width', 0.25)
    .attr('opacity', 1.0);

  targetsSelection
    .transition()
    .delay(getPrimeDuration)
    .duration(getFadingDuration)
    .attr('stroke-width', 0)
    .attr('opacity', 0);
}

function GetHaloPath(spinner) {
  // t is going to be a value between 0.0 and 1.0,
  // representing how far along it is in the transition.
  return function getHaloPath(t) {
    const pulseVal = Math.sin(t * spinner.data.wobblePulses * 2 * Math.PI);
    const pulseDirection = pulseVal > 0 ? 1 : -1;
    let pulseMagnitude = Math.abs(pulseVal);
    if (
      pulseMagnitude / spinner.data.wobblePulses >
      maxPulseValToSegmentRatio
    ) {
      pulseMagnitude = spinner.data.wobblePulses * maxPulseValToSegmentRatio;
    }

    return pathCircleForSpinner(spinner, pulseDirection, pulseMagnitude);
  };
}

function getTotalDuration(spinner) {
  return spinner.data.wobblePulses * spinner.data.wobblePulseDuration;
}
function getPrimeDuration(spinner) {
  return getTotalDuration(spinner) * 0.67;
}

function getFadingDuration(spinner) {
  return getTotalDuration(spinner) * 0.33;
}

module.exports = animateHalos;
