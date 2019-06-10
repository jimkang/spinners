var { circleToArcs, arcsToBezierPath } = require('./circle-to-path');
var wobbleCircle = require('./wobble-circle');
const numberOfArcs = require('./number-of-arcs');

const expandingDuration = 1400;
const contractingDuration = 2000;

function animateHalos({ targetsSelection, radiusExpansion = 4, probable }) {
  targetsSelection.interrupt();

  targetsSelection
    .transition()
    .duration(expandingDuration)
    .attr('d', getInitialPath)
    .attr('stroke-width', 0.25)
    .attr('opacity', 1.0);

  targetsSelection
    .transition()
    .delay(expandingDuration)
    .duration(contractingDuration)
    .attr('d', getFinalPath)
    .attr('stroke-width', 0)
    .attr('opacity', 0);

  function getInitialPath(spinner) {
    var originalCircleKit = circleToArcs({
      r: spinner.r + radiusExpansion,
      cx: spinner.r,
      cy: spinner.r,
      numberOfArcs
    });
    if (spinner.data.alterationIndex > 0) {
      originalCircleKit = wobbleCircle(
        originalCircleKit,
        probable,
        spinner.data.alterationIndex + 1
      );
    }
    return arcsToBezierPath(originalCircleKit);
  }

  function getFinalPath(spinner) {
    var expandedCircleKit = circleToArcs({
      r: spinner.r,
      cx: spinner.r,
      cy: spinner.r,
      numberOfArcs
    });
    if (spinner.data.alterationIndex > 0) {
      expandedCircleKit = wobbleCircle(
        expandedCircleKit,
        probable,
        spinner.data.alterationIndex + 1
      );
    }
    return arcsToBezierPath(expandedCircleKit);
  }
}

module.exports = animateHalos;
