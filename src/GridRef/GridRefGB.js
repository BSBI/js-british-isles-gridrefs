import {GridRef} from './GridRef';
import {GridCoordsGB} from '../GridCoords/GridCoords';

export class GridRefGB extends GridRef {
	/**
	 *
	 * @type {string}
	 */
	country = 'GB';

	/**
	 *
	 * @type {typeof GridCoordsGB}
	 */
	GridCoords = GridCoordsGB;

	/**
	 * @type {GridCoordsGB}
	 */
	gridCoords = null;

	constructor() {
		super();
	}

	/**
	 * gridref known to have correct syntax
	 * may have tetrad or quadrant suffix
	 *
	 * @param {string} rawGridRef
	 * @throws Error
	 */
	parse_well_formed(rawGridRef) {

		if (rawGridRef.length >= 5 && /^[A-Z]/.test(rawGridRef.charAt(4))) {
			// tetrad or quadrant

			if (GridRef.quadrantOffsets.hasOwnProperty(rawGridRef.substring(rawGridRef.length - 2))) {
				this.quadrantCode = rawGridRef.substring(rawGridRef.length - 2);
			} else {
				this.tetradLetter = rawGridRef.charAt(4);
			}

			rawGridRef = rawGridRef.substring(0, 4);
		}

		//this sets easting/northing, length and hectad
		this.parse_wellformed_gb_gr_string_no_tetrads(rawGridRef);

		if (this.tetradLetter || this.quadrantCode) {
			// tetrad or quadrant suffix

			if (this.tetradLetter) {
				this.preciseGridRef = this.tetrad = this.hectad + this.tetradLetter;
				this.length = 2000; // 2km square
				this.gridCoords.x += GridRef.tetradOffsets[this.tetradLetter][0];
				this.gridCoords.y += GridRef.tetradOffsets[this.tetradLetter][1];
			} else {
				// quadrant
				this.preciseGridRef = this.quadrant = rawGridRef + this.quadrantCode;
				this.length = 5000; // 5km square
				this.gridCoords.x += GridRef.quadrantOffsets[this.quadrantCode][0];
				this.gridCoords.y += GridRef.quadrantOffsets[this.quadrantCode][1];
			}
		} else {
			this.preciseGridRef = rawGridRef;

			if (this.length <= 1000) {
				// calculate tetrad for precise gridref
				this.set_tetrad();
			}
		}
	}

