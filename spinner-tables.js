var { Tablenest, r, f, d } = require('tablenest');
var images = require('./images');
var RandomId = require('@jimkang/randomid');

var imageTables = {
  literalSpinner: [
    [2, images.redFidgetSpinner],
    [1, images.yellowFidgetSpinner]
  ],
  ammonite: [[3, images.ammonite], [2, images.inkAmmonite]],
  clockFace: images.officeClockFace,
  clockHourHand: images.officeClockHourHand,
  clockMinuteHand: images.officeClockMinuteHand,
  cat: [
    [32, images.bonusMorphBall],
    [32, images.bonusMorphBall2],
    [1, images.bonusMorphBall3],
    [28, images.wilyMorphBall],
    [32, images.wilyMorphBall2]
  ],
  pizza: images.pizza
};

function SpinnerTables({ random }) {
  var tablenest = Tablenest({ random });
  var randomId = RandomId({ random });

  var getId = f(() => 'spinner-' + randomId(4));

  var spinnerSubTables = {
    literalSpinner: r({
      id: getId,
      image: r`literalSpinnerImages`,
      r: f((result, p) => 5 + p.roll(20)),
      duration: f((result, p) => `${0.2 + p.roll(10)}s`)
    }),
    ammonite: r({
      id: getId,
      image: r`ammoniteImages`,
      r: f((result, p) => 10 + p.roll(15)),
      duration: f((result, p) => `${p.rollDie(50) / 5}s`)
    }),
    clockFace: r({
      id: getId,
      image: r`clockFaceImages`,
      r: d`d6+5`,
      duration: d`d50+0.2`
    }),
    clockHourHand: r({
      id: getId,
      image: r`clockHourHandImages`,
      r: d`d6+5`,
      duration: d`2d10`
    }),
    clockMinuteHand: r({
      id: getId,
      image: r`clockMinuteHandImages`,
      r: d`d6+5`,
      duration: f((o, p) => p.rollDie(20) / 10) // TODO: Make this work in dicecup: d`d6/10`
    }),
    cat: r({
      id: getId,
      image: r`catImages`,
      r: d`d6+5`,
      duration: f((o, p) => `${5 + p.rollDie(25) / 5}s`)
    }),
    pizza: r({
      id: getId,
      image: r`pizzaImages`,
      r: d`d20+5`,
      duration: f((o, p) => `${0.2 + p.roll(10)}s`)
    })
  };

  return makeTables({ spinnerSubTables, imageTables, tablenest });
}

function makeTables({ spinnerSubTables, imageTables, tablenest }) {
  var tables = {};
  for (var key in spinnerSubTables) {
    tables[key] = tablenest({
      root: spinnerSubTables[key],
      [key + 'Images']: imageTables[key]
    });
  }
  return tables;
}

module.exports = SpinnerTables;
