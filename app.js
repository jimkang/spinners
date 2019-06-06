var handleError = require('handle-error-web');
var SpinnerFlow = require('./flows/spinner-flow');
var RouteState = require('route-state');
var LayoutTable = require('./layout-table');
var seedrandom = require('seedrandom');
var wireControls = require('./dom/wire-controls');
var convertToArray = require('./convert-to-array');
var RandomId = require('@jimkang/randomid');
var renderUpdateToSingleSpinner = require('./dom/render-update-to-single-spinner');
//var updateOrbit = require('./dom/update-orbit');
var Probable = require('probable').createProbable;

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
  var probable = Probable({ random });
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

    if (spinner.data.displaysSublayout || alteration === 'moveToNextSeed') {
      if (spinner.data.sublayout) {
        nextSeed = spinner.data.sublayout.seed;
      } else {
        nextSeed = randomId(4);
      }
      routeState.addToRoute({ seed: nextSeed });
      /*
    } else if (
      alteration === 'changeOrbitOrRadius' &&
      spinner.data.ephemeralOrbitData
    ) {
      console.log('Changing orbit.');

      let eoData = spinner.data.ephemeralOrbitData;
      if (eoData.orbitIndex < eoData.totalOrbitsInSystem) {
        eoData.orbitIndex += probable.rollDie(2);
      } else {
        eoData.orbitIndex -= probable.rollDie(3);
      }
      if (eoData.orbitIndex < 0) {
        eoData.orbitIndex = 0;
      }

      spinner.data.orbitCenter.x += (-2 + probable.roll(4)) * 5;
      spinner.data.orbitCenter.y += (-2 + probable.roll(4)) * 5;

      spinner.data.orbitSpeed += (-0.2 + 0.1 * probable.roll(4));

      updateOrbit(spinner);
      renderUpdateToSingleSpinner({ spinnerDatum: spinner });
    */
    } else if (alteration === 'change') {
      if (probable.roll(2) === 0) {
        spinner.data.speed += 0.5;
        renderUpdateToSingleSpinner({
          spinnerDatum: spinner,
          interruptRotation: false
        });
      } else {
        spinner.r += 10;
        spinner.data.r = spinner.r;
        renderUpdateToSingleSpinner({ spinnerDatum: spinner });
      }
    }
  }
}

function seedWithDate() {
  routeState.addToRoute({ seed: new Date().toISOString() });
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
