var d3 = require('d3-selection');
require('d3-transition');
var accessor = require('accessor');
var findWhere = require('lodash.findwhere');

var board = d3.select('#board');
var transformPartRegex = /(\w+)\(([\d, .\w]+)\)/g;

const promoteTransitionTime = 5000;

function renderLayers(
  { layerData, parentSelection = board, scale = 1.0, offsetX = 0, offsetY = 0 },
  done
) {
  var destTransform = `translate(${offsetX}, ${offsetY}) scale(${scale})`;
  // If one of the new layers is a former sublayout layer,
  // remove the current layers, but preserve the former sublayout layer
  // as a new top-level layer.
  var promotedSublayoutLayerDatum = findLayerInSublayouts(
    layerData[layerData.length - 1]
  );
  var promotedSublayoutTransform;
  var promotedNode;
  if (promotedSublayoutLayerDatum) {
    promotedNode = document.getElementById(promotedSublayoutLayerDatum.id);
    promotedSublayoutTransform = promotedNode.getAttribute('transform');
    parentSelection.node().appendChild(promotedNode);
    // Move the transform so that it is centered.
    promotedSublayoutTransform = centerTransform(promotedSublayoutTransform);
    promotedNode.setAttribute('transform', promotedSublayoutTransform);

    // Remove the other top-level layers.
    parentSelection
      .selectAll(`#board > .layer:not(#${promotedSublayoutLayerDatum.id})`)
      .remove();
    // Transition promoted layer to normal size.
    d3.select(promotedNode)
      .transition()
      .duration(promoteTransitionTime)
      .attr('transform', destTransform);
    setTimeout(normalRenderLayers, promoteTransitionTime);
  } else {
    setTimeout(normalRenderLayers, 0);
  }

  function normalRenderLayers() {
    var layers = parentSelection
      .selectAll('.layer')
      .data(layerData, accessor());
    layers.exit().remove();
    var newLayers = layers.enter().append('g');

    newLayers
      .merge(layers)
      .attr('id', accessor())
      .classed('layer', true)
      .attr('transform', destTransform);

    done();
  }

  function findLayerInSublayouts(layerDatum) {
    var sublayoutLayers = parentSelection.selectAll('.sublayout > .layer');
    if (!sublayoutLayers.empty()) {
      let sublayoutLayerData = sublayoutLayers.data();
      return findWhere(sublayoutLayerData, { id: layerDatum.id });
    }
  }
}

// TODO: True centering. This only centers the top left corner.
function centerTransform(transformString) {
  var transform = transformStringToObject(transformString);
  transform.translate = [50, 50];
  if (transform.scale && transform.scale !== 0) {
    transform.translate = transform.translate.map(divideByScale);
  }
  return transformObjectToString(transform);

  function divideByScale(n) {
    return n / transform.scale;
  }
}

// TODO: Break this out into own package.
function transformStringToObject(transformString) {
  var transform = {};
  var parsed = transformPartRegex.exec(transformString);
  while (parsed) {
    transform[parsed[1]] = parsed[2].includes(',')
      ? parsed[2].split(',').map(s => +s)
      : +parsed[2];
    parsed = transformPartRegex.exec(transformString);
  }
  return transform;
}

// TODO: Allow order of transforms to be set.
function transformObjectToString(t) {
  var s = '';
  if (t.scale) {
    s += `scale(${Array.isArray(t.scale) ? t.scale.join(', ') : t.scale}) `;
  }
  if (t.translate) {
    s += `translate(${t.translate.join(', ')}) `;
  }
  if (t.rotate) {
    // TODO: Handle units.
    s += `rotate(${t.rotate})`;
  }
  return s;
}

module.exports = renderLayers;
