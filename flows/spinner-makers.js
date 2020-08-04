var LayoutTable = require('../layout-table');
var convertToArray = require('../convert-to-array');
var seedrandom = require('seedrandom');

function makeSpinnerForKey(
  currentDepth,
  shouldMakeSublayout,
  spinnerTables,
  sublayoutCounter,
  maxSublayouts,
  maxLayers,
  randomId,
  getSpinnerDataForLayers,
  key
) {
  var spinner = spinnerTables[key].roll();
  if (
    shouldMakeSublayout &&
    sublayoutCounter.numberOfSublayoutsAdded < maxSublayouts
  ) {
    addSublayoutToSpinner({
      spinner,
      currentDepth,
      randomId,
      maxLayers,
      sublayoutCounter,
      getSpinnerDataForLayers
    });
  }
  return spinner;
}

function makeOrbitingSpinnerForKey(
  currentDepth,
  shouldMakeSublayout,
  spinnerTables,
  sublayoutCounter,
  maxSublayouts,
  maxLayers,
  randomId,
  getSpinnerDataForLayers,
  key,
  i,
  keys
) {
  var spinner = makeSpinnerForKey(
    currentDepth,
    shouldMakeSublayout,
    spinnerTables,
    sublayoutCounter,
    maxSublayouts,
    maxLayers,
    randomId,
    getSpinnerDataForLayers,
    key
  );
  spinner.orbitR = (50 / keys.length) * i;

  return {
    data: spinner,
    x: 50 + (50 / keys.length) * i,
    y: 50,
    r: spinner.r
  };
}

function addSublayoutToSpinner({
  spinner,
  currentDepth,
  randomId,
  maxLayers,
  sublayoutCounter,
  getSpinnerDataForLayers
}) {
  // Avoid recursing infinitely.
  if (currentDepth > 0) {
    //console.log('skipping');
    return;
  }

  let subSeed = randomId(8);
  let layoutTable = LayoutTable({ random: seedrandom(subSeed) });
  let result;
  let layers;
  do {
    result = layoutTable.roll();
    // TODO: tablenest needs to preserve the array-ness of a def.
    layers = convertToArray(result.layers).slice(0, maxLayers);
  } while (layers[layers.length - 1].layerType === 'clock');
  // The minute hand clock layers do not work well as sublayout top
  // layers because they don't show well on black backgrounds.

  // Make all sublayouts use orbit style for now.
  spinner.sublayout = {
    layers,
    syncPositionsAcrossLayers: result.syncPositionsAcrossLayers,
    layoutStyle: 'orbit', //result.layoutStyle,
    currentDepth: currentDepth + 1,
    seed: subSeed
  };
  spinner.sublayout.spinnerDataForLayers = getSpinnerDataForLayers(
    spinner.sublayout
  );
  sublayoutCounter.numberOfSublayoutsAdded += 1;
}

module.exports = {
  makeSpinnerForKey,
  makeOrbitingSpinnerForKey
};
