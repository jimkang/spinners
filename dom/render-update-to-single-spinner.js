var d3 = require('d3-selection');
require('d3-transition');
var accessor = require('accessor');
var {
  diameter,
  numberOfAlterationsLeftUntilNextSeed
} = require('./spinner-accessors');
var animateHalos = require('./animate-halos');
var shouldDisplaySublayout = require('./should-display-sublayout');
var orbitScheduler = require('./orbit-scheduler');

const transitionTime = 300;

// WARNING: Does not handle changes to layoutStyle!
// Also does not rerender sublayouts.
// TODO: Get rid of sublayout stuff entirely?
function renderUpdateToSingleSpinner({
  spinnerDatum,
  animateHalo = true,
  moveToFront
}) {
  var spinner = d3.select('#' + spinnerDatum.data.id);
  if (spinner.empty()) {
    return;
  }

  if (moveToFront) {
    spinner.raise();
  }

  spinner
    .select('.rotation-group')
    .attr('data-speed', accessor({ path: 'data/speed' }));

  if (!shouldDisplaySublayout(spinnerDatum)) {
    spinner
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

  if (isNaN(spinnerDatum.data.orbitR)) {
    spinner.transition();
    //.duration(transitionTime)
    //.attr('transform', getTransform);
  } else {
    spinner
      //.transition()
      //.duration(transitionTime)
      .attr(
        'transform',
        orbitScheduler.getOrbitTransform(
          orbitScheduler.getLastElapsed() + transitionTime,
          spinnerDatum
        )
      );
  }

  spinner
    .select('.rotation-group')
    //.transition()
    //.duration(transitionTime)
    .attr('width', diameter)
    .attr('height', diameter);

  var clickTarget = d3
    .select(`#${spinnerDatum.data.id} > .click-target`)
    .attr('r', spinnerDatum.r)
    .attr('cx', spinnerDatum.r)
    .attr('cy', spinnerDatum.r)
    .attr('data-stability', numberOfAlterationsLeftUntilNextSeed(spinnerDatum));

  if (animateHalo) {
    animateHalos({ targetsSelection: clickTarget });
  }
}

module.exports = renderUpdateToSingleSpinner;
