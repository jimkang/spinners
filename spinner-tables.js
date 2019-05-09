var { Tablenest, r, f, d } = require('tablenest');
var images = require('./images');
var RandomId = require('@jimkang/randomid');

// The duration of the rotation will be 1/speed seconds.
// e.g. speed 60 => 1/60 s duration. speed 0.5 => 2s duration.
// speed 5 => 0.2 s duration
var speedTables = {
  relaxed: [[1, d`d4x0.1`], [1, d`d4x0.2`]],
  anySpeed: [
    [16, d`d4x0.1`],
    [32, d`d4x0.2`],
    [8, d`d4x0.4`],
    [2, d`d4x0.6`],
    [1, d`d10x0.2`],
    [1, d`d10x0.4`],
    [1, d`d10x0.6`],
    [1, d`d10x0.8`],
    [1, d`d10`]
  ]
};

function SpinnerTables({ random }) {
  var tablenest = Tablenest({ random });
  var randomId = RandomId({ random });

  var getId = f(() => 'spinner-' + randomId(4));

  return {
    literalSpinner: makeSpinnerTable({
      radius: d`d20+4`,
      images: [[2, images.redFidgetSpinner], [1, images.yellowFidgetSpinner]],
      speedKey: 'anySpeed'
    }),
    ammonite: makeSpinnerTable({
      radius: d`d15+9`,
      images: [[3, images.ammonite], [2, images.inkAmmonite]]
    }),
    clockFace: makeSpinnerTable({
      radius: d`d6+5`,
      images: images.officeClockFace
    }),
    clockHourHand: makeSpinnerTable({
      radius: d`d6+5`,
      images: images.officeClockHourHand,
      speedKey: 'anySpeed'
    }),
    clockMinuteHand: makeSpinnerTable({
      radius: d`d6+5`,
      images: images.officeClockMinuteHand,
      speedKey: 'anySpeed'
    }),
    cat: makeSpinnerTable({
      radius: d`d6+5`,
      images: [
        [32, images.bonusMorphBall],
        [32, images.bonusMorphBall2],
        [1, images.bonusMorphBall3],
        [28, images.wilyMorphBall],
        [32, images.wilyMorphBall2]
      ]
    }),
    pizza: makeSpinnerTable({
      radius: d`d20+5`,
      images: images.pizza,
      speedKey: 'anySpeed'
    }),
    expander: makeSpinnerTable({
      radius: d`d6+5`,
      images: [
        // Placeholder.
        [32, images.wilyMorphBall2]
      ]
    })
  };

  function makeSpinnerTable({ radius, images, speedKey = 'relaxed' }) {
    return tablenest({
      root: r({
        id: getId,
        image: r`images`,
        r: radius,
        speed: r`speed`
      }),
      images,
      speed: speedTables[speedKey]
    });
  }
}

module.exports = SpinnerTables;
