function convertToArray(obj) {
  var array = [];
  for (var i = 0; obj[i]; ++i) {
    array[i] = obj[i];
  }
  return array;
}

module.exports = convertToArray;
