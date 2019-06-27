var { circleToArcs, arcsToBezierPath } = require('./circle-to-path');
var wobbleCircle = require('./wobble-circle');
const numberOfArcs = require('./number-of-arcs');

const expandingDuration = 1400;
const contractingDuration = 2000;

// The centers used in this function are at the
// upper left of the spinner instead of the center
// in order to align with the hack in renderSpinners
// that needs to put the center in the upper left
// corner instead of in the center.
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
      cx: 0, //spinner.r,
      cy: 0, //spinner.r,
      numberOfArcs
    });
    const stepsToNextSeed =
      spinner.data.alterationSchedule.length - spinner.data.alterationIndex;
    if (stepsToNextSeed < 3) {
      originalCircleKit = wobbleCircle(
        originalCircleKit,
        probable,
        stepsToNextSeed
      );
    }
    return arcsToBezierPath(originalCircleKit);
  }

  function getFinalPath(spinner) {
    var expandedCircleKit = circleToArcs({
      r: spinner.r,
      cx: 0, //spinner.r,
      cy: 0, //spinner.r,
      numberOfArcs
    });
    const stepsToNextSeed =
      spinner.data.alterationSchedule.length - spinner.data.alterationIndex;
    if (stepsToNextSeed < 3) {
      expandedCircleKit = wobbleCircle(
        expandedCircleKit,
        probable,
        stepsToNextSeed
      );
    }
    return arcsToBezierPath(expandedCircleKit);
  }
}

module.exports = animateHalos;
