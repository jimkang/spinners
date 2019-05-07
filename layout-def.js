var { r, f, l, d } = require('tablenest');
var range = require('d3-array').range;

module.exports = {
  root: [
    [
      5,
      r({
        size: d`d32`,
        types: r`typeOrder`,
        layers: r`layers`,
        syncPositionsAcrossLayers: f((o, p) => p.roll(3) === 0)
      })
    ],
    [
      1,
      r({
        size: d`d32`,
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
    [16, r([r`layer`])],
    [5, r([r`layer`, r`layer`])],
    [2, r([r`layer`, r`layer`, r`layer`])],
    [
      1,
      r([
        r`layer`,
        r`layer`,
        r`layer`,
        r`layer`,
        r`layer`,
        r`layer`,
        r`layer`,
        r`layer`
      ])
    ]
  ],
  typeOrder: [
    [1, l(['literalSpinner', 'ammonite'])],
    [1, l(['ammonite', 'literalSpinner', 'pizza'])],
    [1, l(['cat', 'literalSpinner', 'ammonite'])],
    [1, l(['pizza', 'ammonite', 'cat'])],
    [1, l(['cat', 'clockFace', 'clockHourHand', 'clockMinuteHand', 'pizza'])],
    [
      1,
      l([
        'ammonite',
        'clockFace',
        'clockHourHand',
        'clockMinuteHand',
        'literalSpinner',
        'cat',
        'pizza'
      ])
    ]
  ],
  typeMix: [
    // One type
    [5, f(o => addRecursers(range(o.size).map(() => o.types[0])))],
    // Two types
    [
      5,
      f((o, p) =>
        addRecursers(range(o.size).map(() => p.pick(o.types.slice(0, 2))))
      )
    ],
    // Mostly one type
    [
      2,
      f((o, p) =>
        addRecursers(
          range(o.size).map(() =>
            p.roll(5) === 0 ? o.types[0] : p.pick(o.types.slice(1))
          )
        )
      )
    ],
    // Even mix
    [1, f((o, p) => addRecursers(range(o.size).map(() => p.pick(o.types))))]
  ],
  layer: r`typeMix`,
  clockFaceLayer: f(o => range(o.size).map(() => 'clockFace')),
  clockHourHandLayer: f(o => range(o.size).map(() => 'clockHourHand')),
  clockMinuteHandLayer: f(o => range(o.size).map(() => 'clockMinuteHand'))
};

function addRecursers(spinners) {
  spinners.push('expander');
  return spinners;
}
