var { circleToArcs, arcsToPath } = require('./circle-to-path');
var wobbleCircle = require('./wobble-circle');

const expandingDuration = 1400;
const contractingDuration = 2000;

function animateHalo({
  target,
  originalRadius,
  radiusExpansion = 4,
  probable
}) {
  var originalCircleKit = circleToArcs({
    r: originalRadius + radiusExpansion,
    cx: originalRadius,
    cy: originalRadius,
    numberOfArcs: 6
  });
  var expandedCircleKit = circleToArcs({
    r: originalRadius,
    cx: originalRadius,
    cy: originalRadius,
    numberOfArcs: 6
  });
  if (target.datum().data.alterationIndex > 0) {
    originalCircleKit = wobbleCircle(originalCircleKit, probable);
    expandedCircleKit = wobbleCircle(expandedCircleKit, probable);
  }

  target.interrupt();

  target
    .transition()
    .duration(expandingDuration)
    .attr('d', arcsToPath(originalCircleKit))
    .attr('stroke-width', 0.25)
    .attr('opacity', 1.0);

  target
    .transition()
    .delay(expandingDuration)
    .duration(contractingDuration)
    .attr('d', arcsToPath(expandedCircleKit))
    .attr('stroke-width', 0)
    .attr('opacity', 0);
}

module.exports = animateHalo;
