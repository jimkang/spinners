var { Tablenest, r, f, d, l } = require('tablenest');
var images = require('./images');
var RandomId = require('@jimkang/randomid');

var speedTables = {
  relaxed: [[1, 1], [1, 2]],
  anySpeed: [[16, 2], [8, 1], [4, 3], [1, 4]]
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

var orbitRotationOffsetTable = [
  [1, 0],
  [1, Math.PI / 2],
  [1, Math.PI],
  [1, (Math.PI / 2) * 3],
  [1, f((o, p) => ((2 * Math.PI) / 360) * p.rollDie(360))]
];

var alterationScheduleTable = [
  //[2, l(['moveToNextSeed'])],
  //[5, l(['change', 'change', 'moveToNextSeed'])],
  //[5, l(['changeSpeed', 'changeSpeed', 'moveToNextSeed'])],
  [5, l(['changeSize', 'changeSize', 'moveToNextSeed'])],
  //[5, l(['changeSpeed', 'moveToNextSeed'])],
  [5, l(['changeSize', 'moveToNextSeed'])],
  [5, l(['moveToNextSeed'])]
  /*
  [
    1,
    l([
      'change',
      'change',
      'change',
      'change',
      'change',
      'change',
      'moveToNextSeed'
    ])
  ]
    // Orbit changes need work.
    l([
      'changeOrbitOrRadius',
      'changeOrbitOrRadius',
      'changeOrbitOrRadius',
      'changeOrbitOrRadius',
      'changeRadius',
      'moveToNextSeed'
    ])
  ]
  */
];

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
      images: [
        [4, images.pizza],
        [4, images.pepperPizza],
        [3, images.pepperoniPizza]
      ],
      speedKey: 'anySpeed'
    }),
    cd: makeSpinnerTable({
      radius: d`d2+1`,
      images: [
        [2, images.cdWithNotes],
        [2, images.dvd],
        [2, images.dvd2],
        [2, images.grayCD],
        [2, images.lightCD],
        [2, images.rainbowCD],
        [2, images.rainbowCD2],
        [2, images.cdROM]
      ],
      speedKey: 'anySpeed'
    }),
    wheel: makeSpinnerTable({
      radius: d`d2+1`,
      images: [
        [2, images.wagonWheel],
        [2, images.wagonWheelDrawing],
        [1, images.wheelOfFortune],
        [2, images.carWheel]
      ],
      speedKey: 'anySpeed'
    }),
    sushi: makeSpinnerTable({
      radius: d`d2`,
      images: [[1, images.sushi1], [1, images.sushi2], [1, images.sushi3]]
    }),
    donut: makeSpinnerTable({
      radius: d`d4`,
      images: [
        [2, images.glazedDonut],
        [1, images.chocolateDonut],
        [1, images.frostedDonut]
      ]
    }),
    plate: makeSpinnerTable({
      radius: d`d2+2`,
      images: [[2, images.plateDrawing]]
    }),
    figureDrawing: makeSpinnerTable({
      radius: d`d4`,
      images: [[2, images.vitruvianMan]]
    }),
    gear: makeSpinnerTable({
      radius: d`d4`,
      images: [[2, images.bikeGear]]
    }),
    cookie: makeSpinnerTable({
      radius: d`d4`,
      images: [
        [2, images.chocolateChipCookie],
        [1, images.facetedChocolateChipCookie],
        [2, images.cookie]
      ]
    }),
    cyclone: makeSpinnerTable({
      radius: d`d4`,
      images: [[1, images.cyclone]]
    }),
    galaxy: makeSpinnerTable({
      radius: d`d4`,
      images: [[1, images.spiralGalaxy]]
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
        orbitSpeed: d`d4x0.0125`,
        orbitDirection: r`orbitDirection`,
        orbitRotationOffset: r`orbitRotationOffset`,
        displaysSublayout: r`displaysSublayout`,
        alterationSchedule: r`alterationSchedule`,
        alterationIndex: 0
      }),
      images,
      speed: speedTables[speedKey],
      orbitCenter: orbitCenterTable,
      orbitDirection: orbitDirectionTable,
      orbitRotationOffset: orbitRotationOffsetTable,
      alterationSchedule: alterationScheduleTable,
      displaysSublayout: [[1, 'always'], [2, 'onlyIfNotOnSafari'], [6, 'never']]
    });
  }
}

module.exports = SpinnerTables;
