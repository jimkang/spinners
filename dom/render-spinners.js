var d3 = require('d3-selection');
var accessor = require('accessor');
var pathExists = require('object-path-exists');
var renderLayers = require('./render-layers');
var curry = require('lodash.curry');

var board = d3.select('#board');
var orbitPathRoot = board.select('#orbit-paths');

function renderSpinners({
  spinnerData,
  layerNumber,
  parentSelection = d3,
  currentlyWithinASublayout = false,
  layoutStyle
}) {
  squarifyBoard();

  var spinnerRoot = parentSelection.select('.layer-' + layerNumber);
  var spinners = spinnerRoot
    .selectAll('.spinner')
    .data(spinnerData, accessor({ path: 'data/id' }));
  spinners.exit().remove();
  var newSpinners = spinners
    .enter()
    .append('g')
    .classed('spinner', true)
    .attr('width', 100)
    .attr('height', 100);

  var rotationGroups = newSpinners.append('g').classed('rotation-group', true);
  rotationGroups.filter(isAPlainSpinner).append('image');

  addRotationTransform({
    spinnersSel: rotationGroups,
    className: 'rotation-transform'
  });
  if (layoutStyle === 'orbit') {
    let orbitAnimations = newSpinners
      .append('animateMotion')
      .classed('orbit-animation', true)
      .attr('dur', '10s')
      .attr('repeatCount', 'indefinite');
    orbitAnimations
      .append('mpath')
      .attr('xlink:href', s => `#${getOrbitIdForSpinner(s)}`);
  }

  var updatableSpinners = newSpinners.merge(spinners);
  updatableSpinners
    .filter(isAPlainSpinner)
    .select('.rotation-group')
    .select('image')
    .attr('xlink:href', accessor({ path: 'data/image/url' }))
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', diameter)
    .attr('height', diameter);

  if (layoutStyle === 'orbit') {
    let paths = orbitPathRoot
      .selectAll('.orbit-path')
      .data(
        spinnerData.map(
          curry(makeOrbitForSpinner)({ clockwise: true, cx: 50, cy: 50 })
        ),
        accessor()
      );
    paths.exit().remove();
    paths
      .enter()
      .append('path')
      .merge(paths)
      .attr('id', accessor())
      .attr('d', accessor('d'));
  }

  updatableSpinners.filter(spinnerHasASublayout).each(renderSublayout);

  updatableSpinners
    .select('.rotation-transform')
    .attr('from', getAnimateStartRotation)
    .attr('to', getAnimateEndRotation)
    .attr('dur', getDuration);

  if (layoutStyle !== 'orbit') {
    updatableSpinners.attr('transform', getTransform);
  }
  updatableSpinners
    .select('.rotation-group')
    .attr('width', diameter)
    .attr('height', diameter);
  //if (layoutStyle === 'orbit') {
  //  updatableSpinners.attr('transform', 'translate(50, 50)');
  //} else {
  //}

  function renderSublayout(spinner) {
    if (currentlyWithinASublayout) {
      // TODO: Some sort of non-recursive representation of the sublayout.
      return;
    }

    var { /* layers,*/ spinnerDataForLayers } = spinner.data.sublayout;

    var sublayoutContainer = d3.select(this);

    // Render only one of the layers to avoid being overwhelming.
    renderLayers({
      layerCount: 1, //layers.length,
      parentSelection: sublayoutContainer,
      scale: diameter(spinner) / 100,
      offsetX: 0,
      offsetY: 0
    });
    for (
      var i = spinnerDataForLayers.length - 1;
      i < spinnerDataForLayers.length;
      ++i
    ) {
      renderSpinners({
        spinnerData: spinnerDataForLayers[i],
        layerNumber: i,
        parentSelection: sublayoutContainer,
        currentlyWithinASublayout: true
      });
    }
  }
}

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

function squarifyBoard() {
  var boardWidth = board.node().getBoundingClientRect().width;
  board.attr('height', boardWidth);
}

function isAPlainSpinner(s) {
  return s.data.sublayout === undefined;
}

function spinnerHasASublayout(s) {
  return pathExists(s, ['data', 'sublayout', 'layers']);
}

function getAnimateStartRotation(spinner) {
  return `0 ${spinner.r} ${spinner.r}`;
}

function getAnimateEndRotation(spinner) {
  return `360 ${spinner.r} ${spinner.r}`;
}

function addRotationTransform({ spinnersSel, className, type = 'rotate' }) {
  return (
    spinnersSel
      .append('animateTransform')
      .attr('attributeName', 'transform')
      .attr('attributeType', 'XML')
      .attr('type', type)
      .attr('additive', 'sum')
      // Important for not cancelling out the translate transform:
      .attr('repeatCount', 'indefinite')
      .classed(className, true)
  );
}

function getOrbitIdForSpinner(spinner) {
  return `orbit-${spinner.data.id}`;
}

function makeOrbitForSpinner(
  { clockwise, cx, cy },
  spinner,
  orbitIndex,
  spinners
) {
  return {
    id: getOrbitIdForSpinner(spinner),
    d: makePathDataForOrbit(clockwise, cx, cy, spinner, orbitIndex, spinners)
  };
}

function makePathDataForOrbit(
  clockwise,
  cx,
  cy,
  spinner,
  orbitIndex,
  spinners
) {
  var orbitR = spinner.orbitR;
  var startAngle = ((2 * Math.PI) / spinners.length) * orbitIndex;
  var startPoint = positionOnCircle(cx, cy, startAngle, orbitR);

  // var debugColor = ['red', 'orange', 'yellow', 'green', 'blue'][orbitIndex];
  // this.addDebugCircleD3(startPoint, debugColor);

  var rx = orbitR;
  var ry = orbitR;
  var xAxisRotation = 0;
  var largeArcFlag = 1;
  var sweepFlag = clockwise ? 1 : 0;

  var vectorToOpposite = {
    x: -2 * (startPoint.x - cx),
    y: -2 * (startPoint.y - cy)
  };

  // this.addDebugCircleD3({
  //   x: startPoint.x + vectorToOpposite.x,
  //   y: startPoint.y + vectorToOpposite.y
  // },
  // debugColor);

  // Example data path:
  // <path d="M0,400
  //          a200,200 0 1 0 400,0
  //          a200,200 0 1 0 -400,0"
  //       fill="green" stroke="blue" stroke-width="5" id="redOrbit" />

  var path =
    // Move command
    'M' +
    startPoint.x +
    ',' +
    startPoint.y +
    ' ' +
    // First arc command
    'a' +
    rx +
    ',' +
    ry +
    ' ' +
    xAxisRotation +
    ' ' +
    largeArcFlag +
    ' ' +
    sweepFlag +
    ' ' +
    vectorToOpposite.x +
    ',' +
    vectorToOpposite.y +
    ' ' +
    // Second arc command
    'a' +
    rx +
    ',' +
    ry +
    ' ' +
    xAxisRotation +
    ' ' +
    largeArcFlag +
    ' ' +
    sweepFlag +
    ' ' +
    -vectorToOpposite.x +
    ',' +
    -vectorToOpposite.y;

  return path;
}

function positionOnCircle(cx, cy, angle, radius) {
  var y = radius * Math.sin(angle);
  var x = radius * Math.cos(angle);
  return { x: cx + x, y: cy + y };
}

module.exports = renderSpinners;
