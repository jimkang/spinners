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

var spinnerFlowKit;

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute({ seed, maxLayers, maxSublayouts }) {
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

  if (!spinnerFlowKit || spinnerFlowKit.getSeed() !== seed) {
    spinnerFlowKit = SpinnerFlow({ seed, onClick });
  }

  var random = seedrandom(seed);
  var randomId = RandomId({ random });
  var probable = Probable({ random });
  var layoutTable = LayoutTable({ random });
  var { layers, syncPositionsAcrossLayers, layoutStyle } = layoutTable.roll();
  // TODO: tablenest needs to preserve the array-ness of a def.
  layers = convertToArray(layers).slice(0, maxLayers);

  wireControls({ refresh: seedWithDate });

  spinnerFlowKit.go({
    layers,
    syncPositionsAcrossLayers,
    layoutStyle,
    maxLayers,
    maxSublayouts
  });

  function onClick(spinner) {
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
      } else {
        nextSeed = randomId(4);
      }
      routeState.addToRoute({ seed: nextSeed });
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
      renderUpdateToSingleSpinner({ spinnerDatum: spinner, probable });
    }
  }
}

function seedWithDate() {
  routeState.addToRoute({ seed: new Date().toISOString() });
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
