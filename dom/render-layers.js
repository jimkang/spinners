var d3 = require('d3-selection');
var range = require('d3-array').range;

var board = d3.select('#board');

function renderLayers({ layerCount, parentSelection = board }) {
  var layers = parentSelection.selectAll('.layer').data(range(layerCount));
  layers.exit().remove();
  layers
    .enter()
    .append('g')
    .merge(layers)
    .attr('class', getLayerId);
}

function getLayerId(d, i) {
  return 'layer layer-' + i;
}

module.exports = renderLayers;
