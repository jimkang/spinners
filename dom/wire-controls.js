var listenersInit = false;

var refreshButton = document.getElementById('refresh-button');

function wireControls({ refresh }) {
  if (listenersInit) {
    return;
  }
  listenersInit = true;

  refreshButton.addEventListener('click', refresh);
}

module.exports = wireControls;
