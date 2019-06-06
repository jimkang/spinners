function diameter(spinner) {
  return spinner.r * 2;
}

function getTransform(spinner) {
  return `translate(${getLeft(spinner)}, ${getTop(spinner)})`;
}

function getLeft(spinner) {
  return spinner.x - spinner.r;
}

function getTop(spinner) {
  return spinner.y - spinner.r;
}

function getDuration(d) {
  if (d.data.speed) {
    return 1.0 / d.data.speed;
  } else {
    return d.data.duration;
  }
}

function getAnimateStartRotation(spinner) {
  return `0 ${spinner.r} ${spinner.r}`;
}

function getAnimateEndRotation(spinner) {
  return `360 ${spinner.r} ${spinner.r}`;
}

function getOrbitDuration(d) {
  if (d.data.orbitSpeed) {
    return 1.0 / d.data.orbitSpeed;
  } else {
    return 10;
  }
}

module.exports = {
  diameter,
  getTransform,
  getLeft,
  getTop,
  getDuration,
  getAnimateStartRotation,
  getAnimateEndRotation,
  getOrbitDuration
};
