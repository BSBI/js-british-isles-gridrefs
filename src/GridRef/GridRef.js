
/**
 * @constructor
 */
export const GridRef = function() {};

/**
 * x,y offsets (in metres) for tetrad letter codes
 * @type {Object.<string,Array.<number>>}
 */
GridRef.tetradOffsets = {
  E: [0,8000], J: [2000,8000], P: [4000,8000], U: [6000,8000], Z: [8000,8000],
  D: [0,6000], I: [2000,6000], N: [4000,6000], T: [6000,6000], Y: [8000,6000],
  C: [0,4000], H: [2000,4000], M: [4000,4000], S: [6000,4000], X: [8000,4000],
  B: [0,2000], G: [2000,2000], L: [4000,2000], R: [6000,2000], W: [8000,2000],
  A: [0,0], F: [2000,0], K: [4000,0], Q: [6000,0], V: [8000,0]
};

/**
 * x,y offsets (in metres) for quadrant codes
 * @var array
 */
GridRef.quadrantOffsets = {
  NW: [0,5000],
  NE: [5000,5000],
  SW: [0,0],
  SE: [5000,0]
};

/**
 * numerical mapping of letters to numbers
 * 'I' is omitted
 * @var array
 */
GridRef.letterMapping = {
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, J: 8, K: 9,
  L: 10, M: 11, N: 12, O: 13, P: 14, Q: 15, R: 16, S: 17, T: 18,
  U: 19, V: 20, W: 21, X: 22, Y: 23, Z: 24
};

/**
 * tetrad letters ordered by easting then northing (steps of 2000m)
 * i.e. (x*4) + y
 *
 * where x and y are integer of (10km remainder / 2)
 *
 * @var string
 */
GridRef.tetradLetters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';

/**
 *
 * @var string
 */
GridRef.prototype.preciseGridRef = '';

/**
 * length in m (0 marks an invalid value)
 *
 * @var number
 */
GridRef.prototype.length = 0;

/**
 * @var string
 */
GridRef.prototype.hectad = '';

/**
 * 10km ref with tetrad suffix or ''
 * e.g. SD59A
 * @var string
 */
GridRef.prototype.tetrad = '';

/**
 *
 * @var string
 */
GridRef.prototype.tetradLetter = '';

/**
 * quadrant gridref(e.g. NZ34NW)
 * only set if gridref is defined at 5km or <=1km precision
 * undefined by default so need to use getter
 *
 * read using GridRef::get_quadrant
 *
 * @var string
 */
GridRef.prototype.quadrant = '';

/**
 * quadrant code suffix(e.g. NW, NE, SW, SE)
 *
 * @var string
 */
GridRef.prototype.quadrantCode = '';

/**
 * update tetrad using Easting/Northing values (metres)
 * hectad should have been set prior to call
 */
GridRef.prototype.set_tetrad = function() {
  this.tetradLetter = GridRef.tetradLetters.substr(
    ((Math.floor((this.osRef.x % 10000) / 1000) >> 1) * 5) + (Math.floor((this.osRef.y % 10000) / 1000) >> 1)
    , 1);

  if (!this.tetradLetter) {
    throw new Error("Failed to get tetrad letter when processing '" + this.preciseGridRef + "', easting=" + this.osRef.x + " northing=" + this.osRef.y);
  }
  this.tetrad = this.hectad + this.tetradLetter;
};

GridRef.get_normalized_precision = function(rawPrecision, minPrecision) {
  return rawPrecision > 2000 ? 10000 :
    (rawPrecision > 1000 ? 2000 :
        (rawPrecision > 100 ? 1000 :
            (rawPrecision > 10 ? 100 :
                (rawPrecision > 1 ? 10 :
                    minPrecision ? minPrecision : 1
                )
            )
        )
    );
};

//export default GridRef;