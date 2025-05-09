import {GridCoords, TETRAD_LETTERS} from "../GridCoords/GridCoords";

 /**
 * x,y offsets (in metres) for tetrad letter codes
 * @type {Object.<string,Array.<number>>}
 */

 export const TETRAD_OFFSETS = {
	E: [0, 8000], J: [2000, 8000], P: [4000, 8000], U: [6000, 8000], Z: [8000, 8000],
	D: [0, 6000], I: [2000, 6000], N: [4000, 6000], T: [6000, 6000], Y: [8000, 6000],
	C: [0, 4000], H: [2000, 4000], M: [4000, 4000], S: [6000, 4000], X: [8000, 4000],
	B: [0, 2000], G: [2000, 2000], L: [4000, 2000], R: [6000, 2000], W: [8000, 2000],
	A: [0, 0], F: [2000, 0], K: [4000, 0], Q: [6000, 0], V: [8000, 0]
};

/**
 * x,y offsets (in metres) for quadrant codes
 * @type {{SE: number[], SW: number[], NE: number[], NW: number[]}}
 */
export const QUADRANT_OFFSETS = {
	NW: [0, 5000],
	NE: [5000, 5000],
	SW: [0, 0],
	SE: [5000, 0]
};

export class GridRef {

	// /**
	//  * x,y offsets (in metres) for tetrad letter codes
	//  * @type {Object.<string,Array.<number>>}
	//  */
	// static tetradOffsets = {
	// 	E: [0, 8000], J: [2000, 8000], P: [4000, 8000], U: [6000, 8000], Z: [8000, 8000],
	// 	D: [0, 6000], I: [2000, 6000], N: [4000, 6000], T: [6000, 6000], Y: [8000, 6000],
	// 	C: [0, 4000], H: [2000, 4000], M: [4000, 4000], S: [6000, 4000], X: [8000, 4000],
	// 	B: [0, 2000], G: [2000, 2000], L: [4000, 2000], R: [6000, 2000], W: [8000, 2000],
	// 	A: [0, 0], F: [2000, 0], K: [4000, 0], Q: [6000, 0], V: [8000, 0]
	// };

	// /**
	//  * x,y offsets (in metres) for quadrant codes
	//  * @type {{SE: number[], SW: number[], NE: number[], NW: number[]}}
	//  */
	// static quadrantOffsets = {
	// 	NW: [0, 5000],
	// 	NE: [5000, 5000],
	// 	SW: [0, 0],
	// 	SE: [5000, 0]
	// };

	// /**
	//  * numerical mapping of letters to numbers
	//  * 'I' is omitted
	//  *
	//  * @type {{A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number, J: number, K: number, L: number, M: number, N: number, O: number, P: number, Q: number, R: number, S: number, T: number, U: number, V: number, W: number, X: number, Y: number, Z: number}}
	//  */
	// static letterMapping = {
	// 	A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, J: 8, K: 9,
	// 	L: 10, M: 11, N: 12, O: 13, P: 14, Q: 15, R: 16, S: 17, T: 18,
	// 	U: 19, V: 20, W: 21, X: 22, Y: 23, Z: 24
	// };


	// /**
	//  * tetrad letters ordered by easting then northing (steps of 2000m)
	//  * i.e. (x*4) + y
	//  *
	//  * where x and y are integer of (10km remainder / 2)
	//  *
	//  * @type {string}
	//  */
	// static tetradLetters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';

	/**
	 *
	 * @type {string}
	 */
	preciseGridRef = '';

	/**
	 * length in m (0 marks an invalid value)
	 *
	 * @type {number}
	 */
	length = 0;

	/**
	 * @type {string}
	 */
	hectad = '';

	/**
	 * 10km ref with tetrad suffix or ''
	 * e.g. SD59A
	 * @type {string}
	 */
	tetrad = '';

	/**
	 *
	 * @type {string}
	 */
	tetradLetter = '';

	/**
	 * quadrant gridref(e.g. NZ34NW)
	 * only set if gridref is defined at 5km or <=1km precision
	 * undefined by default so need to use getter
	 *
	 * read using GridRef::get_quadrant
	 *
	 * @type {string}
	 */
	quadrant = '';

