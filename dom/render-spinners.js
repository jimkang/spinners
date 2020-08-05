var d3 = require('d3-selection');
//require('d3-transition');
var accessor = require('accessor');
var renderLayers = require('./render-layers');
var ep = require('errorback-promise');
var curry = require('lodash.curry');
var { diameter, negativeR, getTransform } = require('./spinner-accessors');
var board = d3.select('#board');
var addClickTarget = require('./add-click-target');
var shouldDisplaySublayout = require('./should-display-sublayout');
var orbitScheduler = require('./orbit-scheduler');

//const transitionTime = 500;

function renderSpinners({
  spinnerData,
  layer,
  currentlyWithinASublayout = false,
  layoutStyle,
  onClick,
  probable
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
    .classed('sublayout', shouldDisplaySublayout)
    .attr('width', 100)
    .attr('height', 100);

  var rotationGroups = newSpinners.append('g').classed('rotation-group', true);
  rotationGroups.filter(isAPlainSpinner).append('image');

  orbitScheduler.cancelOrbits();

  if (layoutStyle === 'orbit') {
    newSpinners.classed('orbiting-spinner', true);
    orbitScheduler.scheduleOrbits();
  }

  var updatableSpinners = newSpinners.merge(spinners);

  updatableSpinners
    .attr('id', accessor({ path: 'data/id' }))
    .filter(isAPlainSpinner)
    .select('.rotation-group')
    .attr('data-speed', accessor({ path: 'data/speed' }))
    .select('image')
    .attr('xlink:href', accessor({ path: 'data/image/url' }))
    //.transition()
    //.duration(transitionTime)
    // Setting the position like this is a hack that compensates for
    // CSS transforms of the .rotation-group not accepting
    // transform-origin settings and always rotating from the
    // top left corner.
    .attr('x', negativeR)
    .attr('y', negativeR)
    .attr('width', diameter)
    .attr('height', diameter);

  // Do this after other subelements are added to ensure
  // click-target is on top so that it can be clicked on mobile clients.
  newSpinners.each(curry(addClickTarget)(onClick, probable));

  updatableSpinners.filter(shouldDisplaySublayout).each(renderSublayout);

  if (layoutStyle !== 'orbit') {
    updatableSpinners
      //.transition()
      //.duration(transitionTime)
      .attr('transform', getTransform);
  }
  updatableSpinners
    .select('.rotation-group')
    //.transition()
    //.duration(transitionTime)
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
        onClick,
        probable
      });
    }

    addClickTarget.bind(this)(onClick, probable, spinner);
  }
}

function squarifyBoard() {
  var boardWidth = board.node().getBoundingClientRect().width;
  board.attr('height', boardWidth);
}

function isAPlainSpinner(s) {
  return !shouldDisplaySublayout(s);
}

module.exports = renderSpinners;
