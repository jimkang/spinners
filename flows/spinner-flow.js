var renderSpinners = require('../dom/render-spinners');
var renderLayers = require('../dom/render-layers');
var seedrandom = require('seedrandom');
var SpinnerTables = require('../spinner-tables');
var hierarchy = require('d3-hierarchy');
var Probable = require('probable').createProbable;

function SpinnerFlow({ seed }) {
  var random = seedrandom(seed);
  var spinnerTables = SpinnerTables({ random });
  var pack = hierarchy.pack().size([100, 100]);

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

    var spinnerDataForLayers;
    if (syncPositionsAcrossLayers && layers.length > 0) {
      let baseLayerSpinners = buildSpinnersForLayer(layers[0]);
      spinnerDataForLayers = [baseLayerSpinners];
      for (let i = 1; i < layers.length; ++i) {
        spinnerDataForLayers.push(
          wrapInPositionObjects({
            src: baseLayerSpinners,
            spinnerData: layers[i].map(makeSpinnerForKey),
            layerIndex: i
          })
        );
      }
    } else {
      spinnerDataForLayers = layers.map(buildSpinnersForLayer);
    }
    spinnerDataForLayers.forEach(renderSpinners);
  }

  function buildSpinnersForLayer(layer) {
    var spinners = layer.map(makeSpinnerForKey);
    var tree = hierarchy.hierarchy({
      id: 'root',
      children: spinners
    });
    tree.sum(getArea);
    return pack(tree).children;
  }

  function makeSpinnerForKey(key) {
    if (key === 'expander') {
      // TODO. Get sub-layout!
      return spinnerTables['cat'].roll();
    } else {
      return spinnerTables[key].roll();
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

module.exports = SpinnerFlow;
