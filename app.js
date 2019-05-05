var handleError = require('handle-error-web');
var SpinnerFlow = require('./flows/spinner-flow');
var RouteState = require('route-state');
var layoutDef = require('./layout-def');
var seedrandom = require('seedrandom');
var wireControls = require('./dom/wire-controls');
var { Tablenest } = require('tablenest');

var spinnerFlowKit;

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute({ seed, layers }) {
  if (!seed) {
    seedWithDate();
    return;
  }

  if (!spinnerFlowKit || spinnerFlowKit.getSeed() !== seed) {
    spinnerFlowKit = SpinnerFlow({ seed });
  }

  var syncPositionsAcrossLayers = false;

  if (!layers) {
    let tablenest = Tablenest({ random: seedrandom(seed) });
    let layoutTable = tablenest(layoutDef);
    let result = layoutTable.roll();

    // TODO: tablenest needs to preserve the array-ness of a def.
    layers = convertToArray(result.layers);
    syncPositionsAcrossLayers = result.syncPositionsAcrossLayers;
  }

  wireControls({ refresh: seedWithDate });

  spinnerFlowKit.go({ layers, syncPositionsAcrossLayers });
}

function seedWithDate() {
  routeState.addToRoute({ seed: new Date().toISOString() });
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function convertToArray(obj) {
  var array = [];
  for (var i = 0; obj[i]; ++i) {
    array[i] = obj[i];
  }
  return array;
}
