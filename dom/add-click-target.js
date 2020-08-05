var d3 = require('d3-selection');
var { pathCircleForSpinner } = require('./circle-to-path');
var { numberOfAlterationsLeftUntilNextSeed } = require('./spinner-accessors');

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
    pathCircleForSpinner(spinner, spinner.data.initialWobbleDirection, 0)
  );
  target.attr('data-stability', numberOfAlterationsLeftUntilNextSeed(spinner));
  target.on('click', onClick);
}

module.exports = addClickTarget;
