var renderSpinners = require('../dom/render-spinners');
var seedrandom = require('seedrandom');
var Probable = require('probable').createProbable;
var SpinnerDefs = require('../spinner-defs');
var hierarchy = require('d3-hierarchy');

function SpinnerFlow({ seed }) {
  var random = seedrandom(seed);
  var probable = Probable({ random });
  var spinnerDefs = SpinnerDefs({ probable });
  var pack = hierarchy.pack().size([100, 100]);

  return {
    getSeed() {
      return seed;
    },
    go: goSpinnerFlow
  };

  function goSpinnerFlow({
    layout = [
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
  }) {
    var tree = hierarchy.hierarchy({
      id: 'root',
      children: layout.map(makeSpinnerForKey)
    });
    tree.sum(getArea);
    var spinnerData = pack(tree).children;
    renderSpinners({ spinnerData });
  }

  function makeSpinnerForKey(key) {
    return spinnerDefs[key].roll();
  }
}

function getArea(spinner) {
  return Math.PI * spinner.r * spinner.r;
}

module.exports = SpinnerFlow;
