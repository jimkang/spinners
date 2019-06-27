var d3 = require('d3-selection');
var Timeout = require('d3-timer').timeout;
var animateHalos = require('./animate-halos');

const timeToFirstHalo = 5000;
var timer;

function scheduleHalos({ probable }) {
  var prevDelay = 2000;
  var nextDelay = 3000;
  // Cancel any scheduled animation.
  if (timer) {
    timer.stop();
  }
  timer = Timeout(animateNextHalos, timeToFirstHalo);

  function animateNextHalos() {
    var clickTargets = d3.selectAll('.click-target');
    const targetCount = clickTargets.size();
    var numberOfTargetsToAnimate = targetCount / (4 + probable.roll(5));
    if (numberOfTargetsToAnimate < 1) {
      numberOfTargetsToAnimate = 1;
    }
    var clickTargetsToAnimate = clickTargets.filter(randomlyPick);
    animateHalos({ targetsSelection: clickTargetsToAnimate, probable });
    timer = Timeout(animateNextHalos, nextDelay);

    if (nextDelay < 55000) {
      nextDelay = prevDelay + nextDelay;
      prevDelay = nextDelay - prevDelay;
    } else {
      prevDelay = nextDelay;
    }

    function randomlyPick() {
      return probable.roll(targetCount) < numberOfTargetsToAnimate;
    }
  }
}

module.exports = scheduleHalos;
