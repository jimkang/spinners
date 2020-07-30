var { arcsCircleForSpinner, arcsToBezierPath } = require('./circle-to-path');
var { numberOfAlterationsLeftUntilNextSeed } = require('./spinner-accessors');

const expandingDuration = 1400;
const contractingDuration = 2000;
const maxAlterations = 3;

function animateHalos({ targetsSelection }) {
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
      r: spinner.r
    });
    const stepsToNextSeed = numberOfAlterationsLeftUntilNextSeed(spinner);
    updateExtrusionR(spinner, stepsToNextSeed, maxAlterations);

    return arcsToBezierPath(originalCircleKit, spinner.data.extrusionR);
  }

  function getFinalPath(spinner) {
    var expandedCircleKit = arcsCircleForSpinner({
      r: spinner.r,
      spinner
    });
    const stepsToNextSeed = numberOfAlterationsLeftUntilNextSeed(spinner);
    updateExtrusionR(spinner, stepsToNextSeed, maxAlterations);
    return arcsToBezierPath(expandedCircleKit, spinner.data.extrusionR);
  }
}

function updateExtrusionR(spinner, stepsToNextSeed, maxAlterations) {
  // The closer it is to jumping to the next seed, the
  // more unstable it should look.
  if (stepsToNextSeed < maxAlterations) {
    spinner.data.extrusionR =
      ((maxAlterations - stepsToNextSeed) / maxAlterations) *
      (spinner.data.maxExtrusionRatio * spinner.data.r);
  }
}

module.exports = animateHalos;
