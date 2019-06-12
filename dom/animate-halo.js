var { circleToArcs, arcsToBezierPath } = require('./circle-to-path');
var wobbleCircle = require('./wobble-circle');
const numberOfArcs = require('./number-of-arcs');

const expandingDuration = 1400;
const contractingDuration = 2000;

// TODO: Reconcile this with animateHalos.
function animateHalo({
  target,
  originalRadius,
  radiusExpansion = 4,
  probable
}) {
  var finalCircleKit = circleToArcs({
    r: originalRadius + radiusExpansion,
    cx: originalRadius,
    cy: originalRadius,
    numberOfArcs
  });
  var expandedCircleKit = circleToArcs({
    r: originalRadius,
    cx: originalRadius,
    cy: originalRadius,
    numberOfArcs
  });
  var d = target.datum().data;
  const stepsToNextSeed = d.alterationSchedule.length - d.alterationIndex;
  if (stepsToNextSeed < 3) {
    finalCircleKit = wobbleCircle(finalCircleKit, probable, stepsToNextSeed);
    expandedCircleKit = wobbleCircle(
      expandedCircleKit,
      probable,
      stepsToNextSeed
    );
  }

  target.interrupt();

  target
    .transition()
    .duration(expandingDuration)
    .attr('d', arcsToBezierPath(expandedCircleKit))
    .attr('stroke-width', 0.25)
    .attr('opacity', 1.0);

  target
    .transition()
    .delay(expandingDuration)
    .duration(contractingDuration)
    .attr('d', arcsToBezierPath(finalCircleKit))
    .attr('stroke-width', 0)
    .attr('opacity', 0);
}

module.exports = animateHalo;
