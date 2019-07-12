var { getSpinners, clearSpinventory } = require('../spinventory');
var renderSpinventory = require('../dom/render-spinventory');
var OLPE = require('one-listener-per-element');

var { setListener } = OLPE();

var summaryFields = ['dateGot', 'originalR', 'speed', 'alterationSchedule'];

var orbitSummaryFields = [
  'orbitR',
  'orbitCenter',
  'orbitSpeed',
  'orbitDirection',
  'orbitRotationOffset'
];

var customNamesForFields = {
  originalR: 'Radius'
};

function spinventoryFlow({ spinventoryOn }) {
  setListener({
    eventName: 'click',
    listener: clear,
    element: document.getElementById('clear-spinventory-button')
  });

  var spinners = getSpinners();
  spinners.forEach(summarizeSpinner);
  renderSpinventory({
    spinventoryOn,
    spinners
  });

  function clear() {
    clearSpinventory();
    spinventoryFlow({ spinventoryOn });
  }
}

function summarizeSpinner(spinner) {
  spinner.summary = {};

  summaryFields.forEach(addFieldToSummary);
  if (spinner.orbitR) {
    orbitSummaryFields.forEach(addFieldToSummary);
  }

  function addFieldToSummary(field) {
    var value;
    if (field === 'dateGot') {
      value = new Date(spinner[field]).toLocaleString();
    } else {
      value = convertToPresentationString(spinner[field]);
    }
    spinner.summary[getDisplayFieldKey(field)] = value;
  }
}

function getDisplayFieldKey(key) {
  if (key in customNamesForFields) {
    return customNamesForFields[key];
  }
  return convertToPresentationString(key);
}

function convertToPresentationString(s) {
  if (Array.isArray(s)) {
    return s.map(convertToPresentationString);
  } else if (typeof s === 'string') {
    return capitalizeFirst(convertCamelCaseToWords(s));
  }
  return s;
}

function convertCamelCaseToWords(s) {
  var lowercased = s.toLowerCase();
  var boundaryIndexes = [];
  var match;
  var camelCaseWordBoundaryRegex = /([a-z][A-Z])/g;

  while ((match = camelCaseWordBoundaryRegex.exec(s)) !== null) {
    boundaryIndexes.push(match.index + 1);
  }
  boundaryIndexes.push(s.length);

  var converted = boundaryIndexes.map(getWord).join(' ');
  return converted;

  function getWord(endIndex, i) {
    var startIndex = 0;
    if (i > 0) {
      startIndex = boundaryIndexes[i - 1];
    }
    return lowercased.substring(startIndex, endIndex);
  }
}

// TODO: Package this
function capitalizeFirst(s) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

module.exports = spinventoryFlow;
