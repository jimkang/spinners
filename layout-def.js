var { r, f, l, d } = require('tablenest');
var range = require('d3-array').range;

module.exports = {
  root: [[1, r({ size: d`2d16`, types: r`typeOrder`, layers: r`layers` })]],
  layers: [
    [1, r([r`layer`, r`layer`])],
    [2, r([r`layer`])],
    [1, r([r`layer`, r`layer`, r`layer`])],
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
        r`layer`,
        r`layer`,
        r`layer`
      ])
    ]
  ],
  typeOrder: [
    [1, l(['default', 'ammonites'])],
    [1, l(['ammonites', 'default'])]
  ],
  typeMix: [
    [1, f(o => range(o.size).map(() => o.types[0]))], // One type
    // Mostly one type
    [
      2,
      f((o, p) =>
        range(o.size).map(() => (p.roll(5) === 0 ? o.types[0] : o.types[1]))
      )
    ],
    // Even mix
    [
      1,
      f((o, p) =>
        range(o.size).map(() => (p.roll(2) === 0 ? o.types[0] : o.types[1]))
      )
    ]
  ],
  layer: [[1, r`typeMix`]]
};