	/**
	 *
	 * @param {string} rawGridRef
	 * @throws Error
	 */
	fromString(rawGridRef) {
		// grid ref may not be in canonical format
		let trimmedLocality = rawGridRef.replace(/[\[\]\s\t.-]+/g, '').toUpperCase();
		let tetradCode = '';
		let ref;

		if (/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(trimmedLocality)) {
			// tetrad or quadrant

			if (GridRef.quadrantOffsets.hasOwnProperty(trimmedLocality.substring(trimmedLocality.length - 2))) {
				this.quadrantCode = trimmedLocality.substring(trimmedLocality.length - 2);
				trimmedLocality = trimmedLocality.substring(0, trimmedLocality.length - 2);
			} else {
				tetradCode = trimmedLocality.charAt(trimmedLocality.length - 1);
				trimmedLocality = trimmedLocality.substring(0, trimmedLocality.length - 1);
			}
		}

		// if all numeric gridref, e.g. 38517462 then
		// split with '/', i.e. 38/517462
		if (trimmedLocality === parseInt(trimmedLocality, 10).toString()) {
			trimmedLocality = trimmedLocality.substring(0, 2) + '/' + trimmedLocality.substring(2);
		} else if (trimmedLocality.length > 3 && trimmedLocality.charAt(2) === '/' && /^[A-Z]{2}$/.test(trimmedLocality.substring(0, 2))) {
			// preprocess refs of form SD/59 to SD59
			// but at this stage want to retain old-style nn/nnnn gridrefs
			trimmedLocality = trimmedLocality.replace('/', '');
		}

		if (trimmedLocality.substring(0, 2) === 'VC') {
			// special case error, VC number entered into the wrong field
			this.error = true;
			this.errorMessage = "Misplaced vice-county code in grid-reference field. ('" + trimmedLocality + "')";
			this.gridCoords = null;
			this.length = 0;
		} else if ((ref = trimmedLocality.match(/^([HJNOST][ABCDEFGHJKLMNOPQRSTUVWXYZ](?:\d\d){1,5})$/)) !== null) {
			trimmedLocality = ref[0]; //grid reference

			this.parse_wellformed_gb_gr_string_no_tetrads(trimmedLocality);

			if (this.length > 0) {
				if (this.length === 10000 && (tetradCode || this.quadrantCode)) {
					// tetrad or quadrant suffix

					if (tetradCode) {
						this.preciseGridRef = trimmedLocality + tetradCode;
						this.tetradLetter = tetradCode;
						this.tetrad = this.hectad + tetradCode;
						this.length = 2000; // 2km square
						this.gridCoords.x += GridRef.tetradOffsets[tetradCode][0];
						this.gridCoords.y += GridRef.tetradOffsets[tetradCode][1];
					} else {
						// quadrant
						this.preciseGridRef = trimmedLocality + this.quadrantCode;
						this.tetradLetter = '';
						this.tetrad = '';
						this.quadrant = this.preciseGridRef;
						this.length = 5000; // 5km square
						this.gridCoords.x += GridRef.quadrantOffsets[this.quadrantCode][0];
						this.gridCoords.y += GridRef.quadrantOffsets[this.quadrantCode][1];
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
				this.errorMessage = 'GB grid reference format not understood (strange length).';
			}
		} else if (/^([\d]{2})\/((?:\d\d){1,5})$/.test(trimmedLocality)) {
			// matching old-style nn/nnnn gridrefs
			// where second-part must have even-number of digits

			this.parse_gr_string_without_tetrads(trimmedLocality);

			switch (this.length) {
				case 10000:
					trimmedLocality = this.gridCoords.to_gridref(10000);
					this.hectad = trimmedLocality;

					if (tetradCode) {
						trimmedLocality += tetradCode;
						this.tetradLetter = tetradCode;
						this.tetrad = this.hectad + tetradCode;
						this.length = 2000; // 2km square
						this.gridCoords.x += GridRef.tetradOffsets[tetradCode][0];
						this.gridCoords.y += GridRef.tetradOffsets[tetradCode][1];
					} else if (this.quadrantCode) {
						trimmedLocality += this.quadrantCode;
						this.quadrant = trimmedLocality;
						this.length = 5000; // 5km square
						this.gridCoords.x += GridRef.quadrantOffsets[this.quadrantCode][0];
						this.gridCoords.y += GridRef.quadrantOffsets[this.quadrantCode][1];
					}
					break;

				case 1000:
				case 100:
				case 10:
				case 1:
					trimmedLocality = this.gridCoords.to_gridref(this.length);
					this.hectad = this.gridCoords.to_gridref(10000);
					this.set_tetrad();
					break;

				default:
					this.error = true;
					this.errorMessage = 'Bad grid square dimension (' + this.length + ' m).';
					this.gridCoords = null;
					this.length = 0;
			}

			this.preciseGridRef = trimmedLocality;
		} else {
			// no match
			this.gridCoords = null;
			this.length = 0;
			this.error = true;
			this.errorMessage = "Grid reference format not understood. ('" + rawGridRef + "')";
		}
	}

	/**
	 * sets easting, northing and length (in km)
	 * source grid-reference need not be well-formed
	 *
	 * @param {string} gridRef either nn/nn... or aann...
	 */
	parse_gr_string_without_tetrads(gridRef) {
		let matches, x, y, ref;

		if ((matches = gridRef.match(/^(\d{2})\/((?:\d\d){1,5})$/)) !== null) {

			// old style numerical sheet ref XY/nnnnnn
			// nnnn part must have even length

			// northern scottish islands have eccentric numbering
			switch (matches[1]) {
				case '57':
					x = 300000;
					y = 1000000;
					break;

				case '67':
					x = 400000;
					y = 1000000;
					break;

				case '58':
					x = 300000;
					y = 1100000;
					break;

				case '68':
					x = 400000;
					y = 1100000;
					break;

				case '69':
					x = 400000;
					y = 1200000;
					break;

				default:
					x = gridRef.charAt(0) * 100000;
					y = gridRef.charAt(1) * 100000;
			}

			ref = matches[2];
		} else {
			// modern alphabetical sheet ref
			if (!GridRef.letterMapping.hasOwnProperty(gridRef.charAt(0)) || !GridRef.letterMapping.hasOwnProperty(gridRef.charAt(1))) {
				// invalid
				this.length = 0;
				this.gridCoords = null;
				return;
			}

			let char1 = GridRef.letterMapping[gridRef.charAt(0)];
			let char2 = GridRef.letterMapping[gridRef.charAt(1)];
			ref = gridRef.substring(2);

			x = ((char1 % 5) * 500000) + ((char2 % 5) * 100000) - 1000000;
			y = (-Math.floor(char1 / 5) * 500000) - (Math.floor(char2 / 5) * 100000) + 1900000;
		}

		switch (ref.length) {
			case 2:
				this.gridCoords = new GridCoordsGB(
					x + ref.charAt(0) * 10000, // use first digit of ref
					y + ref.charAt(1) * 10000 // use second digit of ref
				);
				this.length = 10000; //10 km square
				break;

			case 4:
				this.gridCoords = new GridCoordsGB(
					x + Math.floor(ref / 100) * 1000,
					y + (ref % 100) * 1000
				);
				this.length = 1000; //1 km square
				break;

			case 6:
				this.gridCoords = new GridCoordsGB(
					x + Math.floor(ref / 1000) * 100,
					y + (ref % 1000) * 100
				);
				this.length = 100; //100m square
				break;

			case 8:
				this.gridCoords = new GridCoordsGB(
					x + Math.floor(ref / 10000) * 10,
					y + (ref % 10000) * 10
				);
				this.length = 10; //10m square
				break;

			case 10:
				this.gridCoords = new GridCoordsGB(
					x + Math.floor(ref / 100000),
					y + (ref % 100000)
				);
				this.length = 1; //1m square
				break;

			default:
				console.log('Bad grid ref length, ref=' + gridRef);
				this.gridCoords = null;
				this.length = 0;
		}
	}

	/**
	 * gridRef must be a correctly formed OS GB grid-reference
	 *
	 * sets self::gridCoords
	 * sets self::length
	 * sets self::hectad
	 *
	 * @param {string} gridRef modern alphanumeric format with no suffixes
	 * @throws Error
	 */
	parse_wellformed_gb_gr_string_no_tetrads(gridRef) {
		let char1, char2, ref, x, y;

		// modern alphabetical sheet refs only
		char1 = GridRef.letterMapping[gridRef.charAt(0)];
		char2 = GridRef.letterMapping[gridRef.charAt(1)];
		ref = gridRef.substring(2);

		x = ((char1 % 5) * 500000) + ((char2 % 5) * 100000) - 1000000;
		y = (-Math.floor(char1 / 5) * 500000) - (Math.floor(char2 / 5) * 100000) + 1900000;

		switch (ref.length) {
			case 2:
				this.gridCoords = new GridCoordsGB(
					x + ref.charAt(0) * 10000, // use first digit of ref
					y + ref.charAt(1) * 10000 // use second digit of ref
				);
				this.length = 10000; //10 km square
				this.hectad = gridRef;
				break;

			case 4:
				this.gridCoords = new GridCoordsGB(
					x + (Math.floor(ref / 100) * 1000),
					y + ((ref % 100) * 1000)
				);
				this.length = 1000; //1 km square
				this.hectad = gridRef.substring(0, 3) + gridRef.charAt(4);
				break;

			case 6:
				this.gridCoords = new GridCoordsGB(
					x + (Math.floor(ref / 1000)) * 100,
					y + (ref % 1000) * 100
				);
				this.length = 100; //100m square
				this.hectad = gridRef.substring(0, 3) + gridRef.charAt(5);
				break;

			case 8:
				this.gridCoords = new GridCoordsGB(
					x + (Math.floor(ref / 10000)) * 10,
					y + (ref % 10000) * 10
				);
				this.length = 10; //10m square
				this.hectad = gridRef.substring(0, 3) + gridRef.charAt(6);
				break;

			case 10:
				this.gridCoords = new GridCoordsGB(
					x + Math.floor(ref / 100000),
					y + (ref % 100000)
				);
				this.length = 1; //1m square
				this.hectad = gridRef.substring(0, 3) + gridRef.charAt(7);
				break;

			default:
				this.gridCoords = null;
				throw new Error("Bad grid ref length when parsing supposedly well-formed ref, ref='" + gridRef + "'");
		}
	}
}
