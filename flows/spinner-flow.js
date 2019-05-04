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
        'default',
        'default',
        'default',
        'default',
        'default',
        'default',
        'default',
        'default',
        'default',
        'default'
      ]
    ]
  }) {
    var probable = Probable({ random });
    document.body.style.backgroundColor =
      probable.roll(3) > 0 ? 'black' : 'white';

    renderLayers({ layerCount: layers.length });
    layers.forEach(buildSpinnersForLayer);
  }

  function buildSpinnersForLayer(layer, layerNumber) {
    var spinners = layer.map(makeSpinnerForKey);

    var tree = hierarchy.hierarchy({
      id: 'root',
      children: spinners
    });
    tree.sum(getArea);
    var spinnerData = pack(tree).children;
    renderSpinners({ spinnerData, layerNumber });
  }

  function makeSpinnerForKey(key) {
    return spinnerTables[key].roll();
  }
}

function getArea(spinner) {
  return Math.PI * spinner.r * spinner.r;
}

module.exports = SpinnerFlow;
