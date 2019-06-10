var { circleToArcs, arcsToBezierPath } = require('./circle-to-path');
var wobbleCircle = require('./wobble-circle');
const numberOfArcs = require('./number-of-arcs');

const expandingDuration = 1400;
const contractingDuration = 2000;

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
  if (target.datum().data.alterationIndex > 0) {
    finalCircleKit = wobbleCircle(
      finalCircleKit,
      probable,
      target.datum().data.alterationIndex + 1
    );
    expandedCircleKit = wobbleCircle(
      expandedCircleKit,
      probable,
      target.datum().data.alterationIndex + 1
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
