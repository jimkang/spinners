var d3 = require('d3-selection');
var Timer = require('d3-timer').timer;
require('d3-transition');
var accessor = require('accessor');
var renderLayers = require('./render-layers');
var { makeOrbitForSpinner, getOrbitIdForSpinner } = require('./orbit');
var ep = require('errorback-promise');
var curry = require('lodash.curry');
var {
  diameter,
  getLeft,
  getTop,
  getTransform,
  getDuration,
  getAnimateStartRotation,
  getAnimateEndRotation,
  getOrbitDuration
} = require('./spinner-accessors');
var board = d3.select('#board');
var orbitPathRoot = board.select('#orbit-paths');
var addClickTarget = require('./add-click-target');
var shouldDisplaySublayout = require('./should-display-sublayout');
var handleError = require('handle-error-web');
var loadImagesFromSpinners = require('./load-images-from-spinners');
var sb = require('standard-bail')();

var boardCanvas = d3.select('#board-canvas');
var targetsCanvas = d3.select('#targets-canvas');

const boardWidth = boardCanvas.attr('width');
const boardHeight = boardCanvas.attr('height');

var boardCtx = boardCanvas.node().getContext('2d');
var timer;

const transitionTime = 2000;

function renderSpinners({
  spinnerData,
  layer,
  currentlyWithinASublayout = false,
  layoutStyle,
  onClick,
  probable
}) {
  if (timer) {
    timer.cancel();
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

  function updateSpinner(elapsed, spinner) {}

  function draw() {
    boardCtx.save();
    boardCtx.clearRect(0, 0, boardWidth, boardHeight);
    spinnerData.forEach(drawSpinner);
    boardCtx.restore();
  }

  function drawSpinner(spinner) {
    // TODO: Layer transform
    //boardCtx.save();
    const x = getLeft(spinner);
    const y = getTop(spinner);
    //boardCtx.translate(x, y);
    //console.log('Drawing', spinner.data.image.url);
    boardCtx.drawImage(imagesByURL[spinner.data.image.url], 0, 0);
    //boardCtx.restore();
  }

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

module.exports = renderSpinners;
