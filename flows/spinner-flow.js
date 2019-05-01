var renderSpinners = require('../dom/render-spinners');
var seedrandom = require('seedrandom');
var SpinnerTables = require('../spinner-tables');
var hierarchy = require('d3-hierarchy');

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
    var spinners = layout.map(makeSpinnerForKey);
    var tree = hierarchy.hierarchy({
      id: 'root',
      children: spinners
    });
    tree.sum(getArea);
    var spinnerData = pack(tree).children;
    renderSpinners({ spinnerData });
  }

  function makeSpinnerForKey(key) {
    return spinnerTables[key].roll();
  }
}

function getArea(spinner) {
  return Math.PI * spinner.r * spinner.r;
}

module.exports = SpinnerFlow;
