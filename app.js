var handleError = require('handle-error-web');
var SpinnerFlow = require('./flows/spinner-flow');
var RouteState = require('route-state');
var LayoutDefs = require('./layout-defs');
var seedrandom = require('seedrandom');
var wireControls = require('./dom/wire-controls');

var spinnerFlowKit;

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute({ seed, layout }) {
  if (!seed) {
    seedWithDate();
    return;
  }

  if (!spinnerFlowKit || spinnerFlowKit.getSeed() !== seed) {
    spinnerFlowKit = SpinnerFlow({ seed });
  }

  if (!layout) {
    let layoutDefs = LayoutDefs({
      random: seedrandom(seed)
    });
    layout = layoutDefs.roll().layout;
  }

  wireControls({ refresh: seedWithDate });

  spinnerFlowKit.go({ layout });
}

function seedWithDate() {
  routeState.addToRoute({ seed: new Date().toISOString() });
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
