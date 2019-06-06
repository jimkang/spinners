var { makeOrbitForSpinner } = require('./orbit');

function updateOrbit(spinner) {
  var { d, id } = makeOrbitForSpinner(spinner);
  var pathEl = document.getElementById(id);
  pathEl.setAttribute('d', d);
}

module.exports = updateOrbit;
