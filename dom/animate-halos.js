var { arcsCircleForSpinner, arcsToBezierPath } = require('./circle-to-path');
var wobbleCircle = require('./wobble-circle');

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
    var originalCircleKit = arcsCircleForSpinner({
      spinner,
      r: spinner.r + radiusExpansion
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
    var expandedCircleKit = arcsCircleForSpinner({
      r: spinner.r,
      spinner
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
