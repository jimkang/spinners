var { arcsCircleForSpinner, arcsToBezierPath } = require('./circle-to-path');
var wobbleCircle = require('./wobble-circle');
var { numberOfAlterationsLeftUntilNextSeed } = require('./spinner-accessors');

const expandingDuration = 1400;
const contractingDuration = 2000;
const maxAlterations = 3;

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
    const stepsToNextSeed = numberOfAlterationsLeftUntilNextSeed(spinner);
    // The closer it is to jumping to the next seed, the
    // more unstable it should look.
    if (stepsToNextSeed < maxAlterations) {
      originalCircleKit = wobbleCircle(
        originalCircleKit,
        probable,
        maxAlterations - stepsToNextSeed
      );
    }
    return arcsToBezierPath(originalCircleKit);
  }

  function getFinalPath(spinner) {
    var expandedCircleKit = arcsCircleForSpinner({
      r: spinner.r,
      spinner
    });
    const stepsToNextSeed = numberOfAlterationsLeftUntilNextSeed(spinner);
    if (stepsToNextSeed < maxAlterations) {
      expandedCircleKit = wobbleCircle(
        expandedCircleKit,
        probable,
        maxAlterations - stepsToNextSeed
      );
    }
    return arcsToBezierPath(expandedCircleKit);
  }
}

module.exports = animateHalos;
