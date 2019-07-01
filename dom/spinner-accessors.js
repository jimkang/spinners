function diameter(spinner) {
  return spinner.r * 2;
}

function negativeR(spinner) {
  return -spinner.r;
}

function getTransform(spinner) {
  return `translate(${getLeft(spinner)}, ${getTop(spinner)})`;
}
// getLeft and getTop are returning the upper left corner
// to compensate for the hack which puts the x and y of
// the image in the spinner at -r, -r instead of 0, 0.
// (See comment in render-spinners, where updatableSpinners
// attributes are set.

function getLeft(spinner) {
  return spinner.x; // - spinner.r;
}

function getTop(spinner) {
  return spinner.y; // - spinner.r;
}

function getOrbitDuration(d) {
  if (d.data.orbitSpeed) {
    return 1.0 / d.data.orbitSpeed;
  } else {
    return 10;
  }
}

function numberOfAlterationsLeftUntilNextSeed(spinner) {
  return spinner.data.alterationSchedule.length - spinner.data.alterationIndex;
}

module.exports = {
  diameter,
  negativeR,
  getTransform,
  getLeft,
  getTop,
  getOrbitDuration,
  numberOfAlterationsLeftUntilNextSeed
};
