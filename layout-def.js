var { r, f, l, d } = require('tablenest');
var range = require('d3-array').range;

module.exports = {
  root: [
    [1, r({ size: d`d32`, types: r`typeOrder`, layers: r`layers` })],
    [
      10,
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
    [1, r([r`layer`, r`layer`])],
    [8, r([r`layer`])],
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
    [1, l(['default', 'ammonites'])],
    [1, l(['ammonites', 'default', 'pizzas'])],
    [1, l(['cats', 'default', 'ammonites'])],
    [1, l(['pizzas', 'ammonites', 'cats'])],
    [
      1,
      l(['cats', 'clockFaces', 'clockHourHands', 'clockMinuteHands', 'pizzas'])
    ],
    [
      1,
      l([
        'ammonites',
        'clockFaces',
        'clockHourHands',
        'clockMinuteHands',
        'default',
        'cats',
        'pizzas'
      ])
    ]
  ],
  typeMix: [
    [3, f(o => range(o.size).map(() => o.types[0]))], // One type
    // Mostly one type
    [
      2,
      f((o, p) =>
        range(o.size).map(() =>
          p.roll(5) === 0 ? o.types[0] : p.pickFromArray(o.types.slice(1))
        )
      )
    ],
    // Even mix
    [1, f((o, p) => range(o.size).map(() => p.pickFromArray(o.types)))]
  ],
  layer: [[1, r`typeMix`]],
  clockFaceLayer: [[1, f(o => range(o.size).map(() => 'clockFaces'))]],
  clockHourHandLayer: [[1, f(o => range(o.size).map(() => 'clockHourHands'))]],
  clockMinuteHandLayer: [
    [1, f(o => range(o.size).map(() => 'clockMinuteHands'))]
  ]
};
