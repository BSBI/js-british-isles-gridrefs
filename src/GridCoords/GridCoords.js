import {LatLngGB} from '../LatLng/LatLngGB';
import {LatLngCI} from '../LatLng/LatLngCI';
import {LatLngIE} from '../LatLng/LatLngIE';
import {LatLngWGS84} from '../LatLng/LatLngWGS84';

/**
 * abstract representation of a gridref co-ordinate pair
 * (*not a gridref string*)
 *
 */
export class GridCoords {

	/**
	 * @type {number}
	 */
	x;

	/**
	 * @type {number}
	 */
	y;

	constructor() {
	}

	/**
	 * convert easting,northing to a WGS84 lat lng
	 * @abstract
	 * @returns {LatLngWGS84}
	 */
	to_latLng() {
	}

	/**
	 *
	 * @param {number} precision metres
	 * @abstract
	 * @returns {string}
	 */
	to_gridref(precision) {
	}

	/**
	 * tetrad letters ordered by easting then northing (steps of 2000m)
	 * i.e. (x*4) + y
	 *
	 * where x and y are integer of (10km remainder / 2)
	 * @type {string}
	 */
	static tetradLetters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';

	/**
	 * tetrad letters ordered by northing then easting (steps of 2000m)
	 * i.e. (y*5) + x
	 *
	 * where x and y are integer of (10km remainder / 2)
	 *
	 * @type {string}
	 */
	static tetradLettersRowFirst = 'AFKQVBGLRWCHMSXDINTYEJPUZ';

	/**
	 *
	 * @param {number} lat
	 * @param {number} lng
	 * @returns {GridCoords}
	 */
	static from_latlng(lat, lng) {
		// test if GB
		if (lng >= -8.74 && lat > 49.88) {
			// lng extreme must accommodate St Kilda

			let os = new LatLngGB.from_wgs84(new LatLngWGS84(lat, lng)).to_os_coords();
			if (os.x >= 0 && os.is_gb_hectad()) {
				return os;
			}
		}

		// test if Irish
		if (lng < -5.3 && lat > 51.34 && lng > -11 && lat < 55.73) {
			let osI = new LatLngIE.from_wgs84(new LatLngWGS84(lat, lng)).to_os_coords();

			if (osI.x < 0 || osI.y < 0) {
				return null;
			} else {
				return osI;
			}
		} else {
			let osCi = new LatLngCI.from_wgs84(new LatLngWGS84(lat, lng)).to_os_coords();

			if (osCi.x >= 500000 && osCi.x < 600000 && osCi.y >= 5400000 && osCi.y < 5600000) {
				return osCi;
			}
		}

		return null; //not a valid location
	}

	/**
	 *
	 * @param {number} easting
	 * @param {number} northing
	 * @return {string} tetrad letter
	 */
	static calculate_tetrad(easting, northing) {
		return (easting >= 0 && northing >= 0) ?
			GridCoords.tetradLetters.charAt((Math.floor(easting % 10000 / 2000) * 5) + Math.floor(northing % 10000 / 2000)) :
			'';
	};

	toString() {
		return this.x + ',' + this.y;
	};
}

/**
 *
 * @param {string} letters
 * @param {number} e metres
 * @param {number} n metres
 * @param {number} precision metres
 * @returns {String}
 */
export const _e_n_to_gr = function(letters, e, n, precision) {
	let eString = ('00000' + Math.floor(e));
	let nString = ('00000' + Math.floor(n));

	if (precision === 2000) {
		return letters +
			eString.charAt(eString.length-5) + nString.charAt(nString.length-5) +
			GridCoords.calculate_tetrad(e, n);
	} else if (precision === 100000) {
		return letters;
	} else {
		if (precision === 5000) {
			// ignore quadrant and treat as hectad
			precision = 10000;
		}

		let logPrecision = Math.round(Math.log10(precision));
		return letters +
			(logPrecision ?
				(eString.slice(-5,  -logPrecision) + nString.slice(-5,  -logPrecision))
				:
				(eString.slice(-5) + nString.slice(-5))
			);
	}
}
