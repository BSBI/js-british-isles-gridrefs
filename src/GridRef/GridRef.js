export class GridRef {

	/**
	 * x,y offsets (in metres) for tetrad letter codes
	 * @type {Object.<string,Array.<number>>}
	 */
	static tetradOffsets = {
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
	static quadrantOffsets = {
		NW: [0, 5000],
		NE: [5000, 5000],
		SW: [0, 0],
		SE: [5000, 0]
	};

	/**
	 * numerical mapping of letters to numbers
	 * 'I' is omitted
	 *
	 * @type {{A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number, J: number, K: number, L: number, M: number, N: number, O: number, P: number, Q: number, R: number, S: number, T: number, U: number, V: number, W: number, X: number, Y: number, Z: number}}
	 */
	static letterMapping = {
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
	 * @type {string}
	 */
	static tetradLetters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';

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

	/**
	 * update tetrad using Easting/Northing values (metres)
	 * hectad should have been set prior to call
	 */
	set_tetrad() {
		// this.tetradLetter = GridRef.tetradLetters.substr(
		//     ((Math.floor((this.gridCoords.x % 10000) / 1000) >> 1) * 5) + (Math.floor((this.gridCoords.y % 10000) / 1000) >> 1)
		//     , 1);
		this.tetradLetter = GridRef.tetradLetters.charAt(
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
	static get_normalized_precision(rawPrecision, minPrecision) {
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
}
