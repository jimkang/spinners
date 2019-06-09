// This probable instance not using the same
// seed as the rest means the halos won't be repeatable.
var probable = require('probable');
var circleToPath = require('./circle-to-path');

const expandingDuration = 1400;
const contractingDuration = 2000;

function animateHalo(target, originalRadius, radiusExpansion = 4) {
  target.interrupt();

  target
    .transition()
    .duration(expandingDuration)
    .attr(
      'd',
      circleToPath({
        r: originalRadius + radiusExpansion,
        cx: originalRadius,
        cy: originalRadius
      })
    )
    .attr('stroke-width', 0.25)
    .attr('opacity', 1.0);

  target
    .transition()
    .on('end', scheduleRepeat)
    .delay(expandingDuration)
    .duration(contractingDuration)
    .attr(
      'r',
      circleToPath({
        r: originalRadius,
        cx: originalRadius,
        cy: originalRadius
      })
    )
    .attr('stroke-width', 0)
    .attr('opacity', 0);

  function scheduleRepeat() {
    setTimeout(repeat, 1000 * (3 + probable.roll(50)));
  }

  function repeat() {
    animateHalo(target, originalRadius);
  }
}

module.exports = animateHalo;
