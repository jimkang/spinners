var d3 = require('d3-selection');
var Timer = require('d3-timer').timer;
require('d3-transition');
//var accessor = require('accessor');
//var renderLayers = require('./render-layers');
//var { makeOrbitForSpinner, getOrbitIdForSpinner } = require('./orbit');
//var ep = require('errorback-promise');
var curry = require('lodash.curry');
var {
  diameter,
  getLeft,
  getTop
  //getTransform,
  //getDuration,
  //getAnimateStartRotation,
  //getAnimateEndRotation,
  //getOrbitDuration
} = require('./spinner-accessors');
//var board = d3.select('#board');
//var orbitPathRoot = board.select('#orbit-paths');
//var addClickTarget = require('./add-click-target');
var shouldDisplaySublayout = require('./should-display-sublayout');
var handleError = require('handle-error-web');
var loadImagesFromSpinners = require('./load-images-from-spinners');
var sb = require('standard-bail')();

var boardCanvas = d3.select('#board-canvas');
//var targetsCanvas = d3.select('#targets-canvas');

var boardCtx = boardCanvas.node().getContext('2d');
var timer;

//const transitionTime = 2000;
const viewBoxWidth = 100;

function renderSpinners({
  spinnerData,
  //layer,
  currentlyWithinASublayout = false,
  layoutStyle,
  onClick,
  probable,
  inheritedTransforms = []
}) {
  const boardWidth = boardCanvas.attr('width');
  const boardHeight = boardCanvas.attr('height');
  const canvasUnitsPerViewBoxUnit = boardWidth / viewBoxWidth;
  if (timer) {
    timer.stop();
  }

  var imagesByURL = {};
  loadImagesFromSpinners(
    { imageDict: imagesByURL, spinnerData },
    sb(startTimer, handleError)
  );

  return;

  function startTimer() {
    timer = Timer(update);
  }

  function update(elapsed) {
    spinnerData.forEach(curry(updateSpinner)(elapsed));
    draw();
  }

  // Transform elements go:
  // [xScale, ySkew, xSkew, yScale, xTranslate, yTranslate]
  // All radiuses on spinners are specified in relation to a
  // viewBox with a widthof 100.
  // speed: The inverse of the speed in how many seconds it takes for
  // a spinner to rotate all the way (2 pi radians).
  function updateSpinner(elapsed, spinner) {
    const scale = getScaleForSpinner(spinner);
    var scaleAndTranslateTransform = [
      scale,
      0,
      0,
      scale,
      scaleToViewBox(getLeft(spinner)),
      scaleToViewBox(getTop(spinner))
    ];

    const msPerRotation = 1000 / spinner.data.speed;
    const rotation = ((2 * Math.PI * elapsed) / msPerRotation) % (2 * Math.PI);
    //console.log(elapsed, rotation);
    const rotCos = Math.cos(rotation);
    const rotSin = Math.sin(rotation);
    const unscaledRInCanvasUnits =
      (spinner.r * canvasUnitsPerViewBoxUnit) / scale;
    // Rotation around the center is a translation moving the
    // center to the upper left corner, then rotating around that corner,
    // then translating things back.
    // When you multiply those three 3x3 matrices together, you get
    // this:
    var rotateAroundCenterTransform = [
      rotCos,
      rotSin,
      -rotSin,
      rotCos,
      -unscaledRInCanvasUnits * rotCos +
        unscaledRInCanvasUnits * rotSin +
        unscaledRInCanvasUnits,
      -unscaledRInCanvasUnits * rotSin -
        unscaledRInCanvasUnits * rotCos +
        unscaledRInCanvasUnits
    ];
    //console.log(scaleAndTranslateTransform);
    spinner.transform = multiplyTransforms(
      scaleAndTranslateTransform,
      rotateAroundCenterTransform
    );
    //spinner.transform = rotateAroundCenterTransform;
    //console.log(spinner.transform);
  }

  function draw() {
    boardCtx.save();
    boardCtx.clearRect(0, 0, boardWidth, boardHeight);
    spinnerData.forEach(drawSpinner);
    boardCtx.restore();
  }

  function drawSpinner(spinner) {
    // TODO: This should probably be multiply.
    var transform = inheritedTransforms.reduce(addMatrices, spinner.transform);
    var image = imagesByURL[spinner.data.image.url];
    //console.log('sDiameter', sDiameter);
    boardCtx.save();
    boardCtx.setTransform.apply(boardCtx, transform);
    //console.log('Drawing', spinner.data.image.url);
    boardCtx.drawImage(image.img, 0, 0, image.width, image.height);
    boardCtx.restore();
  }

  function addMatrices(v1, v2) {
    return [
      v1[0] + v2[0],
      v1[1] + v2[1],
      v1[2] + v2[2],
      v1[3] + v2[3],
      v1[4] + v2[4],
      v1[5] + v2[5]
    ];
  }

  // The goal is to fit it into its diameter.
  function getScaleForSpinner(spinner) {
    var image = imagesByURL[spinner.data.image.url];
    var longestSide = image.width;
    if (image.height > longestSide) {
      longestSide = image.height;
    }
    return (diameter(spinner) * canvasUnitsPerViewBoxUnit) / longestSide;
  }

  /*
  // Original DOM renderSpinners.
  var spinnerRoot = d3.select('#' + layer.id);
  var spinners = spinnerRoot
    .selectAll('.spinner')
    .data(spinnerData, accessor({ path: 'data/id' }));

  spinners.exit().remove();

  var newSpinners = spinners
    .enter()
    .append('g')
    .classed('spinner', true)
    .classed('sublayout', shouldDisplaySublayout)
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
      .attr('dur', getOrbitDuration)
      .attr('repeatCount', 'indefinite');
    orbitAnimations
      .append('mpath')
      .attr('xlink:href', s => `#${getOrbitIdForSpinner(s)}`);
  }

  var updatableSpinners = newSpinners.merge(spinners);

  updatableSpinners
    .attr('id', accessor({ path: 'data/id' }))
    .filter(isAPlainSpinner)
    .select('.rotation-group')
    .select('image')
    .attr('xlink:href', accessor({ path: 'data/image/url' }))
    .transition()
    .duration(transitionTime)
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', diameter)
    .attr('height', diameter);

  if (layoutStyle === 'orbit') {
    let paths = orbitPathRoot
      .selectAll('.orbit-path')
      .data(spinnerData.map(makeOrbitForSpinner), accessor());
    paths.exit().remove();
    paths
      .enter()
      .append('path')
      .merge(paths)
      .attr('id', accessor())
      .transition()
      .duration(transitionTime)
      .attr('d', accessor('d'));
  }

  // Do this after other subelements are added to ensure
  // click-target is on top so that it can be clicked on mobile clients.
  newSpinners.each(curry(addClickTarget)(onClick, probable));

  updatableSpinners.filter(shouldDisplaySublayout).each(renderSublayout);

  updatableSpinners
    .select('.rotation-transform')
    .attr('from', getAnimateStartRotation)
    .attr('to', getAnimateEndRotation)
    .attr('dur', getDuration);

  if (layoutStyle !== 'orbit') {
    updatableSpinners
      .transition()
      .duration(transitionTime)
      .attr('transform', getTransform);
  }
  updatableSpinners
    .select('.rotation-group')
    .transition()
    .duration(transitionTime)
    .attr('width', diameter)
    .attr('height', diameter);

  // if (layoutStyle !== 'orbit') {
  //   setTimeout(checkSpinnerTransforms, transitionTime + 100);
  // }

  // function checkSpinnerTransforms() {
  //   var spinners = spinnerRoot.selectAll('.spinner');
  //   spinners.each(checkSpinnerTransform);
  // }

  async function renderSublayout(spinner) {
    if (currentlyWithinASublayout) {
      // TODO: Some sort of non-recursive representation of the sublayout.
      return;
    }

    var { layers, spinnerDataForLayers, layoutStyle } = spinner.data.sublayout;

    var sublayoutContainer = d3.select(this);

    // Render only one of the layers to avoid being overwhelming.
    var layer = layers[layers.length - 1];
    await ep(renderLayers, {
      layerData: [layer],
      parentSelection: sublayoutContainer,
      scale: diameter(spinner) / 100,
      offsetX: 0,
      offsetY: 0
    });
    for (
      // Top layer only.
      var i = spinnerDataForLayers.length - 1;
      i < spinnerDataForLayers.length;
      ++i
    ) {
      renderSpinners({
        spinnerData: spinnerDataForLayers[i],
        layer,
        currentlyWithinASublayout: true,
        layoutStyle,
        onClick,
        probable
      });
    }

    addClickTarget.bind(this)(onClick, probable, spinner);
  }
  */

  function scaleToViewBox(n) {
    return n * canvasUnitsPerViewBoxUnit;
  }
}

function isAPlainSpinner(s) {
  return !shouldDisplaySublayout(s);
}

function addRotationTransform({ spinnersSel, className, type = 'rotate' }) {
  return (
    spinnersSel
      .append('animateTransform')
      .attr('attributeName', 'transform')
      .attr('attributeType', 'XML')
      .attr('type', type)
      // Important for not cancelling out the translate transform:
      .attr('additive', 'sum')
      .attr('repeatCount', 'indefinite')
      .classed(className, true)
  );
}

// function checkSpinnerTransform() {
//  if (!this.getAttribute('transform')) {
//    var animateChild = d3.select(this).select('animateMotion');
//    if (animateChild.empty()) {
//      console.log(this.id, 'has no transform and no animateMotion child.');
//    }
//  }
// }

function multiplyTransforms(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5]
  ];
}

module.exports = renderSpinners;
