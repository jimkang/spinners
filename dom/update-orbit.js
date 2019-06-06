var { makeOrbitForSpinner } = require('./orbit');
var d3 = require('d3-selection');
require('d3-transition');
var easeCubic = require('d3-ease').easeCubic;

const transitionTime = 3500;

function updateOrbit(spinner) {
  var { d, id } = makeOrbitForSpinner(spinner);
  var path = d3.select(document.getElementById(id));
  path
    .transition()
    .duration(transitionTime)
    .ease(easeCubic)
    .attr('d', d);
}

module.exports = updateOrbit;
