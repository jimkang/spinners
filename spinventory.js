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
  // Mutating actual spinner data here; should be OK.
  spinner.dateGot = new Date();
  saveDict();
}

function saveDict() {
  localStorage.spinners = JSON.stringify(spinnerDict);
}

function getSpinners() {
  return Object.values(spinnerDict);
}

function clearSpinventory() {
  spinnerDict = {};
  saveDict();
}

module.exports = {
  addSpinner,
  getSpinners,
  clearSpinventory
};
