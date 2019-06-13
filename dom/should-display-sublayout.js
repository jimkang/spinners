var isSafari = require('../is-safari');

function shouldDisplaySublayout(spinner) {
  if (spinner.data.sublayout) {
    if (spinner.data.displaysSublayout === 'always') {
      return true;
    }
    if (spinner.data.displaysSublayout === 'onlyIfNotOnSafari' && !isSafari()) {
      return true;
    }
  }

  return false;
}

module.exports = shouldDisplaySublayout;
