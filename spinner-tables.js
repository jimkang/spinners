var { Tablenest, r, f, d } = require('tablenest');
var images = require('./images');
var RandomId = require('@jimkang/randomid');

// The duration of the rotation will be 1/speed seconds.
// e.g. speed 60 => 1/60 s duration. speed 0.5 => 2s duration.
// speed 5 => 0.2 s duration
var speedTable = [
  [1, d`d4x0.2`],
  [1, d`d4x0.4`],
  [1, d`d4x0.6`],
  //[1, d`d10x0.2`],
  //[1, d`d10x0.4`],
  //[1, d`d10x0.6`],
  //[1, d`d10x0.8`],
  [1, d`d10`]
];

function SpinnerTables({ random }) {
  var tablenest = Tablenest({ random });
  var randomId = RandomId({ random });

  var getId = f(() => 'spinner-' + randomId(4));

  return {
    literalSpinner: makeSpinnerTable({
      radius: d`d20+4`,
      images: [[2, images.redFidgetSpinner], [1, images.yellowFidgetSpinner]]
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
      images: images.officeClockHourHand
    }),
    clockMinuteHand: makeSpinnerTable({
      radius: d`d6+5`,
      images: images.officeClockMinuteHand
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
      images: images.pizza
    })
  };

  function makeSpinnerTable({ radius, images }) {
    return tablenest({
      root: r({
        id: getId,
        image: r`images`,
        r: radius,
        speed: r`speed`
      }),
      images,
      speed: speedTable
    });
  }
}

module.exports = SpinnerTables;
