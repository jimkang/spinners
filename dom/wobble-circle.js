function wobbleCircle({ center, edgeStart, arcs }, probable, wobbleLevel) {
  return { center, edgeStart, arcs: arcs.map(wobbleArc) };

  function wobbleArc(arc, i, arcs) {
    if (i === arcs.length - 1) {
      // Don't mess with last arc.
      return arc;
    }
    var newArc = Object.assign({}, arc);
    newArc.rx = arc.rx + (probable.roll(3) - 1) * wobbleLevel * 0.33;
    newArc.ry = newArc.rx;
    //newArc.destX = arc.destX + (probable.roll(3) - 1) * wobbleLevel * 0.5;
    //newArc.destY = arc.destY + (probable.roll(3) - 1) * wobbleLevel * 0.5;
    return newArc;
  }
}

module.exports = wobbleCircle;
