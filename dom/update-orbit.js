var { makeOrbitForSpinner } = require('./orbit');

function updateOrbit(spinner) {
  spinner.data.orbitR += 10;
  var { d, id } = makeOrbitForSpinner(spinner);
  var pathEl = document.getElementById(id);
  pathEl.setAttribute('d', d);
}

module.exports = updateOrbit;
