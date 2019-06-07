var d3 = require('d3-selection');
require('d3-transition');
// This probable instance not using the same
// seed as the rest means the halos won't be repeatable.
var probable = require('probable');

const expandingDuration = 1400;
const contractingDuration = 2000;

function addClickTarget(onClick, spinner) {
  var root = d3.select(this);
  // Select only the direct .click-target descendant
  // of this element.
  var target = d3.select(`#${this.id} > .click-target`);
  if (target.empty()) {
    target = root
      .append('circle')
      .datum(spinner)
      .classed('click-target', true);
  }
  target
    .attr('r', spinner.r)
    .attr('cx', spinner.r)
    .attr('cy', spinner.r);

  target.on('click', onClick);

  // TODO: If spinner.data.alterationStep ... wobble.
  animateHalo(target, spinner.r);
}

function animateHalo(target, originalRadius) {
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

module.exports = addClickTarget;
