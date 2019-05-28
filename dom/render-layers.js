var d3 = require('d3-selection');
var accessor = require('accessor');

var board = d3.select('#board');

function renderLayers({
  layerData,
  parentSelection = board,
  scale,
  offsetX,
  offsetY
}) {
  var layers = parentSelection.selectAll('.layer').data(layerData, accessor());
  layers.exit().remove();
  var newLayers = layers
    .enter()
    .append('g')
    .merge(layers)
    .attr('id', accessor())
    .classed('layer', true);

  if (!isNaN(scale) && !isNaN(offsetX) && !isNaN(offsetY)) {
    newLayers.attr(
      'transform',
      `translate(${offsetX}, ${offsetY}) scale(${scale})`
    );
  }
}

module.exports = renderLayers;
