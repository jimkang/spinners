// Note: randomId does not respect the seed that probable uses.
var randomId = require('idmaker').randomId;

function SpinnerDefs({ probable }) {
  return {
    default: {
      roll() {
        return {
          id: 'spinner-' + randomId(4),
          style: 'spinner',
          image: 'media/Yellow_Fidget_Spinner.png',
          r: 5 + probable.roll(20),
          duration: `${0.2 + probable.roll(10)}s`
        };
      }
    }
  };
}

module.exports = SpinnerDefs;
