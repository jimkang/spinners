var d3 = require('d3-selection');
require('d3-transition');
var accessor = require('accessor');
var { makeOrbitForSpinner } = require('./orbit');
var {
  diameter,
  getTransform,
  getDuration,
  getAnimateStartRotation,
  getAnimateEndRotation,
  getOrbitDuration
} = require('./spinner-accessors');
var animateHalo = require('./animate-halo');

const transitionTime = 2000;

// WARNING: Does not handle changes to layoutStyle!
// Also does not rerender sublayouts.
// TODO: Get rid of sublayout stuff entirely?
function renderUpdateToSingleSpinner({
  spinnerDatum,
  interruptRotation = true,
  probable
}) {
  var spinner = d3.select('#' + spinnerDatum.data.id);
  if (spinner.empty()) {
    return;
  }

  if (spinnerDatum.data.displaysSublayout) {
    let orbitDatum = makeOrbitForSpinner(spinnerDatum);
    let path = d3.select('#' + orbitDatum.id);
    path
      .transition()
      .duration(transitionTime)
      .attr('d', accessor('d'));
  } else {
    spinner
      .select('.rotation-group')
      .select('image')
      .attr('xlink:href', accessor({ path: 'data/image/url' }))
      .transition()
      .duration(transitionTime)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', diameter)
      .attr('height', diameter);
  }

  var rotationTransform = spinner.select('.rotation-transform');

  if (interruptRotation) {
    rotationTransform
      .attr('from', getAnimateStartRotation)
      .attr('to', getAnimateEndRotation);
  }
  rotationTransform.attr('dur', getDuration);

  if (spinnerDatum.data.displaysSublayout) {
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

  animateHalo({
    target: clickTarget,
    originalRadius: spinnerDatum.r,
    probable
  });

  spinner
    .select('.orbit-animation')
    .transition()
    .duration(transitionTime)
    .attr('dur', getOrbitDuration);
}

module.exports = renderUpdateToSingleSpinner;
