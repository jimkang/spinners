var { r, d } = require('tablenest');

var flower = {
  name: 'flower',
  intensity: 12,
  pulseDuration: 3000,
  pulses: 8,
  segments: 16
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
  pulseDuration: 3000,
  pulses: 6,
  segments: 8
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
  intensity: 0.2,
  pulseDuration: 250,
  pulses: 8,
  segments: 8
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
  [1, flower],
  [1, frills],
  [1, slowBubble],
  [1, fastBubble],
  [1, activeAmoeba],
  [1, atomic],
  [1, atomic2],
  [1, classicJiggle],
  [1, sideToSide],
  [1, classicJiggle],
  [1, windmill],
  [1, beeWings],
  [1, ghostly],
  [1, clover]
];

module.exports = wobbleTable;
