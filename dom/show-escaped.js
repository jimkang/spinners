var d3 = require('d3-selection');
require('d3-transition');

function showEscaped({ spinner }) {
  var spinnerSel = d3.select('#' + spinner.data.id);
  var escapedText = spinnerSel
    .append('text')
    .classed('escaped-text', true)
    .text('E S C A P E D');

  escapedText
    .transition()
    .delay(1000)
    .attr('opacity', 0)
    .remove();
}

module.exports = showEscaped;
