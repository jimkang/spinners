var handleError = require('handle-error-web');
var SpinnerFlow = require('./flows/spinner-flow');
var RouteState = require('route-state');
var LayoutTable = require('./layout-table');
var seedrandom = require('seedrandom');
var wireControls = require('./dom/wire-controls');
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
    spinnerFlowKit = SpinnerFlow({ seed, onClick });
  }

  var layoutTable = LayoutTable({ random: seedrandom(seed) });
  var { layers, syncPositionsAcrossLayers, layoutStyle } = layoutTable.roll();
  // TODO: tablenest needs to preserve the array-ness of a def.
  layers = convertToArray(layers);

  wireControls({ refresh: seedWithDate });

  spinnerFlowKit.go({ layers, syncPositionsAcrossLayers, layoutStyle });
}

function seedWithDate() {
  routeState.addToRoute({ seed: new Date().toISOString() });
}

function onClick(spinner) {
  console.log('spinner clicked:', spinner.data);
  if (spinner.data.sublayout) {
    routeState.addToRoute({ seed: spinner.data.sublayout.seed });
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
