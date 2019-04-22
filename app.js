var handleError = require('handle-error-web');
var SpinnerFlow = require('./flows/spinner-flow');
var RouteState = require('route-state');
//var range = require('d3-array').range;

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
    routeState.addToRoute({ seed: new Date().toISOString() });
    return;
  }

  if (!spinnerFlowKit || spinnerFlowKit.getSeed() !== seed) {
    spinnerFlowKit = SpinnerFlow({ seed });
  }

  spinnerFlowKit.go({});
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