	/**
	 * quadrant code suffix(e.g. NW, NE, SW, SE)
	 *
	 * @type {string}
	 */
	quadrantCode = '';

	/**
	 *
	 * @type {GridCoords|null}
	 */
	gridCoords = null;

	/**
	 *
	 * @type {boolean}
	 */
	error = false;

	/**
	 *
	 * @type {string}
	 */
	errorMessage = '';

	get centrePoint() {
		const centre = new GridCoords();
		const halfLength = Math.floor(this.length / 2);

		centre.x = this.gridCoords.x + halfLength;
		centre.y = this.gridCoords.y + halfLength;
		return centre;
	}

	/**
	 *
	 * @param {GridCoords} gridCoords centre-point to test
	 * @param {number} radius default 0 for absolute point
	 */
	squareIntersectsPoint(gridCoords, radius = 1) {
		// const hX = gridCoords.x + this.length;
		// const hy = gridCoords.y + this.length;

		if (radius === 1) {
			return (this.gridCoords.x <= gridCoords.x && this.gridCoords.x + this.length > gridCoords.x
				&& this.gridCoords.y <= gridCoords.y && this.gridCoords.y + this.length > gridCoords.y);
		} else {
			return GridRef._checkOverlap(
				radius,
				gridCoords.x, gridCoords.y,
				this.gridCoords.x, this.gridCoords.y,
				this.gridCoords.x + this.length, this.gridCoords.y + this.length
				);
		}
	}

	/**
	 * check if any point overlaps the given circle and rectangle
	 * see https://www.geeksforgeeks.org/check-if-any-point-overlaps-the-given-circle-and-rectangle/
	 *
	 * @param {number} R
	 * @param {number} Xc
	 * @param {number} Yc
	 * @param {number} X1
	 * @param {number} Y1
	 * @param {number} X2
	 * @param {number} Y2
	 * @returns {boolean}
	 */
	static _checkOverlap(R, Xc, Yc, X1, Y1, X2, Y2) {

		// Find the nearest point on the
		// rectangle to the center of
		// the circle
		let Xn = Math.max(X1, Math.min(Xc, X2));
		let Yn = Math.max(Y1, Math.min(Yc, Y2));

		// Find the distance between the
		// nearest point and the center
		// of the circle
		// Distance between 2 points,
		// (x1, y1) & (x2, y2) in
		// 2D Euclidean space is
		// ((x1-x2)**2 + (y1-y2)**2)**0.5
		let Dx = Xn - Xc;
		let Dy = Yn - Yc;
		return (Dx * Dx + Dy * Dy) <= R * R;
	}

	/**
	 * Update tetrad using Easting/Northing values (metres)
	 * Hectad should have been set prior to calling.
	 */
	set_tetrad() {
		this.tetradLetter = TETRAD_LETTERS.charAt(
			((Math.floor((this.gridCoords.x % 10000) / 1000) >> 1) * 5) + (Math.floor((this.gridCoords.y % 10000) / 1000) >> 1));

		if (!this.tetradLetter) {
			throw new Error("Failed to get tetrad letter when processing '" + this.preciseGridRef + "', easting=" + this.gridCoords.x + " northing=" + this.gridCoords.y);
		}
		this.tetrad = this.hectad + this.tetradLetter;
	}

	/**
	 *
	 * @param {number} rawPrecision
	 * @param {number} [minPrecision]
	 * @returns {number}
	 */
	static getNormalizedPrecision(rawPrecision, minPrecision) {
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
	}

