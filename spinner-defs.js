var { Tablenest, r, f } = require('tablenest');
var images = require('./images');
var RandomId = require('@jimkang/randomid');

var literalSpinnerImages = [
  [2, images.redFidgetSpinner],
  [1, images.yellowFidgetSpinner]
];

var ammoniteImages = [[3, images.ammonite], [2, images.inkAmmonite]];

function SpinnerDefs({ random }) {
  var tablenest = Tablenest({ random });
  var randomId = RandomId({ random });

  var getId = f(() => 'spinner-' + randomId(4));

  var literalSpinner = r({
    id: getId,
    style: 'spinner',
    image: r`literalSpinnerImages`,
    r: f((result, p) => 5 + p.roll(20)),
    duration: f((result, p) => `${0.2 + p.roll(10)}s`)
  });

  var ammoniteSpinner = r({
    id: getId,
    style: 'spinner',
    image: r`ammoniteImages`,
    r: f((result, p) => 10 + p.roll(15)),
    duration: f((result, p) => `${p.rollDie(50) / 5}s`)
  });

  // TODO: Multilayered layouts.
  return {
    default: tablenest({
      root: [[1, literalSpinner]],
      literalSpinnerImages
    }),
    ammonites: tablenest({
      root: [[1, ammoniteSpinner]],
      ammoniteImages
    })
  };
}

module.exports = SpinnerDefs;
