// This is what you have to do to detect Safari (as of 2019).
const theAnswer =
  navigator.userAgent.includes('Safari/') &&
  !navigator.userAgent.includes('Chrome/') &&
  !navigator.userAgent.includes('Chromium/');

function isSafari() {
  return theAnswer;
}

module.exports = isSafari;
