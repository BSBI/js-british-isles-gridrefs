import {GridRef} from './GridRef';
import {GridCoordsIE} from '../GridCoords/GridCoords';

export class GridRefIE extends GridRef {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.parse_well_formed = this.from_string;
  };

  /**
   *
   * @type {string}
   */
  country = 'IE';

  /**
   *
   * @type {typeof GridCoordsIE}
   */
  GridCoords = GridCoordsIE;

  /**
   * @type {GridCoordsIE}
   */
  gridCoords = null;

  static gridLetter = {
    A: [0, 4],
    B: [1, 4],
    C: [2, 4],
    D: [3, 4],
    F: [0, 3],
    G: [1, 3],
    H: [2, 3],
    J: [3, 3],
    L: [0, 2],
    M: [1, 2],
    N: [2, 2],
    O: [3, 2],
    Q: [0, 1],
    R: [1, 1],
    S: [2, 1],
    T: [3, 1],
    V: [0, 0],
    W: [1, 0],
    X: [2, 0],
    Y: [3, 0]
  };

  /**
   *
   * @param {string} rawGridRef
   * @throws Error
   */
  from_string(rawGridRef) {
    let trimmedLocality = rawGridRef.replace(/[\[\]\s\t.-]+/g, '').toUpperCase();

    if (/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(trimmedLocality)) {
      // tetrad or quadrant

      if (GridRefIE.quadrantOffsets.hasOwnProperty(trimmedLocality.substring(trimmedLocality.length - 2))) {
        this.quadrantCode = trimmedLocality.substring(trimmedLocality.length - 2);
        trimmedLocality = trimmedLocality.substring(0, trimmedLocality.length - 2);
      } else {
        this.tetradLetter = trimmedLocality.substring(trimmedLocality.length - 1);
        trimmedLocality = trimmedLocality.substring(0, trimmedLocality.length - 1);
      }
    }

    this.parse_gr_string_without_tetrads(trimmedLocality);

    if (this.length > 0) {
      if (this.tetradLetter || this.quadrantCode) {
        // tetrad or quadrant suffix

        if (this.tetradLetter) {
          this.preciseGridRef = this.hectad + this.tetradLetter;
          this.tetrad = this.preciseGridRef;
          this.length = 2000; // 2km square
          this.gridCoords.x += GridRefIE.tetradOffsets[this.tetradLetter][0];
          this.gridCoords.y += GridRefIE.tetradOffsets[this.tetradLetter][1];
        } else {
          // quadrant
          this.preciseGridRef = this.hectad + this.quadrantCode;
          this.quadrant = this.preciseGridRef;
          this.length = 5000; // 5km square
          this.gridCoords.x += GridRefIE.quadrantOffsets[this.quadrantCode][0];
          this.gridCoords.y += GridRefIE.quadrantOffsets[this.quadrantCode][1];
        }
      } else {
        this.preciseGridRef = trimmedLocality;

        if (this.length <= 1000) {
          // calculate tetrad for precise gridref
          this.set_tetrad();
        }
      }
    } else {
      this.error = true;
      this.errorMessage = "Irish grid reference format not understood. ('" + rawGridRef + "')";
    }
  }


  static _IE_GRID_LETTERS = 'VQLFAWRMGBXSNHCYTOJD';

  /**
   *
   * @param {string} gridRef nn/nnnn or [A-Z]nnnn or [A-Z]/nnnn (no other punctuation by this point), all upper-case
   * @return boolean
   */
  parse_gr_string_without_tetrads(gridRef) {
    let x, y, ref, char;

    if (/^\d{2}\/(?:\d\d){1,5}$/.test(gridRef)) {
      // nn/nnnn etc.
      // regex used to avoid matching oddly malformed refs, such as "32/SO763520"

      x = parseInt(gridRef.charAt(0), 10);
      y = parseInt(gridRef.charAt(1), 10);

      if (x > 3 || y > 4) {
        console.log("bad grid square, ref='" + gridRef + "' (Ireland)");
        this.length = 0;
        return false;
      }

      ref = gridRef.substring(3);
      char = GridRefIE._IE_GRID_LETTERS.charAt((x * 5) + y);

      x *= 100000;
      y *= 100000;
    } else {
      // [A-Z]nnnn or [A-Z]/nnnn etc.
      gridRef = gridRef.replace('/', '');

      if (!/^[ABCDFGHJLMNOQRSTVWXY](?:\d\d){1,5}$/.test(gridRef)) {
        this.length = 0;// mark error state
        this.gridCoords = null;
        return false;
      }

      if (gridRef) {
        char = gridRef.charAt(0);
        let p = GridRefIE._IE_GRID_LETTERS.indexOf(char);

        if (p !== -1) {
          x = Math.floor(p / 5) * 100000;
          y = (p % 5) * 100000;
        } else {
          console.log("Bad grid ref grid-letter, ref='" + gridRef + "' (Ireland)");
          this.length = 0; // mark error
          this.gridCoords = null;
          return false;
        }
      } else {
        console.log('Bad (empty) Irish grid ref');
        this.length = 0; // mark error
        this.gridCoords = null;
        return false;
      }

      ref = gridRef.substring(1);
    }

    switch (ref.length) {
      case 2:
        this.gridCoords = new GridCoordsIE(
            x + (ref.charAt(0) * 10000),
            y + (ref.charAt(1) * 10000)
        );
        this.length = 10000; //10 km square
        this.hectad = char + ref;
        break;

      case 4:
        this.gridCoords = new GridCoordsIE(
            x + Math.floor(ref / 100) * 1000,
            y + (ref % 100) * 1000
        );
        this.length = 1000; //1 km square
        this.hectad = char + ref.charAt(0) + ref.charAt(2);
        break;

      case 6:
        this.gridCoords = new GridCoordsIE(
            x + Math.floor(ref / 1000) * 100,
            y + (ref % 1000) * 100
        );
        this.length = 100; // 100m square
        this.hectad = char + ref.charAt(0) + ref.charAt(3);
        break;

      case 8:
        this.gridCoords = new GridCoordsIE(
            x + Math.floor(ref / 10000) * 10,
            y + (ref % 10000) * 10
        );
        this.length = 10; //10m square
        this.hectad = char + ref.charAt(0) + ref.charAt(4);
        break;

      case 10:
        this.gridCoords = new GridCoordsIE(
            x + Math.floor(ref / 100000),
            y + (ref % 100000)
        );
        this.length = 1; //1m square
        this.hectad = char + ref.charAt(0) + ref.charAt(5);
        break;

      default:
        console.log("Bad grid ref length, ref='" + gridRef + "' (Ireland)");
        this.length = 0;
        this.gridCoords = null;
        return false;
    }
    return true;
  }
  /**
   * used for IE grid-refs
   * @todo implement this properly
   *
   * @param {?number} significantPrecision default null (precision in metres of centroid diameter)
   * @return {string}
   */
  toHtml(significantPrecision = null) {
    return `<span>${this.preciseGridRef}</span>`;
  }
}
