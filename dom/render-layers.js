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
    var promotedNodeParent = promotedNode.parentElement;

    parentSelection.node().appendChild(promotedNode);
    // Move the transform so that it is in the same apparent position it was in before.
    promotedSublayoutTransform = combineTransforms({
      tStringWithTranslate: promotedNodeParent.getAttribute('transform'),
      tStringWithScale: promotedNode.getAttribute('transform')
    });
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
    var newLayers = layers
      .enter()
      .append('g')
      .classed('layer', true);

    newLayers
      .merge(layers)
      // Skip changing attributes on the promoted layer from the
      // sublayout. It's already set up.
      .filter(notPromoted)
      .attr('id', accessor())
      .attr('transform', destTransform);

    done(null, promotedSublayoutLayerDatum);
  }

  function findLayerInSublayouts(layerDatum) {
    var sublayoutLayers = parentSelection.selectAll('.sublayout > .layer');
    if (!sublayoutLayers.empty()) {
      let sublayoutLayerData = sublayoutLayers.data();
      return findWhere(sublayoutLayerData, { id: layerDatum.id });
    }
  }

  function notPromoted(d) {
    return (
      !promotedSublayoutLayerDatum || d.id !== promotedSublayoutLayerDatum.id
    );
  }
}

// Warning: Not a robust general function; I mean, just look at it.
function combineTransforms({ tStringWithScale, tStringWithTranslate }) {
  var t1 = transformStringToObject(tStringWithScale);
  var t2 = transformStringToObject(tStringWithTranslate);
  return transformObjectToString(
    {
      scale: t1.scale,
      translate: t2.translate
    },
    ['translate', 'scale']
  );
}
/*
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
*/

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

function transformObjectToString(
  t,
  opsOrder = ['scale', 'translate', 'rotate']
) {
  var s = '';
  opsOrder.forEach(addOpToString);
  return s;

  function addOpToString(op) {
    if (t[op]) {
      s += `${op}(${Array.isArray(t[op]) ? t[op].join(', ') : t[op]}) `;
    }
  }
}

module.exports = renderLayers;
