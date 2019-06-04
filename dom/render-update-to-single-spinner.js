var d3 = require('d3-selection');
require('d3-transition');
var accessor = require('accessor');
var { makeOrbitForSpinner } = require('./orbit');

const transitionTime = 2000;

// WARNING: Does not handle changes to layoutStyle!
// Also does not rerender sublayouts.
// TODO: Get rid of sublayout stuff entirely?
function renderUpdateToSingleSpinner({ spinnerDatum }) {
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

  spinner
    .select('.rotation-transform')
    .attr('from', getAnimateStartRotation)
    .attr('to', getAnimateEndRotation)
    .attr('dur', getDuration);

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
}

// TODO: Dedupe all of these!
function diameter(spinner) {
  return spinner.r * 2;
}

function getTransform(spinner) {
  return `translate(${getLeft(spinner)}, ${getTop(spinner)})`;
}

function getLeft(spinner) {
  return spinner.x - spinner.r;
}

function getTop(spinner) {
  return spinner.y - spinner.r;
}

function getDuration(d) {
  if (d.data.speed) {
    return 1.0 / d.data.speed;
  } else {
    return d.data.duration;
  }
}

function getAnimateStartRotation(spinner) {
  return `0 ${spinner.r} ${spinner.r}`;
}

function getAnimateEndRotation(spinner) {
  return `360 ${spinner.r} ${spinner.r}`;
}

module.exports = renderUpdateToSingleSpinner;
