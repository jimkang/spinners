var { makeOrbitForSpinner } = require('./orbit');
var d3 = require('d3-selection');
require('d3-transition');
var easeCubic = require('d3-ease').easeCubic;

const transitionTime = 5000;

function updateOrbit({ spinner, skipMoveInPath }) {
  var { d, id } = makeOrbitForSpinner(
    spinner,
    undefined,
    undefined,
    skipMoveInPath
  );
  var path = d3.select(document.getElementById(id));
  path
    .transition()
    .duration(transitionTime)
    .ease(easeCubic)
    .attr('d', d);
}

module.exports = updateOrbit;
