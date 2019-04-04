import {LatLngGB} from '../LatLng/LatLngGB';
import {LatLngCI} from '../LatLng/LatLngCI';
import {LatLngIE} from '../LatLng/LatLngIE';
import {LatLngWGS84} from '../LatLng/LatLngWGS84';

// export const GridCoords = /*@__PURE__*/(function() {

/**
 * abstract representation of a gridref co-ordinate pair
 * (*not a gridref string*)
 *
 * @constructor
 * @returns {GridCoords}
 */
export const GridCoords = function () {};

/**
 * tetrad letters ordered by easting then northing (steps of 2000m)
 * i.e. (x*4) + y
 * 
 * where x and y are integer of (10km remainder / 2)
 * @type {string}
 */
GridCoords.tetradLetters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';

/**
 * tetrad letters ordered by northing then easting (steps of 2000m)
 * i.e. (y*5) + x
 * 
 * where x and y are integer of (10km remainder / 2)
 * 
 * @type {string}
 */
GridCoords.tetradLettersRowFirst = 'AFKQVBGLRWCHMSXDINTYEJPUZ';

/**
 * 
 * @param {number} lat
 * @param {number} lng
 * @returns {GridCoords}
 */
GridCoords.from_latlng = function(lat, lng) {
	// test if GB
	if (lng >= -8.74 && lat > 49.88) {
		// lng extreme must accommodate St Kilda
		
		var os = new LatLngGB.from_wgs84(new LatLngWGS84(lat, lng)).to_os_coords();
		if (os.x >= 0 && os.is_gb_hectad()) {
			return os;
		}
	}
	
	// test if Irish
	if (lng < -5.3 && lat > 51.34 && lng > -11 && lat < 55.73) {
		var osI = new LatLngIE.from_wgs84(new LatLngWGS84(lat, lng)).to_os_coords();

		if (osI.x < 0 || osI.y < 0) {
			return null;
		} else {
			return osI;
		}
	} else {
		var osCi = new LatLngCI.from_wgs84(new LatLngWGS84(lat, lng)).to_os_coords();

		if (osCi.x >= 500000 && osCi.x < 600000 && osCi.y >= 5400000 && osCi.y < 5600000) {
			return osCi;
		}
	}
	
	return null; //not a valid location
};

/**
 * 
 * @param {number} easting
 * @param {number} northing
 * @return {string} tetrad letter
 */
GridCoords.calculate_tetrad = function(easting, northing) {
	return (easting >= 0 && northing >= 0) ?
		GridCoords.tetradLetters.charAt((Math.floor(easting % 10000 / 2000) * 5) + Math.floor(northing % 10000 / 2000)) :
		'';
};

GridCoords.prototype.toString = function() {
	return this.x + ',' + this.y;
};

// return GridCoords;
// })();

/**
 * 
 * @param {string} letters
 * @param {number} e metres
 * @param {number} n metres
 * @param {number} precision metres
 * @returns {String}
 */
export const _e_n_to_gr = function(letters, e, n, precision) {
	var eString = ('00000' + Math.floor(e));
	var nString = ('00000' + Math.floor(n));
	
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
	
		var logPrecision = Math.round(Math.log10(precision));
		return letters +
			(logPrecision ? 
				(eString.slice(-5,  -logPrecision) + nString.slice(-5,  -logPrecision))
				:
				(eString.slice(-5) + nString.slice(-5))
			);
	}
};