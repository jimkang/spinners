var { Tablenest, r, s, f } = require('tablenest');

var idChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

function SpinnerDefs({ random }) {
  var tablenest = Tablenest({ random });

  var literalSpinner = r({
    id: s`spinner-{idChars}`,
    style: 'spinner',
    image: r`literalSpinnerImages`,
    r: f((result, p) => 5 + p.roll(20)),
    duration: f((result, p) => `${0.2 + p.roll(10)}s`),
    // TODO: Clean this up.
    idChars: f(
      (result, p) =>
        p.pickFromArray(idChars) +
        p.pickFromArray(idChars) +
        p.pickFromArray(idChars) +
        p.pickFromArray(idChars)
    )
  });

  var literalSpinnerImages = [
    [2, 'media/Yellow_Fidget_Spinner.png'],
    [1, 'media/fidget-spinner-2452983_1280.png']
  ];

  return {
    default: tablenest({
      root: [[1, literalSpinner]],
      literalSpinnerImages
    })
  };
}

module.exports = SpinnerDefs;
