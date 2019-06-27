var d3 = require('d3-selection');
require('d3-transition');
var accessor = require('accessor');
var { diameter, getTransform } = require('./spinner-accessors');
var animateHalos = require('./animate-halos');
var shouldDisplaySublayout = require('./should-display-sublayout');

const transitionTime = 2000;

// WARNING: Does not handle changes to layoutStyle!
// Also does not rerender sublayouts.
// TODO: Get rid of sublayout stuff entirely?
function renderUpdateToSingleSpinner({ spinnerDatum, probable }) {
  var spinner = d3.select('#' + spinnerDatum.data.id);
  if (spinner.empty()) {
    return;
  }

  if (!shouldDisplaySublayout(spinnerDatum)) {
    spinner
      .select('.rotation-group')
      .select('image')
      .attr('xlink:href', accessor({ path: 'data/image/url' }))
      .transition()
      .duration(transitionTime)
      // Matching positioning in renderSpinner for hack
      // that needs the center to be at the upper left corner.
      .attr('x', -spinnerDatum.r)
      .attr('y', -spinnerDatum.r)
      .attr('width', diameter)
      .attr('height', diameter);
  }

  if (shouldDisplaySublayout(spinnerDatum)) {
    spinner
      .transition()
      .duration(transitionTime)
      .attr('transform', getTransform);
  }
  spinner
    .select('.rotation-group')
    .transition()
    .duration(transitionTime)
    .attr('width', diameter)
    .attr('height', diameter);

  var clickTarget = d3
    .select(`#${spinnerDatum.data.id} > .click-target`)
    .attr('r', spinnerDatum.r)
    .attr('cx', spinnerDatum.r)
    .attr('cy', spinnerDatum.r);

  animateHalos({
    targetsSelection: clickTarget,
    probable
  });
}

module.exports = renderUpdateToSingleSpinner;
