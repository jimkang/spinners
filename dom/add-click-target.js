var d3 = require('d3-selection');
require('d3-transition');
var { circleToPath } = require('./circle-to-path');
const numberOfArcs = require('./number-of-arcs');

function addClickTarget(onClick, probable, spinner) {
  var root = d3.select(this);
  let imageChild = root.select('image');
  if (imageChild.empty()) {
    // Don't add a click target to a spinner group that's empty.
    return;
  }

  // Select only the direct .click-target descendant
  // of this element.
  var target = d3.select(`#${this.id} > .click-target`);
  if (target.empty()) {
    target = root
      .append('path')
      .datum(spinner)
      .classed('click-target', true)
      .attr('stroke-width', 0);
  }
  target.attr(
    'd',
    circleToPath({
      r: spinner.r,
      cx: spinner.r,
      cy: spinner.r,
      numberOfArcs
    })
  );

  target.on('click', onClick);
}

module.exports = addClickTarget;
