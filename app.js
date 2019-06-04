var handleError = require('handle-error-web');
var SpinnerFlow = require('./flows/spinner-flow');
var RouteState = require('route-state');
var LayoutTable = require('./layout-table');
var seedrandom = require('seedrandom');
var wireControls = require('./dom/wire-controls');
var convertToArray = require('./convert-to-array');
var RandomId = require('@jimkang/randomid');

var renderUpdateToSingleSpinner = require('./dom/render-update-to-single-spinner');

var spinnerFlowKit;

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute({ seed }) {
  if (!seed) {
    seedWithDate();
    return;
  }

  if (!spinnerFlowKit || spinnerFlowKit.getSeed() !== seed) {
    spinnerFlowKit = SpinnerFlow({ seed, onClick });
  }

  var random = seedrandom(seed);
  var randomId = RandomId({ random });
  var layoutTable = LayoutTable({ random });
  var { layers, syncPositionsAcrossLayers, layoutStyle } = layoutTable.roll();
  // TODO: tablenest needs to preserve the array-ness of a def.
  layers = convertToArray(layers);

  wireControls({ refresh: seedWithDate });

  spinnerFlowKit.go({ layers, syncPositionsAcrossLayers, layoutStyle });

  function onClick(spinner) {
    var sd = spinner.data;
    console.log('spinner clicked:', sd);
    var nextSeed;
    var alteration = sd.alterationSchedule[sd.alterationIndex];
    if (sd.alterationIndex < sd.alterationSchedule.length - 1) {
      sd.alterationIndex += 1;
    } else {
      sd.alterationIndex = 0;
    }

    if (alteration === 'moveToNextSeed') {
      if (spinner.data.sublayout) {
        nextSeed = spinner.data.sublayout.seed;
      } else {
        nextSeed = randomId(4);
      }
      routeState.addToRoute({ seed: nextSeed });
    } else if (alteration === 'changeRadius') {
      spinner.r += 2;
      renderUpdateToSingleSpinner({ spinnerDatum: spinner });
    }
  }
}

function seedWithDate() {
  routeState.addToRoute({ seed: new Date().toISOString() });
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
