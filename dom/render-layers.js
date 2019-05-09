var d3 = require('d3-selection');
var range = require('d3-array').range;

var board = d3.select('#board');

function renderLayers({
  layerCount,
  parentSelection = board,
  scale,
  offsetX,
  offsetY
}) {
  var layers = parentSelection.selectAll('.layer').data(range(layerCount));
  layers.exit().remove();
  var newLayers = layers
    .enter()
    .append('g')
    .merge(layers)
    .attr('class', getLayerId);
  if (!isNaN(scale) && !isNaN(offsetX) && !isNaN(offsetY)) {
    newLayers.attr(
      'transform',
      `translate(${offsetX}, ${offsetY}) scale(${scale})`
    );
  }
}

function getLayerId(d, i) {
  return 'layer layer-' + i;
}

module.exports = renderLayers;
