var d3 = require('d3-selection');
require('d3-transition');
var accessor = require('accessor');
var pathExists = require('object-path-exists');
var renderLayers = require('./render-layers');
var { makeOrbitForSpinner, getOrbitIdForSpinner } = require('./orbit');
var ep = require('errorback-promise');
var curry = require('lodash.curry');

var board = d3.select('#board');
var orbitPathRoot = board.select('#orbit-paths');

const transitionTime = 2000;

function renderSpinners({
  spinnerData,
  layer,
  currentlyWithinASublayout = false,
  layoutStyle,
  onClick
}) {
  squarifyBoard();

  var spinnerRoot = d3.select('#' + layer.id);
  var spinners = spinnerRoot
    .selectAll('.spinner')
    .data(spinnerData, accessor({ path: 'data/id' }));

  spinners.exit().remove();

  var newSpinners = spinners
    .enter()
    .append('g')
    .classed('spinner', true)
    .classed('sublayout', spinnerHasASublayout)
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
  newSpinners.each(curry(addClickTarget)(onClick));

  updatableSpinners.filter(spinnerHasASublayout).each(renderSublayout);

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
        onClick
      });
    }

    addClickTarget.bind(this)(onClick, spinner);
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

function getOrbitDuration(d) {
  if (d.data.orbitSpeed) {
    return 1.0 / d.data.orbitSpeed;
  } else {
    return 10;
  }
}

function squarifyBoard() {
  var boardWidth = board.node().getBoundingClientRect().width;
  board.attr('height', boardWidth);
}

function isAPlainSpinner(s) {
  return !pathExists(s, ['data', 'sublayout', 'layers']);
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
      // Important for not cancelling out the translate transform:
      .attr('additive', 'sum')
      .attr('repeatCount', 'indefinite')
      .classed(className, true)
  );
}

function addClickTarget(onClick, spinner) {
  var root = d3.select(this);
  // Select only the direct .click-target descendant
  // of this element.
  var target = d3.select(`#${this.id} > .click-target`);
  if (target.empty()) {
    target = root
      .append('circle')
      .datum(spinner)
      .classed('click-target', true);
  }
  target
    .attr('r', spinner.r)
    .attr('cx', spinner.r)
    .attr('cy', spinner.r);

  target.on('click', onClick);
}

// function checkSublayoutLayers() {
//   var sublayoutLayers = d3.selectAll('.sublayout > .layer');
//   var slData = sublayoutLayers.data();
//   console.log('sublayout layer data:', slData);
// }

module.exports = renderSpinners;
