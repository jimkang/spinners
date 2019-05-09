var d3 = require('d3-selection');
var accessor = require('accessor');
var pathExists = require('object-path-exists');
var renderLayers = require('./render-layers');

var board = d3.select('#board');

function renderSpinners({
  spinnerData,
  layerNumber,
  parentSelection = d3,
  currentlyWithinASublayout = false
}) {
  squarifyBoard();

  var spinnerRoot = parentSelection.select('.layer-' + layerNumber);
  var spinners = spinnerRoot
    .selectAll('.spinner')
    .data(spinnerData, accessor({ path: 'data/id' }));
  spinners.exit().remove();
  var newSpinners = spinners
    .enter()
    .append('g')
    .classed('spinner', true);

  newSpinners.filter(isAPlainSpinner).append('image');

  newSpinners
    .append('animateTransform')
    .attr('attributeName', 'transform')
    .attr('attributeType', 'XML')
    .attr('type', 'rotate')
    .attr('additive', 'sum')
    // Important for not cancelling out the translate transform:
    .attr('repeatCount', 'indefinite');

  var updatableSpinners = newSpinners.merge(spinners);
  updatableSpinners
    .attr('transform', getTransform)
    .attr('width', diameter)
    .attr('height', diameter);

  updatableSpinners
    .filter(isAPlainSpinner)
    .select('image')
    .attr('xlink:href', accessor({ path: 'data/image/url' }))
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', diameter)
    .attr('height', diameter);

  updatableSpinners.filter(spinnerHasASublayout).each(renderSublayout);

  updatableSpinners
    .select('animateTransform')
    .attr('from', getAnimateStartRotation)
    .attr('to', getAnimateEndRotation)
    .attr('dur', getDuration);

  function renderSublayout(spinner) {
    if (currentlyWithinASublayout) {
      // TODO: Some sort of non-recursive representation of the sublayout.
      return;
    }

    var { /* layers,*/ spinnerDataForLayers } = spinner.data.sublayout;

    var sublayoutContainer = d3.select(this);

    // Render only one of the layers to avoid being overwhelming.
    renderLayers({
      layerCount: 1, //layers.length,
      parentSelection: sublayoutContainer,
      scale: diameter(spinner) / 100,
      offsetX: 0,
      offsetY: 0
    });
    for (
      var i = spinnerDataForLayers.length - 1;
      i < spinnerDataForLayers.length;
      ++i
    ) {
      renderSpinners({
        spinnerData: spinnerDataForLayers[i],
        layerNumber: i,
        parentSelection: sublayoutContainer,
        currentlyWithinASublayout: true
      });
    }
  }
}

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

function squarifyBoard() {
  var boardWidth = board.node().getBoundingClientRect().width;
  board.attr('height', boardWidth);
}

function isAPlainSpinner(s) {
  return s.data.sublayout === undefined;
}

function spinnerHasASublayout(s) {
  return pathExists(s, ['data', 'sublayout', 'layers']);
}

function getAnimateStartRotation(spinner) {
  return `0 ${spinner.r} ${spinner.r}`;
}

function getAnimateEndRotation(spinner) {
  return `360 ${spinner.r} ${spinner.r}`;
}

module.exports = renderSpinners;
