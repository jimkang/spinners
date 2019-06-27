var d3 = require('d3-selection');
var board = d3.select('#board');

function squarifyBoard() {
  var boardWidth = board.node().getBoundingClientRect().width;
  board.attr('height', boardWidth);
}

module.exports = squarifyBoard;
