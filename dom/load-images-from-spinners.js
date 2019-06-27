var uniq = require('lodash.uniq');

function loadImagesFromSpinners({ imageDict, spinnerData }, done) {
  var urls = uniq(spinnerData.map(getURLFromSpinner)).filter(notInDict);
  var outstandingLoads = urls.length;
  if (outstandingLoads < 1) {
    setTimeout(done);
    return;
  }
  urls.forEach(loadImage);

  function loadImage(url) {
    var img = new Image();
    img.onload = onLoad;
    imageDict[url] = { img };
    img.src = url;

    function onLoad() {
      imageDict[url].width = ~~img.width;
      imageDict[url].height = ~~img.height;
      //console.log('Loaded', imageDict[url]);

      outstandingLoads -= 1;
      // TODO: Also set a time limit.
      if (outstandingLoads < 1) {
        done();
      }
    }
  }

  function notInDict(url) {
    return !(url in imageDict);
  }
}

function getURLFromSpinner(spinner) {
  return spinner.data.image.url;
}

module.exports = loadImagesFromSpinners;
