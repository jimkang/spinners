var d3 = require('d3-selection');
var accessor = require('accessor')();

var spinnerRoot = d3.select('#spinner-root');

function renderSpinners({ spinnerData }) {
  var spinners = spinnerRoot
    .selectAll('.spinner')
    .data(spinnerData, accessor());
  spinners.exit().remove();
  var newSpinners = spinners.enter().append('image');
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
    .attr('xlink:href', getImage);

  updatableSpinners
    .select('animateTransform')
    .attr('from', getAnimateStartRotation)
    .attr('to', getAnimateEndRotation)
    .attr('dur', getAnimationDuration);
}

function diameter(spinner) {
  return spinner.r * 2;
}

function getImage(spinner) {
  return spinner.data.image;
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

function getAnimationDuration(spinner) {
  return spinner.data.duration;
}

module.exports = renderSpinners;
