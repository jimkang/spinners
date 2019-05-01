var d3 = require('d3-selection');
var range = require('d3-array').range;

var board = d3.select('#board');

function renderLayers({ layerCount }) {
  var layers = board.selectAll('.layer').data(range(layerCount));
  layers.exit().remove();
  layers
    .enter()
    .append('g')
    .classed('layer', true)
    .merge(layers)
    .attr('id', getLayerId);
}

function getLayerId(d, i) {
  return 'layer-' + i;
}

module.exports = renderLayers;
