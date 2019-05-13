var handleError = require('handle-error-web');
var SpinnerFlow = require('./flows/spinner-flow');
var RouteState = require('route-state');
var layoutDef = require('./layout-def');
var seedrandom = require('seedrandom');
var wireControls = require('./dom/wire-controls');
var { Tablenest } = require('tablenest');
var convertToArray = require('./convert-to-array');

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
    spinnerFlowKit = SpinnerFlow({ seed });
  }

  var tablenest = Tablenest({ random: seedrandom(seed) });
  var layoutTable = tablenest(layoutDef);
  var { layers, syncPositionsAcrossLayers, layoutStyle } = layoutTable.roll();
  // TODO: tablenest needs to preserve the array-ness of a def.
  layers = convertToArray(layers);

  wireControls({ refresh: seedWithDate });

  spinnerFlowKit.go({ layers, syncPositionsAcrossLayers, layoutStyle });
}

function seedWithDate() {
  routeState.addToRoute({ seed: new Date().toISOString() });
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