	/**
	 * used for GB grid-refs and invoked as parent for the Channel Islands
	 *
	 * @param {?number} significantPrecision default null (precision in metres of centroid diameter)
	 *
	 * @return {string}
	 */
	toHtml(significantPrecision = null) {
		let formattedGr;

		if (!significantPrecision || significantPrecision === this.length) {
			if (this.length <= 1000) {
				let halfNumLen = ((this.preciseGridRef.length - 2) / 2) | 0;
				formattedGr = this.preciseGridRef.substring(0, 2) +
					"<span class='sig'>" + this.preciseGridRef.substring(2, 2 + halfNumLen) +
					"</span><span class='sig'>" + this.preciseGridRef.substring(2 + halfNumLen) + "</span>";
			} else {
				formattedGr = this.preciseGridRef;
			}
		} else {
			if (this.length === 2000) {
				// reduced precision means greying the tetrad code

				formattedGr = `${this.hectad}<span class='nonsig'>${this.tetradLetter}</span>`;
			} else if (this.length === 5000) {
				// reduced precision means greying the quadrant code

				formattedGr = `${this.hectad}<span class='nonsig'>${this.quadrantCode}</span>`;
			} else {
				if (significantPrecision > 5000) {
					// large and probably spurious precision value - so grey-out the entire grid-reference
					formattedGr = `<span class='nonsig'>${this.preciseGridRef}</span>`;
				} else {
					let columns = (5 + Math.log10(1 / significantPrecision)) | 0; // number of sig figures
					let halfNumLen = ((this.preciseGridRef.length - 2) / 2) | 0;

					formattedGr = this.preciseGridRef.substring(0, 2) + "<span class='sig'>" + this.preciseGridRef.substring(2, 2 + columns) + "</span>" +
						"<span class='nonsig'>" + this.preciseGridRef.substring(columns + 2, 2 + halfNumLen) + "</span>" +
						"<span class='sig'>" + this.preciseGridRef.substring(2 + halfNumLen, 2 + halfNumLen + columns) + "</span>" +
						"<span class='nonsig'>" + this.preciseGridRef.substring(2 + halfNumLen + columns) + "</span>"
					;
				}
			}
		}

		return formattedGr;
	}

