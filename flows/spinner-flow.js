var renderSpinners = require('../dom/render-spinners');
var renderLayers = require('../dom/render-layers');
var seedrandom = require('seedrandom');
var SpinnerTables = require('../spinner-tables');
var layoutDef = require('../layout-def');
var hierarchy = require('d3-hierarchy');
var Probable = require('probable').createProbable;
var { Tablenest } = require('tablenest');
var RandomId = require('@jimkang/randomid');
var convertToArray = require('../convert-to-array');
var curry = require('lodash.curry');

function SpinnerFlow({ seed }) {
  var random = seedrandom(seed);
  var spinnerTables = SpinnerTables({ random });
  var pack = hierarchy.pack().size([100, 100]);
  var randomId = RandomId({ random });

  return {
    getSeed() {
      return seed;
    },
    go: goSpinnerFlow
  };

  function goSpinnerFlow({
    layers = [
      [
        'literalSpinner',
        'literalSpinner',
        'literalSpinner',
        'literalSpinner',
        'literalSpinner',
        'literalSpinner',
        'literalSpinner',
        'literalSpinner',
        'literalSpinner',
        'literalSpinner'
      ]
    ],
    syncPositionsAcrossLayers
  }) {
    var probable = Probable({ random });
    document.body.style.backgroundColor =
      probable.roll(3) > 0 ? 'black' : 'white';

    renderLayers({ layerCount: layers.length });
    var spinnerDataForLayers = getSpinnerDataForLayers({
      syncPositionsAcrossLayers,
      layers,
      currentDepth: 0
    });
    spinnerDataForLayers.forEach(callRenderSpinners);
  }

  function getSpinnerDataForLayers({
    syncPositionsAcrossLayers,
    layers,
    currentDepth
  }) {
    var spinnerDataForLayers;
    if (syncPositionsAcrossLayers && layers.length > 0) {
      let baseLayerSpinners = buildSpinnersForLayer(currentDepth, layers[0]);
      spinnerDataForLayers = [baseLayerSpinners];
      for (let i = 1; i < layers.length; ++i) {
        spinnerDataForLayers.push(
          wrapInPositionObjects({
            src: baseLayerSpinners,
            spinnerData: layers[i].map(curry(makeSpinnerForKey)(currentDepth)),
            layerIndex: i
          })
        );
      }
    } else {
      spinnerDataForLayers = layers.map(
        curry(buildSpinnersForLayer)(currentDepth)
      );
    }
    return spinnerDataForLayers;
  }

  function buildSpinnersForLayer(currentDepth, layer) {
    var spinners = layer.map(curry(makeSpinnerForKey)(currentDepth));
    var tree = hierarchy.hierarchy({
      id: 'root',
      children: spinners
    });
    tree.sum(getArea);
    return pack(tree).children;
  }

  function makeSpinnerForKey(currentDepth, key) {
    var spinner = spinnerTables[key].roll();
    if (key === 'expander') {
      addSublayoutToSpinner({ spinner, currentDepth });
    }
    return spinner;
  }

  function addSublayoutToSpinner({ spinner, currentDepth }) {
    let subSeed = randomId(8);
    let tablenest = Tablenest({ random: seedrandom(subSeed) });
    let layoutTable = tablenest(layoutDef);
    let result;
    let layers;
    do {
      result = layoutTable.roll();
      // TODO: tablenest needs to preserve the array-ness of a def.
      layers = convertToArray(result.layers);
      // No clocks in top layers of sublayouts for now. They look weird.
    } while (layers[layers.length - 1].indexOf('clockFace') !== -1);

    spinner.sublayout = { layers };
    // Avoid recursing infinitely.
    if (currentDepth < 1) {
      spinner.sublayout.spinnerDataForLayers = getSpinnerDataForLayers({
        layers,
        syncPositionsAcrossLayers: result.syncPositionsAcrossLayers,
        currentDepth: currentDepth + 1
      });
    }
  }
}

function getArea(spinner) {
  return Math.PI * spinner.r * spinner.r;
}

function wrapInPositionObjects({ src, spinnerData, layerIndex }) {
  var posObjs = [];
  for (var i = 0; i < src.length; ++i) {
    let srcPosObj = src[i];
    let posObj = Object.assign({}, srcPosObj);
    posObj.data = spinnerData[i];
    // Make sure it is not larger that the spinner in
    // the layer below.
    let maxR = srcPosObj.data.r * (1.0 - layerIndex * 0.2);
    if (maxR < posObj.data.r) {
      posObj.data.r = maxR;
    }
    posObjs.push(posObj);
  }
  return posObjs;
}

// Calling renderSpinners via forEach will end up passing it
// the array of spinners as the third param, which is undesirable.
function callRenderSpinners(spinnerData, layerNumber) {
  renderSpinners({ spinnerData, layerNumber });
}

module.exports = SpinnerFlow;
