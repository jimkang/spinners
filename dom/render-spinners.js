var d3 = require('d3-selection');
var accessor = require('accessor');

function renderSpinners({ spinnerData, layerNumber }) {
  var spinnerRoot = d3.select('#layer-' + layerNumber);
  var spinners = spinnerRoot
    .selectAll('.spinner')
    .data(spinnerData, accessor({ path: 'data/id' }));
  spinners.exit().remove();
  var newSpinners = spinners
    .enter()
    .append('image')
    .classed('spinner', true);
  newSpinners
    .append('animateTransform')
    .attr('attributeName', 'transform')
    .attr('attributeType', 'XML')
    .attr('type', 'rotate')
    .attr('repeatCount', 'indefinite');

  var updatableSpinners = newSpinners.merge(spinners);
  updatableSpinners
    .attr('x', getLeft)
    .attr('y', getTop)
    .attr('width', diameter)
    .attr('height', diameter)
    .attr('xlink:href', accessor({ path: 'data/image/url' }));

  updatableSpinners
    .select('animateTransform')
    .attr('from', getAnimateStartRotation)
    .attr('to', getAnimateEndRotation)
    .attr('dur', accessor({ path: 'data/duration' }));
}

function diameter(spinner) {
  return spinner.r * 2;
}

function getLeft(spinner) {
  return spinner.x - spinner.r;
}

function getTop(spinner) {
  return spinner.y - spinner.r;
}

function getAnimateStartRotation(spinner) {
  return `0 ${spinner.x} ${spinner.y}`;
}

function getAnimateEndRotation(spinner) {
  return `360 ${spinner.x} ${spinner.y}`;
}

module.exports = renderSpinners;