	/**
	 * Interleaves xy co-ordinate pairs at each resolution
	 * also includes hectad level precision as a separate 5 x 5 tier
	 * DOES NOT SUPPORT QUADRANTS, which are stripped out.
	 *
	 * @param {string} gridRefString
	 * @return {string}
	 * @throws Error
	 */
	static interleave(gridRefString) {
		if (!gridRefString) {
			return '';
		}

		let tetrad;

		if (gridRefString.length > 3) {

			if (gridRefString.includes('NENWSESW', gridRefString.length - 2)) {
			//if (str_contains('NENWSESW', substr(gridRefString, -2))) {

				gridRefString = gridRefString.substring(0, gridRefString.length - 2);
				tetrad = '';

			} else if (gridRefString.substring(gridRefString.length - 1).match(/a-z/i)) {
			//} else if (ctype_alpha(substr(gridRefString, -1))) {

				let o = TETRAD_LETTERS.indexOf(gridRefString.substring(gridRefString.length - 1))
				//let o = strpos(TETRAD_LETTERS, substr(gridRefString, -1));

				gridRefString = gridRefString.substring(0, gridRefString.length - 1);
				tetrad = `${(o / 5)|0}${o % 5}`;
			} else {
				tetrad = '';
			}
		} else {
			tetrad = '';
		}

		switch (gridRefString.length) {
			case 0:
				return '';

			case 1:
				return `_${gridRefString}`;

			case 2:
				return gridRefString;

			case 3:
				return `_${gridRefString}${tetrad}`;

			case 4:
				return `${gridRefString}${tetrad}`;

			case 5:
				return `_${gridRefString.substring(0, 2)}${gridRefString[3]}${gridRefString[2] >> 1}${gridRefString[4] >> 1}${gridRefString[2]}${gridRefString[4]}`;

			case 6:
				return `${gridRefString.substring(0, 3)}${gridRefString[4]}${gridRefString[3] >> 1}${gridRefString[5] >> 1}${gridRefString[3]}${gridRefString[5]}`;

			case 7:
				return `_${gridRefString.substring(0, 2)}${gridRefString[4]}${gridRefString[2] >> 1}${gridRefString[5] >> 1}${gridRefString[2]}${gridRefString[5]}${gridRefString[3]}${gridRefString[6]}`;

			case 8:
				return `${gridRefString.substring(0, 3)}${gridRefString[5]}${gridRefString[3] >> 1}${gridRefString[6] >> 1}${gridRefString[3]}${gridRefString[6]}${gridRefString[4]}${gridRefString[7]}`;

			case 9:
				return `_${gridRefString.substring(0, 2)}${gridRefString[5]}${gridRefString[2] >> 1}${gridRefString[6] >> 1}${gridRefString[2]}${gridRefString[6]}${gridRefString[3]}${gridRefString[7]}${gridRefString[4]}${gridRefString[8]}`;

			case 10:
				return `${gridRefString.substring(0, 3)}${gridRefString[6]}${gridRefString[3] >> 1}${gridRefString[7] >> 1}${gridRefString[3]}${gridRefString[7]}${gridRefString[4]}${gridRefString[8]}${gridRefString[5]}${gridRefString[9]}`;

			case 11:
				return `_${gridRefString.substring(0, 2)}${gridRefString[6]}${gridRefString[2] >> 1}${gridRefString[7] >> 1}${gridRefString[2]}${gridRefString[7]}${gridRefString[3]}${gridRefString[8]}${gridRefString[4]}${gridRefString[9]}${gridRefString[5]}${gridRefString[10]}`;

			case 12:
				return `${gridRefString.substring(0, 3)}${gridRefString[7]}${gridRefString[3] >> 1}${gridRefString[8] >> 1}${gridRefString[3]}${gridRefString[8]}${gridRefString[4]}${gridRefString[9]}${gridRefString[5]}${gridRefString[10]}${gridRefString[6]}${gridRefString[11]}`;

			default:
				throw new Error(`Bad grid-ref length '${gridRefString.length}' for interleaving.`);
		}

		// return match (strlen(gridRefString)) {
		// 	    0 => '',
		// 		1 => "_{gridRefString}",
		// 		2 => gridRefString,
		// 		3 => "_{gridRefString}{tetrad}",
		// 		4 => "{gridRefString}{tetrad}",
		// 		5 => "_" . substr(gridRefString, 0, 2) . gridRefString[3] . (gridRefString[2] >> 1) . (gridRefString[4] >> 1) . gridRefString[2] . gridRefString[4],
		// 		6 => substr(gridRefString, 0, 3) . gridRefString[4] . (gridRefString[3] >> 1) . (gridRefString[5] >> 1) . gridRefString[3] . gridRefString[5],
		// 		7 => '_' . substr(gridRefString, 0, 2) . gridRefString[4] . (gridRefString[2] >> 1) . (gridRefString[5] >> 1) . gridRefString[2] . gridRefString[5] . gridRefString[3] . gridRefString[6],
		// 		8 => substr(gridRefString, 0, 3) . gridRefString[5] . (gridRefString[3] >> 1) . (gridRefString[6] >> 1) . gridRefString[3] . gridRefString[6] . gridRefString[4] . gridRefString[7],
		// 		9 => '_' . substr(gridRefString, 0, 2) . gridRefString[5] . (gridRefString[2] >> 1) . (gridRefString[6] >> 1) . gridRefString[2] . gridRefString[6] . gridRefString[3] . gridRefString[7] . gridRefString[4] . gridRefString[8],
		// 		10 => substr(gridRefString, 0, 3) . gridRefString[6] . (gridRefString[3] >> 1) . (gridRefString[7] >> 1) . gridRefString[3] . gridRefString[7] . gridRefString[4] . gridRefString[8] . gridRefString[5] . gridRefString[9],
		// 		11 => '_' . substr(gridRefString, 0, 2) . gridRefString[6] . (gridRefString[2] >> 1) . (gridRefString[7] >> 1) . gridRefString[2] . gridRefString[7] . gridRefString[3] . gridRefString[8] . gridRefString[4] . gridRefString[9] . gridRefString[5] . gridRefString[10],
		// 		12 => substr(gridRefString, 0, 3) . gridRefString[7] . (gridRefString[3] >> 1) . (gridRefString[8] >> 1) . gridRefString[3] . gridRefString[8] . gridRefString[4] . gridRefString[9] . gridRefString[5] . gridRefString[10] . gridRefString[6] . gridRefString[11],
		// 	default => throw new Exception("Bad gridref length '" . strlen(gridRefString) . "' for interleaving."),
		// };
	}
}
