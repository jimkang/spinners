var renderSpinners = require('../dom/render-spinners');
var renderLayers = require('../dom/render-layers');
var seedrandom = require('seedrandom');
var SpinnerTables = require('../spinner-tables');
var hierarchy = require('d3-hierarchy');
var Probable = require('probable').createProbable;
var RandomId = require('@jimkang/randomid');
var curry = require('lodash.curry');
//var cloneDeep = require('lodash.clonedeep');
var ep = require('errorback-promise');
var scheduleHalos = require('../dom/schedule-halos');
var {
  makeSpinnerForKey,
  makeOrbitingSpinnerForKey
} = require('./spinner-makers');

function SpinnerFlow({ seed, onClick }) {
  var random = seedrandom(seed);
  var spinnerTables = SpinnerTables({ random });
  var pack = hierarchy.pack().size([100, 100]);
  var randomId = RandomId({ random });
  var probable = Probable({ random });

  return {
    getSeed() {
      return seed;
    },
    go: goSpinnerFlow
  };

  async function goSpinnerFlow({
    layers,
    layoutStyle,
    syncPositionsAcrossLayers,
    maxLayers = 100, // Applies to layers in sublayouts.
    maxSublayouts = 10000
  }) {
    var sublayoutCounter = { numberOfSublayoutsAdded: 0 };
    var darkBG = probable.roll(3) > 0;
    document.body.classList[darkBG ? 'add' : 'remove']('dark');
    document.body.classList[darkBG ? 'remove' : 'add']('light');

    var renderLayerResult = await ep(renderLayers, { layerData: layers });
    if (renderLayerResult.error) {
      console.error(renderLayerResult.error, renderLayerResult.error.stack);
      return;
    }
    var spinnerDataForLayers = getSpinnerDataForLayers({
      syncPositionsAcrossLayers,
      layers: layers.filter(
        curry(layersDoNotMatch)(renderLayerResult.values[0])
      ),
      currentDepth: 0,
      layoutStyle
    });
    spinnerDataForLayers.forEach(
      curry(callRenderSpinners)(layoutStyle, layers)
    );
    scheduleHalos({ probable });

    function getSpinnerDataForLayers({
      syncPositionsAcrossLayers,
      layers,
      currentDepth,
      layoutStyle
    }) {
      var useOrbits = layoutStyle === 'orbit';
      var spinnerDataForLayers;
      var buildSpinners = buildSpinnersForPackLayer;
      if (useOrbits) {
        buildSpinners = buildSpinnersForOrbitLayer;
      }

      if (syncPositionsAcrossLayers && layers.length > 0) {
        let baseLayerSpinners = buildSpinners(currentDepth, layers[0]);
        spinnerDataForLayers = [baseLayerSpinners];
        for (let i = 1; i < layers.length; ++i) {
          const isClockLayer = layers[i].layerType !== 'clock';
          if (useOrbits) {
            spinnerDataForLayers.push(
              layers[i].spinnerTypes.map(
                curry(makeOrbitingSpinnerForKey)(
                  currentDepth,
                  isClockLayer,
                  spinnerTables,
                  sublayoutCounter,
                  maxSublayouts,
                  maxLayers,
                  randomId,
                  getSpinnerDataForLayers
                )
              )
            );
          } else {
            spinnerDataForLayers.push(
              wrapInPositionObjects({
                src: baseLayerSpinners,
                spinnerData: layers[i].spinnerTypes.map(
                  curry(makeSpinnerForKey)(
                    currentDepth,
                    isClockLayer,
                    spinnerTables,
                    sublayoutCounter,
                    maxSublayouts,
                    maxLayers,
                    randomId,
                    getSpinnerDataForLayers
                  )
                ),
                layerIndex: i
              })
            );
          }
        }
      } else {
        let buildSpinners = buildSpinnersForPackLayer;
        if (useOrbits) {
          buildSpinners = buildSpinnersForOrbitLayer;
        }
        spinnerDataForLayers = layers.map(curry(buildSpinners)(currentDepth));
      }

      /*
      if (
        useOrbits &&
        spinnerDataForLayers.some(data =>
          data.some(sp => isNaN(sp.data.orbitR))
        )
      ) {
        debugger;
      }
      */
      return spinnerDataForLayers;
    }

    function buildSpinnersForPackLayer(currentDepth, layer) {
      const isClockLayer = layer.layerType !== 'clock';
      var spinners = layer.spinnerTypes.map(
        curry(makeSpinnerForKey)(
          currentDepth,
          isClockLayer,
          spinnerTables,
          sublayoutCounter,
          maxSublayouts,
          maxLayers,
          randomId,
          getSpinnerDataForLayers
        )
      );
      var tree = hierarchy.hierarchy({
        id: 'root',
        children: spinners
      });
      tree.sum(getArea);
      return pack(tree).children;
    }

    function buildSpinnersForOrbitLayer(currentDepth, layer) {
      const isClockLayer = layer.layerType !== 'clock';
      return layer.spinnerTypes.map(
        curry(makeOrbitingSpinnerForKey)(
          currentDepth,
          isClockLayer,
          spinnerTables,
          sublayoutCounter,
          maxSublayouts,
          maxLayers,
          randomId,
          getSpinnerDataForLayers
        )
      );
    }
  }
  // Calling renderSpinners directly via forEach will end up passing it
  // the array of spinners as the third param, which is undesirable.
  function callRenderSpinners(layoutStyle, layers, spinnerDataForLayer, i) {
    renderSpinners({
      spinnerData: spinnerDataForLayer,
      layer: layers[i],
      layoutStyle,
      onClick,
      probable
    });
  }
}

function getArea(spinner) {
  return Math.PI * spinner.r * spinner.r;
}

function wrapInPositionObjects({ src, spinnerData, layerIndex }) {
  var posObjs = [];
  for (var i = 0; i < src.length && i < spinnerData.length; ++i) {
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

function layersDoNotMatch(l1, l2) {
  if (!l1) {
    return true;
  }
  if (!l2) {
    return true;
  }
  if (l1.id !== l2.id) {
    return true;
  }
  return false;
}

module.exports = SpinnerFlow;
