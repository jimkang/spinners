var renderSpinners = require('../dom/render-spinners');
var renderLayers = require('../dom/render-layers');
var seedrandom = require('seedrandom');
var SpinnerTables = require('../spinner-tables');
var LayoutTable = require('../layout-table');
var hierarchy = require('d3-hierarchy');
var Probable = require('probable').createProbable;
var RandomId = require('@jimkang/randomid');
var convertToArray = require('../convert-to-array');
var curry = require('lodash.curry');
//var cloneDeep = require('lodash.clonedeep');
var ep = require('errorback-promise');

function SpinnerFlow({ seed, onClick }) {
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

  async function goSpinnerFlow({
    layers,
    layoutStyle,
    syncPositionsAcrossLayers
  }) {
    var probable = Probable({ random });
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

    function getSpinnerDataForLayers({
      syncPositionsAcrossLayers,
      layers,
      currentDepth,
      layoutStyle
    }) {
      var useOrbits = layoutStyle === 'orbit';
      var spinnerDataForLayers;
      let buildSpinners = buildSpinnersForPackLayer;
      if (useOrbits) {
        buildSpinners = buildSpinnersForOrbitLayer;
      }

      if (syncPositionsAcrossLayers && layers.length > 0) {
        let baseLayerSpinners = buildSpinners(currentDepth, layers[0]);
        spinnerDataForLayers = [baseLayerSpinners];
        for (let i = 1; i < layers.length; ++i) {
          spinnerDataForLayers.push(
            wrapInPositionObjects({
              src: baseLayerSpinners,
              spinnerData: layers[i].spinnerTypes.map(
                curry(makeSpinnerForKey)(currentDepth)
              ),
              layerIndex: i
            })
          );
        }
      } else {
        let buildSpinners = buildSpinnersForPackLayer;
        if (useOrbits) {
          buildSpinners = buildSpinnersForOrbitLayer;
        }
        spinnerDataForLayers = layers.map(curry(buildSpinners)(currentDepth));
      }
      return spinnerDataForLayers;
    }

    function buildSpinnersForPackLayer(currentDepth, layer) {
      var spinners = layer.spinnerTypes.map(
        curry(makeSpinnerForKey)(currentDepth)
      );
      var tree = hierarchy.hierarchy({
        id: 'root',
        children: spinners
      });
      tree.sum(getArea);
      return pack(tree).children;
    }

    function buildSpinnersForOrbitLayer(currentDepth, layer) {
      return layer.spinnerTypes.map(
        curry(makeOrbitingSpinnerForKey)(currentDepth)
      );
    }

    function makeSpinnerForKey(currentDepth, key) {
      var spinner = spinnerTables[key].roll();
      if (key === 'expander') {
        addSublayoutToSpinner({ spinner, currentDepth });
      }
      return spinner;
    }

    function makeOrbitingSpinnerForKey(currentDepth, key, i, keys) {
      var spinner = makeSpinnerForKey(currentDepth, key);
      spinner.orbitR = (50 / keys.length) * i;

      return {
        data: spinner,
        x: 50 + (50 / keys.length) * i,
        y: 50,
        r: spinner.r
      };
    }

    function addSublayoutToSpinner({ spinner, currentDepth }) {
      // Avoid recursing infinitely.
      if (currentDepth > 0) {
        return;
      }

      //console.log('adding sublayout', currentDepth);
      let subSeed = randomId(8);
      let layoutTable = LayoutTable({ random: seedrandom(subSeed) });
      let result;
      let layers;
      result = layoutTable.roll();
      // TODO: tablenest needs to preserve the array-ness of a def.
      layers = convertToArray(result.layers);

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
      /*
        // Copy and enlarge one spinner to mostly cover the rest.
        let topSpinners =
          spinner.sublayout.spinnerDataForLayers[
            spinner.sublayout.spinnerDataForLayers.length - 1
          ];
        let coverSpinner = cloneDeep(probable.pick(topSpinners));
        coverSpinner.data.id = coverSpinner.data.id + '-embiggened';
        coverSpinner.data.cover = true;
        coverSpinner.r = 50;
        coverSpinner.x = 50;
        coverSpinner.y = 50;
        topSpinners.push(coverSpinner);
        */
    }
  }

  // Calling renderSpinners directly via forEach will end up passing it
  // the array of spinners as the third param, which is undesirable.
  function callRenderSpinners(layoutStyle, layers, spinnerDataForLayer, i) {
    renderSpinners({
      spinnerData: spinnerDataForLayer,
      layer: layers[i],
      layoutStyle,
      onClick
    });
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
