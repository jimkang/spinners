var d3 = require('d3-selection');
var accessor = require('accessor');
var pathExists = require('object-path-exists');
var renderLayers = require('./render-layers');
var { makeOrbitForSpinner, getOrbitIdForSpinner } = require('./orbit');

var board = d3.select('#board');
var orbitPathRoot = board.select('#orbit-paths');

function renderSpinners({
  spinnerData,
  layer,
  parentSelection = d3,
  currentlyWithinASublayout = false,
  layoutStyle
}) {
  squarifyBoard();

  var spinnerRoot = parentSelection.select('#' + layer.id);
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
      .data(spinnerData.map(makeOrbitForSpinner), accessor());
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

  function renderSublayout(spinner) {
    if (currentlyWithinASublayout) {
      // TODO: Some sort of non-recursive representation of the sublayout.
      return;
    }

    var {
      layers,
      spinnerDataForLayers,
      sublayoutStyle
    } = spinner.data.sublayout;

    var sublayoutContainer = d3.select(this);
    addClickTarget({ root: sublayoutContainer, spinner });

    // Render only one of the layers to avoid being overwhelming.
    var layer = layers[layers.length - 1];
    renderLayers({
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
        layer: layers[i],
        parentSelection: sublayoutContainer,
        currentlyWithinASublayout: true,
        layoutStyle: sublayoutStyle
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

function addClickTarget({ root, spinner }) {
  var target = root.select('.click-target');
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

  target.on('click', onSublayoutClick);
}

function onSublayoutClick(spinner) {
  console.log('spinner clicked:', spinner);
}

module.exports = renderSpinners;
