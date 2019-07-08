// Singleton.

// Load from localStorage when the module is loaded.
var spinnerDict = {};

if (localStorage.spinners) {
  try {
    spinnerDict = JSON.parse(localStorage.spinners);
  } catch (e) {
    console.log(e, e.stack);
  }
}

// Expects the spinner data, not the enclosing object with
// the position info.
function addSpinner(spinner) {
  spinnerDict[spinner.id] = spinner;
  saveDict();
}

function saveDict() {
  localStorage.spinners = JSON.stringify(spinnerDict);
}

function getSpinners() {
  return Object.values(spinnerDict);
}

module.exports = {
  addSpinner,
  getSpinners
};
