var { getSpinners } = require('../spinventory');
var renderSpinventory = require('../dom/render-spinventory');
var pick = require('lodash.pick');

function spinventoryFlow({ spinventoryOn }) {
  var spinners = getSpinners().map(summarizeSpinner);
  renderSpinventory({
    spinventoryOn,
    spinners
  });
}

function summarizeSpinner(spinner) {
  var summarized = pick(
    spinner,
    'id',
    'image',
    'originalR',
    'speed',
    'alterationSchedule'
  );
  if (spinner.orbitR) {
    summarized = Object.assign(
      summarized,
      pick(
        spinner,
        'orbitR',
        'orbitCenter',
        'orbitSpeed',
        'orbitDirection',
        'orbitRotationOffset'
      )
    );
  }
  return summarized;
}

module.exports = spinventoryFlow;
