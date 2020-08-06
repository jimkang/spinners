var { r, d } = require('tablenest');

var flower = {
  name: 'flower',
  intensity: d`d6+6`,
  pulseDuration: d`d5000+1000`,
  pulses: d`d6+4`,
  segments: d`d10x2+4`
};

var frills = {
  name: 'frills',
  intensity: 0.17,
  pulseDuration: 1500,
  pulses: 6,
  segments: 16
};

var slowBubble = {
  name: 'slowBubble',
  intensity: 0.21,
  pulseDuration: 2500,
  pulses: 7,
  segments: 24
};

var fastBubble = {
  name: 'fastBubble',
  intensity: 0.18,
  pulseDuration: d`d1500+500`,
  pulses: d`d6+2`,
  segments: d`d4x2+4`
};

var activeAmoeba = {
  name: 'activeAmoeba',
  intensity: 0.18,
  pulseDuration: 3000,
  pulses: 6,
  segments: 8
};

var atomic = {
  name: 'atomic',
  intensity: 0.02,
  pulseDuration: 250,
  pulses: 8,
  segments: 16
};

var atomic2 = {
  name: 'atomic2',
  intensity: 16,
  pulseDuration: 500,
  pulses: 9,
  segments: 16
};

var classicJiggle = {
  name: 'classicJiggle',
  intensity: d`d4x0.05`,
  pulseDuration: d`d1500+1000`,
  pulses: 8,
  segments: d`d3x2+8`
};

var sideToSide = {
  intensity: 0.12,
  pulseDuration: 250,
  pulses: 7,
  segments: 4
};

var windmill = {
  name: 'windmill',
  intensity: 0.21,
  pulseDuration: 2250,
  pulses: 6,
  segments: 4
};

var beeWings = {
  name: 'beeWings',
  intensity: 7,
  pulseDuration: 2500,
  pulses: 7,
  segments: 4
};

var ghostly = {
  name: 'ghostly',
  intensity: 0.06,
  pulseDuration: 250,
  pulses: 7,
  segments: 26
};

var clover = {
  name: 'clover',
  intensity: 20,
  pulseDuration: 1250,
  pulses: 9,
  segments: 12
};

var couldBeAnything = {
  name: 'couldBeAnything',
  pulses: d`d4+5`,
  pulseDuration: d`d12x250`,
  intensity: [[19, d`d25x0.01`], [1, d`d25`]],
  // TODO: Handle odd numbers of segments.
  segments: [[1, 4], [5, d`d4x2+2`], [4, d`d10x2+8`]]
};

var wobbleTable = [
  [1, r(couldBeAnything)],
  [1, r(flower)],
  [1, frills],
  [1, slowBubble],
  [1, r(fastBubble)],
  [1, activeAmoeba],
  [1, atomic],
  [1, atomic2],
  [1, r(classicJiggle)],
  [1, sideToSide],
  [1, windmill],
  [1, beeWings],
  [1, ghostly],
  [1, clover]
];

module.exports = wobbleTable;
