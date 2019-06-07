// This probable instance not using the same
// seed as the rest means the halos won't be repeatable.
var probable = require('probable');

const expandingDuration = 1400;
const contractingDuration = 2000;

function animateHalo(target, originalRadius) {
  target.interrupt();

  target
    .transition()
    .duration(expandingDuration)
    .attr('r', originalRadius + 4)
    .attr('stroke-width', 0.25)
    .attr('opacity', 1.0);

  target
    .transition()
    .on('end', scheduleRepeat)
    .delay(expandingDuration)
    .duration(contractingDuration)
    .attr('r', originalRadius)
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
