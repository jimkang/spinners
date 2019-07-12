var d3 = require('d3-selection');
var accessor = require('accessor');
var RenderAsNestedList = require('render-as-nested-list');

var renderAsNestedList = RenderAsNestedList({});
var spinventorySection = d3.select('#spinventory');
var spinnersSection = d3.select('#spinners');
var spinnerListRoot = d3.select('#spinventory-list-root');
var emptySpinventoryMessage = d3.select('#empty-spinventory-message');

const minimumSpinventoryDisplayRadius = 40;

function renderSpinventory({ spinners, spinventoryOn }) {
  spinventorySection.classed('hidden', !spinventoryOn);
  spinnersSection.classed('hidden', spinventoryOn);

  if (!spinventoryOn) {
    spinnerListRoot.selectAll('.spinner-item').remove();
    return;
  }

  const empty = !spinners || spinners.length < 1;
  emptySpinventoryMessage.classed('hidden', !empty);

  var items = spinnerListRoot
    .selectAll('.spinner-item')
    .data(spinners || [], accessor());
  items.exit().remove();
  var newItems = items
    .enter()
    .append('li')
    .classed('spinner-item', true);
  var newImages = newItems.append('div').classed('image-metadata', true);
  newImages.append('div').classed('image-name', true);
  newImages
    .append('svg')
    .attr('width', originalDiameter)
    .attr('height', originalDiameter)
    .classed('image-board', true)
    .append('g')
    .classed('rotation-container', true)
    .append('g')
    .classed('rotation-group', true)
    .append('image')
    .attr('width', originalDiameter)
    .attr('height', originalDiameter);
  newImages.append('div').classed('image-attribution', true);
  newImages.append('div').classed('description', true);

  newItems.append('ul').classed('item-prop-tree', true);

  var updateItems = newItems.merge(items);

  updateItems
    .select('.image-board image')
    .attr('xlink:href', accessor({ path: 'image/url' }))
    .attr('x', negativeOriginalR)
    .attr('y', negativeOriginalR);
  updateItems
    .select('.image-board .rotation-container')
    .attr('transform', getCompensateTransform);
  updateItems
    .select('.image-board .rotation-group')
    .attr('data-speed', accessor('speed'));
  updateItems.select('.image-name').text(accessor({ path: 'image/name' }));
  updateItems.select('.image-attribution').html(getAttributionHTML);
  updateItems
    .select('.description')
    .text(accessor({ path: 'image/description' }));

  updateItems.select('.item-prop-tree').each(renderItemProps);
}

function renderItemProps(spinner) {
  while (this.firstChild) {
    this.removeChild(this.firstChild);
  }
  renderAsNestedList({ targetListEl: this, thing: spinner.summary });
}

function getCompensateTransform(spinner) {
  return `translate(${originalRWithFloor(spinner)}, ${originalRWithFloor(
    spinner
  )})`;
}

function originalRWithFloor(spinner) {
  return Math.max(spinner.originalR, minimumSpinventoryDisplayRadius);
}

function originalDiameter(spinner) {
  return originalRWithFloor(spinner) * 2;
}

function negativeOriginalR(spinner) {
  return -originalRWithFloor(spinner);
}

function getAttributionHTML(spinner) {
  var attribution = spinner.image.attribution;
  if (attribution.includes('<a href=')) {
    return attribution;
  }
  if (spinner.image.source) {
    return `<a href="${spinner.image.source}">${attribution}</a>`;
  }
  return attribution;
}

module.exports = renderSpinventory;
