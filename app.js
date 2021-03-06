var handleError = require('handle-error-web');
var SpinnerFlow = require('./flows/spinner-flow');
var RouteState = require('route-state');
var LayoutTable = require('./layout-table');
var seedrandom = require('seedrandom');
var wireControls = require('./dom/wire-controls');
var convertToArray = require('./convert-to-array');
var RandomId = require('@jimkang/randomid');
var renderUpdateToSingleSpinner = require('./dom/render-update-to-single-spinner');
var Probable = require('probable').createProbable;
var isSafari = require('./is-safari');
var shouldDisplaySublayout = require('./dom/should-display-sublayout');
var d3 = require('d3-selection');
var RefreshScheduler = require('./refresh-scheduler');
var { addSpinner } = require('./spinventory');
var spinventoryFlow = require('./flows/spinventory-flow');
var showEscaped = require('./dom/show-escaped');
var { version } = require('./package.json');

var spinnerFlowKit;

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute({
  seed,
  maxLayers,
  maxSublayouts,
  sizeKey,
  spinventory,
  hideUI
}) {
  renderVersion();

  var refreshScheduler = RefreshScheduler({ refresh: seedWithDate });
  wireControls({
    refresh: seedWithDate,
    scheduleRefresh: refreshScheduler.schedule,
    unscheduleRefresh: refreshScheduler.unschedule,
    goToSpinventory,
    goToSpinners
  });

  if (hideUI === 'yes') {
    document.body.classList.add('hide-ui');
  } else {
    document.body.classList.remove('hide-ui');
  }

  const spinventoryOn = spinventory === 'yes';
  spinventoryFlow({ spinventoryOn });

  if (spinventoryOn) {
    refreshScheduler.unschedule();
    return;
  }

  if (!seed) {
    seedWithDate();
    return;
  }

  if (isNaN(maxLayers)) {
    if (isSafari()) {
      // This is a way of keeping the total number of DOM elements down.
      // If there's a lot, things get choppy. Safari seems to stop moving things around 500 elements.
      maxLayers = 1;
    } else {
      maxLayers = 10;
    }
  }
  if (isNaN(maxSublayouts) && isSafari()) {
    maxSublayouts = 1;
  }
  if (!sizeKey) {
    if (isSafari()) {
      sizeKey = 'safari';
    } else {
      sizeKey = 'normal';
    }
  }

  if (!spinnerFlowKit || spinnerFlowKit.getSeed() !== seed) {
    spinnerFlowKit = SpinnerFlow({ seed, onClick });
  }

  var random = seedrandom(seed);
  var randomId = RandomId({ random });
  var probable = Probable({ random });
  var layoutTable = LayoutTable({ random, sizeKey });
  var { layers, syncPositionsAcrossLayers, layoutStyle } = layoutTable.roll();
  // TODO: tablenest needs to preserve the array-ness of a def.
  layers = convertToArray(layers).slice(0, maxLayers);

  spinnerFlowKit.go({
    layers,
    syncPositionsAcrossLayers,
    layoutStyle,
    maxLayers,
    maxSublayouts
  });

  function onClick(spinner) {
    d3.event.stopPropagation();

    var sd = spinner.data;
    //console.log('spinner clicked:', sd);
    var nextSeed;
    var alteration = sd.alterationSchedule[sd.alterationIndex];
    if (sd.alterationIndex < sd.alterationSchedule.length - 1) {
      sd.alterationIndex += 1;
    } else {
      sd.alterationIndex = 0;
    }

    const couldMoveToSublayout = shouldDisplaySublayout(spinner);
    if (couldMoveToSublayout || alteration === 'moveToNextSeed') {
      if (couldMoveToSublayout) {
        nextSeed = spinner.data.sublayout.seed;
        refreshScheduler.snooze();
        routeState.addToRoute({ seed: nextSeed });
      } else {
        nextSeed = randomId(4);
        let nextSeedDelay = 1000;
        // Make spinner fill the board.
        if (probable.roll(4) > 0) {
          spinner.r = document
            .getElementById('board')
            .getBoundingClientRect().width;
          spinner.data.r = spinner.r;

          // Save to Spinventory.
          addSpinner(spinner.data);
        } else {
          showEscaped({ spinner });

          // Whoosh the spinner offscreen.
          if (probable.roll(2) === 0) {
            spinner.x = 50 + 200 * (probable.roll(2) === 0 ? -1 : 1);
            spinner.y =
              50 + probable.roll(50) * (probable.roll(2) === 0 ? -1 : 1);
          } else {
            spinner.x =
              50 + probable.roll(50) * (probable.roll(2) === 0 ? -1 : 1);
            spinner.y = 50 + 200 * (probable.roll(2) === 0 ? -1 : 1);
          }
          nextSeedDelay += 1000;
        }

        renderUpdateToSingleSpinner({
          spinnerDatum: spinner,
          animateHalo: false,
          moveToFront: true
        });
        // Then, move to the next seed.
        refreshScheduler.snooze();
        setTimeout(
          () => routeState.addToRoute({ seed: nextSeed }),
          nextSeedDelay
        );
      }
    } else if (alteration === 'changeSpeed') {
      spinner.data.speed += 1.0;
      renderUpdateToSingleSpinner({
        spinnerDatum: spinner,
        interruptRotation: false,
        probable
      });
    } else if (alteration === 'changeSize') {
      spinner.r += 10;
      spinner.data.r = spinner.r;
      renderUpdateToSingleSpinner({
        spinnerDatum: spinner,
        probable,
        moveToFront: true
      });
    }
  }
}

function seedWithDate() {
  routeState.addToRoute({ seed: new Date().toISOString() });
}

function goToSpinventory() {
  routeState.removeFromRoute('seed', false);
  routeState.addToRoute({ spinventory: 'yes' });
  // Scroll to the top.
  document.body.scrollIntoView(true);
}

function goToSpinners() {
  routeState.removeFromRoute('spinventory', false);
  seedWithDate();
  // Scroll to the top.
  document.body.scrollIntoView(true);
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  document.getElementById('version-info').textContent = version;
}
