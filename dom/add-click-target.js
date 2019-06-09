var d3 = require('d3-selection');
require('d3-transition');
var animateHalo = require('./animate-halo');
var circleToPath = require('./circle-to-path');

function addClickTarget(onClick, spinner) {
  var root = d3.select(this);
  // Select only the direct .click-target descendant
  // of this element.
  var target = d3.select(`#${this.id} > .click-target`);
  if (target.empty()) {
    target = root
      .append('path')
      .datum(spinner)
      .classed('click-target', true);
  }
  target.attr(
    'd',
    circleToPath({ r: spinner.r, cx: spinner.r, cy: spinner.r })
  );

  target.on('click', onClick);

  // TODO: If spinner.data.alterationStep ... wobble.
  animateHalo(target, spinner.r);
}

module.exports = addClickTarget;
