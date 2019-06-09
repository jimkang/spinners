function wobbleCircle({ center, edgeStart, arcs }, probable) {
  return { center, edgeStart, arcs: arcs.map(wobbleArc) };

  function wobbleArc(arc, i, arcs) {
    if (i === arcs.length - 1) {
      // Don't mess with last arc.
      return arc;
    }
    var newArc = Object.assign({}, arc);
    newArc.rx = arc.rx + probable.roll(5) - 2;
    newArc.ry = arc.ry + probable.roll(5) - 2;
    newArc.destX = arc.destX + probable.roll(5) - 2;
    newArc.destY = arc.destY + probable.roll(5) - 2;
    return newArc;
  }
}

module.exports = wobbleCircle;
