var { Tablenest, r, f, l, d } = require('tablenest');
var range = require('d3-array').range;
var RandomId = require('@jimkang/randomid');

var sizeTables = {
  normal: [[8, d`3d6`], [4, d`d10`], [1, d`d30`]],
  safari: [[8, d`2d6`], [4, d`d10`]]
};

function LayoutTables({ random, sizeKey = 'normal' }) {
  var tablenest = Tablenest({ random });
  var randomId = RandomId({ random });
  var getId = f(makeLayerIdString);

  return tablenest({
    root: [
      [
        15,
        r({
          size: r`size`,
          types: r`typeList`,
          layers: r`layers`,
          syncPositionsAcrossLayers: f((o, p) => p.roll(3) === 0),
          layoutStyle: r`layoutStyle`
        })
      ],
      [
        1,
        r({
          size: r`size`,
          types: r`typeList`,
          layers: r([
            r`clockFaceLayer`,
            r`clockHourHandLayer`,
            r`clockMinuteHandLayer`
          ]),
          syncPositionsAcrossLayers: true
        })
      ]
    ],
    layers: [
      [64, r([r`layer`])],
      [8, r([r`layer`, r`layer`])],
      [2, r([r`layer`, r`layer`, r`layer`])],
      [1, r([r`layer`, r`layer`, r`layer`, r`layer`])]
    ],
    typeList: [
      // Hard things
      [
        2,
        l([
          'literalSpinner',
          'ammonite',
          'cd',
          'wheel',
          'plate',
          'gear',
          'sign',
          'manhole',
          'roomba',
          'lock',
          'shuriken',

          'turtle',
          'stump'
        ])
      ],
      // Organic things
      [
        2,
        l([
          'ammonite',
          'pizza',
          'cat',
          'sushi',
          'donut',
          'figureDrawing',
          'cookie',
          'starfish',
          'pancake',
          'bagelEverything',
          'pie',
          'tart',
          'cake',
          'orange',
          'kiwi',
          'cucumber',
          'tomato',
          'onion',
          'flower',
          'stump'
        ])
      ],
      // Animate things
      [1, l(['cat', 'ammonite', 'roomba', 'starfish', 'turtle', 'fishSchool'])],
      // Intangible things
      [1, l(['cyclone', 'galaxy', 'hypnoswirl'])],
      // Major planets
      [
        1,
        l([
          'mercury',
          'venus',
          'mars',
          'earth',
          'jupiter',
          'saturn',
          'uranus',
          'neptune'
        ])
      ],
      // Space
      [
        1,
        l([
          'galaxy',
          'mercury',
          'venus',
          'mars',
          'earth',
          'jupiter',
          'saturn',
          'uranus',
          'neptune'
        ])
      ],
      // Weather
      [1, l(['cyclone', 'earth'])],
      // Foods
      [
        4,
        [
          // Mains
          [2, l(['pizza', 'sushi', 'pancake', 'bagelEverything', 'pepperoni'])],
          // Desserts
          [2, l(['donut', 'cookie', 'pie', 'tart', 'cake'])],
          // Fruits
          [1, l(['orange', 'kiwi'])],
          // Vegetables
          [1, l(['cucumber', 'tomato', 'onion'])]
        ]
      ],
      // Household
      [1, l(['pinwheel', 'record', 'flower', 'swimRing', 'toiletPaperRoll'])],
      // All things
      [
        3,
        l([
          'ammonite',
          'clockFace',
          'literalSpinner',
          'cat',
          'pizza',
          'cd',
          'wheel',
          'sushi',
          'donut',
          'plate',
          'figureDrawing',
          'gear',
          'cookie',
          'cyclone',
          'galaxy',
          'sign',
          'manhole',
          'roomba',
          'lock',
          'mercury',
          'venus',
          'mars',
          'earth',
          'jupiter',
          'saturn',
          'uranus',
          'neptune',
          'shuriken',
          'pinwheel',
          'starfish',
          'pancake',
          'bagelEverything',
          'pie',
          'tart',
          'cake',
          'orange',
          'kiwi',
          'cucumber',
          'tomato',
          'onion',
          'flower',
          'turtle',
          'fishSchool',
          'swimRing',
          'toiletPaperRoll',
          'hypnoswirl',
          'stump',
          'pepperoni'
        ])
      ]
    ],
    typeMix: [
      // One type
      [5, f((o, p) => range(o.size).map(() => p.pick(o.types)))],
      // Two types
      [5, f((o, p) => p.sample(o.types, 2))],
      // Mostly one type.
      [3, f(getMixOfMostlyOneType)],
      // Even mix
      [1, f((o, p) => range(o.size).map(() => p.pick(o.types)))]
    ],
    layer: r({ id: getId, spinnerTypes: r`typeMix` }),
    size: sizeTables[sizeKey],
    clockFaceLayer: r({
      id: getId,
      layerType: 'clock',
      spinnerTypes: f(o => range(o.size).map(() => 'clockFace'))
    }),
    clockHourHandLayer: r({
      id: getId,
      layerType: 'clock',
      spinnerTypes: f(o => range(o.size).map(() => 'clockHourHand'))
    }),
    clockMinuteHandLayer: r({
      id: getId,
      layerType: 'clock',
      spinnerTypes: f(o => range(o.size).map(() => 'clockMinuteHand'))
    }),
    layoutStyle: [[3, 'pack'], [1, 'orbit']]
  });

  function makeLayerIdString() {
    return 'layer-' + randomId(4);
  }
}

const maxPickOtherTries = 5;

function getMixOfMostlyOneType(o, p) {
  var mainType = p.pick(o.types);
  return range(o.size).map(mostlyPickMainType);

  function mostlyPickMainType() {
    return p.roll(5) === 0
      ? pickOtherIfPossible(o.types, p.pick, mainType)
      : mainType;
  }
}

function pickOtherIfPossible(array, pick, avoid) {
  var picked = array[0];
  if (array.length > 1) {
    for (let i = 0; i < maxPickOtherTries; ++i) {
      picked = pick(array);
      if (picked !== avoid) {
        break;
      }
    }
  }
  return picked;
}

module.exports = LayoutTables;
