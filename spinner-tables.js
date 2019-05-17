var { Tablenest, r, f, d } = require('tablenest');
var images = require('./images');
var RandomId = require('@jimkang/randomid');

// The duration of the rotation will be 1/speed seconds.
// e.g. speed 60 => 1/60 s duration. speed 0.5 => 2s duration.
// speed 5 => 0.2s duration
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

var orbitCenterTable = [
  [10, { x: 50, y: 50 }],
  [1, { x: 25, y: 50 }],
  [1, { x: 75, y: 50 }],
  [1, { x: 50, y: 25 }],
  [1, { x: 50, y: 75 }],
  [5, r({ x: d`d50+25`, y: d`d50+25` })]
];

var orbitDirectionTable = [[3, 'clockwise'], [1, 'counterclockwise']];

function SpinnerTables({ random }) {
  var tablenest = Tablenest({ random });
  var randomId = RandomId({ random });

  var getId = f(() => 'spinner-' + randomId(4));

  // Radius is relative to all of the other spinners' radii.
  return {
    literalSpinner: makeSpinnerTable({
      radius: d`d4`,
      images: [[2, images.redFidgetSpinner], [1, images.yellowFidgetSpinner]],
      speedKey: 'anySpeed'
    }),
    ammonite: makeSpinnerTable({
      radius: d`d2+2`,
      images: [[3, images.ammonite], [2, images.inkAmmonite]]
    }),
    clockFace: makeSpinnerTable({
      radius: d`d2+1`,
      images: images.officeClockFace
    }),
    clockHourHand: makeSpinnerTable({
      radius: d`d2+1`,
      images: images.officeClockHourHand,
      speedKey: 'anySpeed'
    }),
    clockMinuteHand: makeSpinnerTable({
      radius: d`d2+1`,
      images: images.officeClockMinuteHand,
      speedKey: 'anySpeed'
    }),
    cat: makeSpinnerTable({
      radius: d`d3+1`,
      images: [
        [32, images.bonusMorphBall],
        [32, images.bonusMorphBall2],
        [1, images.bonusMorphBall3],
        [28, images.wilyMorphBall],
        [32, images.wilyMorphBall2]
      ]
    }),
    pizza: makeSpinnerTable({
      radius: d`d4`,
      images: images.pizza,
      speedKey: 'anySpeed'
    }),
    expander: makeSpinnerTable({
      radius: d`d2`,
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
        speed: r`speed`,
        // Orbit only comes into play if the layout style is orbit.
        orbitCenter: r`orbitCenter`,
        orbitSpeed: d`d6x0.025`,
        orbitDirection: r`orbitDirection`
      }),
      images,
      speed: speedTables[speedKey],
      orbitCenter: orbitCenterTable,
      orbitDirection: orbitDirectionTable
    });
  }
}

module.exports = SpinnerTables;
