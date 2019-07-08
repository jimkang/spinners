var OLPE = require('one-listener-per-element');
var { setListener } = OLPE();
var d3 = require('d3-selection');

var autoupdateCheckbox = document.getElementById('autoupdate-checkbox');

function wireControls({
  refresh,
  scheduleRefresh,
  unscheduleRefresh,
  goToSpinventory,
  goToSpinners
}) {
  setListener({
    eventName: 'click',
    listener: refresh,
    element: document.getElementById('refresh-button')
  });
  setListener({
    eventName: 'change',
    listener: toggleSchedule,
    element: autoupdateCheckbox
  });
  setListener({
    eventName: 'click',
    listener: goToSpinventory,
    element: document.getElementById('spinventory-link')
  });
  d3.selectAll('.go-to-spinners-link').on('click', goToSpinners);

  toggleSchedule();

  function toggleSchedule() {
    if (autoupdateCheckbox.checked) {
      scheduleRefresh();
    } else {
      unscheduleRefresh();
    }
  }
}

module.exports = wireControls;
