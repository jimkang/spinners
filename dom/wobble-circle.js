function wobbleCircle({ center, edgeStart, arcs }, probable, wobbleLevel) {
  return { center, edgeStart, arcs: arcs.map(wobbleArc) };

  function wobbleArc(arc, i, arcs) {
    if (i === arcs.length - 1) {
      // Don't mess with last arc.
      return arc;
    }
    var newArc = Object.assign({}, arc);
    const radiusChangeDirection = probable.roll(2) === 0 ? -1 : 1;
    const arcChangeRatio =
      1.0 + ((probable.rollDie(2) * wobbleLevel) / 20) * radiusChangeDirection;
    if (probable.roll(2) === 0) {
      newArc.rx = arc.rx * arcChangeRatio;
    }
    if (probable.roll(2) === 0) {
      newArc.ry = arc.ry * arcChangeRatio;
    }
    return newArc;
  }
}

module.exports = wobbleCircle;
