var { Tablenest, r, f, d } = require('tablenest');
var images = require('./images');
var RandomId = require('@jimkang/randomid');

var literalSpinnerImages = [
  [2, images.redFidgetSpinner],
  [1, images.yellowFidgetSpinner]
];

var ammoniteImages = [[3, images.ammonite], [2, images.inkAmmonite]];

var clockFaceImages = [[1, images.officeClockFace]];
var clockHourHandImages = [[1, images.officeClockHourHand]];
var clockMinuteHandImages = [[1, images.officeClockMinuteHand]];

var catImages = [
  [32, images.bonusMorphBall],
  [32, images.bonusMorphBall2],
  [1, images.bonusMorphBall3],
  [28, images.wilyMorphBall],
  [32, images.wilyMorphBall2]
];

var pizzaImages = [[1, images.pizza]];

function SpinnerTables({ random }) {
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

  // TODO: Coordinate centers with other layers.
  var clockFaceSpinner = r({
    id: getId,
    style: 'spinner',
    image: r`clockFaceImages`,
    r: d`d6+5`,
    duration: d`d50+0.2`
  });

  var clockHourHandSpinner = r({
    id: getId,
    style: 'spinner',
    image: r`clockHourHandImages`,
    r: d`d6+5`,
    duration: d`2d10`
  });

  var clockMinuteHandSpinner = r({
    id: getId,
    style: 'spinner',
    image: r`clockMinuteHandImages`,
    r: d`d6+5`,
    duration: f((o, p) => p.rollDie(20) / 10) // TODO: Make this work in dicecup: d`d6/10`
  });

  var catSpinner = r({
    id: getId,
    style: 'spinner',
    image: r`catImages`,
    r: d`d6+5`,
    duration: f((result, p) => `${5 + p.rollDie(25) / 5}s`)
  });

  var pizzaSpinner = r({
    id: getId,
    style: 'spinner',
    image: r`pizzaImages`,
    r: f((result, p) => 5 + p.roll(20)),
    duration: f((result, p) => `${0.2 + p.roll(10)}s`)
  });

  return {
    // TODO: Abstract this in tablenest.
    default: tablenest({
      root: [[1, literalSpinner]],
      literalSpinnerImages
    }),
    ammonites: tablenest({
      root: [[1, ammoniteSpinner]],
      ammoniteImages
    }),
    clockFaces: tablenest({
      root: [[1, clockFaceSpinner]],
      clockFaceImages
    }),
    clockHourHands: tablenest({
      root: [[1, clockHourHandSpinner]],
      clockHourHandImages
    }),
    clockMinuteHands: tablenest({
      root: [[1, clockMinuteHandSpinner]],
      clockMinuteHandImages
    }),
    cats: tablenest({
      root: [[1, catSpinner]],
      catImages
    }),
    pizzas: tablenest({
      root: [[1, pizzaSpinner]],
      pizzaImages
    })
  };
}

module.exports = SpinnerTables;
