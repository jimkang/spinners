var { Tablenest, r, f, l, d } = require('tablenest');
var range = require('d3-array').range;
var RandomId = require('@jimkang/randomid');

function LayoutTables({ random }) {
  var tablenest = Tablenest({ random });
  var randomId = RandomId({ random });
  var getId = f(makeLayerIdString);

  return tablenest({
    root: [
      [
        5,
        r({
          size: r`size`,
          types: r`typeOrder`,
          layers: r`layers`,
          syncPositionsAcrossLayers: f((o, p) => p.roll(3) === 0),
          layoutStyle: r`layoutStyle`
        })
      ],
      [
        1,
        r({
          size: r`size`,
          types: r`typeOrder`,
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
    typeOrder: [
      [1, l(['literalSpinner', 'ammonite'])],
      [1, l(['ammonite', 'literalSpinner', 'pizza'])],
      [1, l(['cat', 'literalSpinner', 'ammonite'])],
      [1, l(['pizza', 'ammonite', 'cat'])],
      [1, l(['cat', 'clockFace', 'pizza'])],
      [1, l(['ammonite', 'clockFace', 'literalSpinner', 'cat', 'pizza'])]
    ],
    typeMix: [
      // One type
      [5, f(o => range(o.size).map(() => o.types[0]))],
      // Two types
      [5, f((o, p) => range(o.size).map(() => p.pick(o.types.slice(0, 2))))],
      // Mostly one type
      [
        2,
        f((o, p) =>
          range(o.size).map(() =>
            p.roll(5) === 0
              ? pickFromAfterFirstIfPossible(o.types, p.pick)
              : o.types[0]
          )
        )
      ],
      // Even mix
      [1, f((o, p) => range(o.size).map(() => p.pick(o.types)))]
    ],
    layer: r({ id: getId, spinnerTypes: r`typeMix` }),
    size: [[8, d`3d6`], [4, d`d10`], [1, d`d30`]],
    clockFaceLayer: r({
      id: getId,
      spinnerTypes: f(o => range(o.size).map(() => 'clockFace'))
    }),
    clockHourHandLayer: r({
      id: getId,
      spinnerTypes: f(o => range(o.size).map(() => 'clockHourHand'))
    }),
    clockMinuteHandLayer: r({
      id: getId,
      spinnerTypes: f(o => range(o.size).map(() => 'clockMinuteHand'))
    }),
    layoutStyle: [[3, 'pack'], [1, 'orbit']]
  });

  function makeLayerIdString() {
    return 'layer-' + randomId(4);
  }
}

function pickFromAfterFirstIfPossible(array, pick) {
  if (array.length > 1) {
    return pick(array.slice(1));
  }
  return array[0];
}

module.exports = LayoutTables;
