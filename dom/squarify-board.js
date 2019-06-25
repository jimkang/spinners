var d3 = require('d3-selection');

var canvasesContainer = d3.select('#canvases-container');
var targetsCanvas = d3.select('#targets-canvas');
var boardCanvas = d3.select('#board-canvas');

function squarifyBoard() {
  const width = document.body.getBoundingClientRect().width;
  const height = width;

  canvasesContainer.style('width', width);
  canvasesContainer.style('height', height);
  boardCanvas.attr('width', width);
  boardCanvas.attr('height', height);
  targetsCanvas.attr('width', width);
  targetsCanvas.attr('height', height);
}

module.exports = squarifyBoard;
