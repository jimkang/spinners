var Interval = require('d3-timer').interval;

const timeBetweenRefreshes = 12000;
var timer;

function RefreshScheduler({ refresh }) {
  return { schedule, unschedule };

  function schedule() {
    if (timer) {
      return;
    }

    timer = Interval(refresh, timeBetweenRefreshes);
  }

  function unschedule() {
    if (timer) {
      timer.stop();
      timer = null;
    }
  }
}

module.exports = RefreshScheduler;
