const deg2rad = Math.PI / 180;
const rad2deg = 180.0 / Math.PI;

class LatLng {

	/**
	 * @type {number}
	 */
	lat;

	/**
	 * @type {number}
	 */
	lng;

	/**
	 * represents lat lng
	 *
	 * @param {number} lat
	 * @param {number} lng
	 * @constructor
	 */
	constructor(lat, lng) {
		this.lat = lat;
		this.lng = lng;
	};

	static _transform(lat, lon, a, e, h, a2, e2, xp, yp, zp, xr, yr, zr, s) {
		// convert to cartesian; lat, lon are radians
		const sf = s * 0.000001;
		let v = a / (Math.sqrt(1 - (e * (Math.sin(lat) * Math.sin(lat)))));
		const x = (v + h) * Math.cos(lat) * Math.cos(lon);
		const y = (v + h) * Math.cos(lat) * Math.sin(lon);
		const z = ((1 - e) * v + h) * Math.sin(lat);
		// transform cartesian
		const xrot = (xr / 3600) * deg2rad;
		const yrot = (yr / 3600) * deg2rad;
		const zrot = (zr / 3600) * deg2rad;
		const hx = x + (x * sf) - (y * zrot) + (z * yrot) + xp;
		const hy = (x * zrot) + y + (y * sf) - (z * xrot) + yp;
		const hz = (-1 * x * yrot) + (y * xrot) + z + (z * sf) + zp;
		// Convert back to lat, lon
		lon = Math.atan(hy / hx);
		const p = Math.sqrt((hx * hx) + (hy * hy));
		lat = Math.atan(hz / (p * (1 - e2)));
		v = a2 / (Math.sqrt(1 - e2 * (Math.sin(lat) * Math.sin(lat))));
		let errvalue = 1.0;
		let lat0 = 0;
		while (errvalue > 0.001) {
			lat0 = Math.atan((hz + e2 * v * Math.sin(lat)) / p);
			errvalue = Math.abs(lat0 - lat);
			lat = lat0;
		}
		//h = p / Math.cos(lat) - v;
		//var geo = { latitude: lat, longitude: lon, height: h };  // object to hold lat and lon
		return (new LatLng(lat, lon));
	}

	//helper
	static _Marc(bf0, n, phi0, phi) {
		return bf0 * (((1 + n + ((5 / 4) * (n * n)) + ((5 / 4) * (n * n * n))) * (phi - phi0))
			- (((3 * n) + (3 * (n * n)) + ((21 / 8) * (n * n * n))) * (Math.sin(phi - phi0)) * (Math.cos(phi + phi0)))
			+ ((((15 / 8) * (n * n)) + ((15 / 8) * (n * n * n))) * (Math.sin(2 * (phi - phi0))) * (Math.cos(2 * (phi + phi0))))
			- (((35 / 24) * (n * n * n)) * (Math.sin(3 * (phi - phi0))) * (Math.cos(3 * (phi + phi0)))));
	};

}

/**
 * represents lat lng as WGS84 (google map form)
 *
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */

class LatLngWGS84 extends LatLng {
	constructor(lat, lng) {
		super(lat, lng);
	}
}

/**
 * represents lat lng as OSGB1936 (Ordnance Survey projection)
 *
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */
class LatLngGB extends LatLng {

	constructor(lat, lng) {
		super(lat, lng);
	}


	/**
	 *
	 * @returns {LatLngWGS84}
	 */
	to_WGS84() {
		//airy1830 = new RefEll(6377563.396, 6356256.909);
		let a = 6377563.396; //airy1830.maj;
		//var b        = 6356256.909; //airy1830.min;
		let eSquared = 0.00667054007; // ((maj * maj) - (min * min)) / (maj * maj); // airy1830.ecc;
		const phi = this.lat * deg2rad; // (Math.PI / 180)(this.lat);
		const sinPhi = Math.sin(phi);
		const lambda = this.lng * deg2rad; // (Math.PI / 180)(this.lng);
		const v = a / (Math.sqrt(1 - eSquared * (sinPhi * sinPhi)));
		//H = 0; // height
		const x = v * Math.cos(phi) * Math.cos(lambda);
		const y = v * Math.cos(phi) * Math.sin(lambda);
		const z = ((1 - eSquared) * v) * sinPhi;

		const tx = 446.448;
		const ty = -124.157;
		const tz = 542.060;
		const s = -0.0000204894;
		const rx = 0.000000728190110241429; // (Math.PI / 180)( 0.00004172222);
		const ry = 0.000001197489772948010; // (Math.PI / 180)( 0.00006861111);
		const rz = 0.000004082615892268120; // (Math.PI / 180)( 0.00023391666);

		const xB = tx + (x * (1 + s)) + (-rx * y) + (ry * z);
		const yB = ty + (rz * x) + (y * (1 + s)) + (-rx * z);
		const zB = tz + (-ry * x) + (rx * y) + (z * (1 + s));

		//wgs84 = new RefEll(6378137.000, 6356752.3141);
		a = 6378137.000; // wgs84.maj;
		//var b        = 6356752.3141; // wgs84.min;
		eSquared = 0.00669438003;// ((maj * maj) - (min * min)) / (maj * maj); //wgs84.ecc;

		//lambdaB = (180 / Math.PI)(Math.atan(yB / xB));
		const p = Math.sqrt((xB * xB) + (yB * yB));
		let phiN = Math.atan(zB / (p * (1 - eSquared)));

		for (let i = 1; i < 10; ++i) {
			let sinPhiN = Math.sin(phiN); // this must be in the for loop as phiN is variable
			phiN = Math.atan((zB + (eSquared * (a / (Math.sqrt(1 - eSquared * (sinPhiN * sinPhiN)))) * sinPhiN)) / p);
		}

		//this.lat = rad2deg * phiN;
		//this.lng = rad2deg * (Math.atan(yB / xB)); // lambdaB;

		return new LatLngWGS84(rad2deg * phiN, rad2deg * (Math.atan(yB / xB)));
	};

// /**
//  * converts lat and lon (OSGB36) to OS northings and eastings
//  *
//  * @returns {GridCoordsGB}
//  */
// LatLngGB.prototype.to_os_coords = function() {
//     var phi = this.lat * deg2rad; // convert latitude to radians
//     var lam = this.lng * deg2rad; // convert longitude to radians
//     var a = 6377563.396; // OSGB semi-major axis
//     var b = 6356256.91; // OSGB semi-minor axis
//     var e0 = 400000; // easting of false origin
//     var n0 = -100000; // northing of false origin
//     var f0 = 0.9996012717; // OSGB scale factor on central meridian
//     var e2 = 0.0066705397616; // OSGB eccentricity squared
//     var lam0 = -0.034906585039886591; // OSGB false east
//     var phi0 = 0.85521133347722145; // OSGB false north
//     var af0 = a * f0;
//     var bf0 = b * f0;
//
//     // easting
//     var slat2 = Math.sin(phi) * Math.sin(phi);
//     var nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
//     var rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
//     var eta2 = (nu / rho) - 1;
//     var p = lam - lam0;
//     var IV = nu * Math.cos(phi);
//     var clat3 = Math.pow(Math.cos(phi), 3);
//     var tlat2 = Math.tan(phi) * Math.tan(phi);
//     var V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
//     var clat5 = Math.pow(Math.cos(phi), 5);
//     var tlat4 = Math.pow(Math.tan(phi), 4);
//     var VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
//     var east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);
//
//     // northing
//     var n = (af0 - bf0) / (af0 + bf0);
//     var M = LatLng._Marc(bf0, n, phi0, phi);
//     var I = M + (n0);
//     var II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
//     var III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
//     var IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
//     var north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);
//
// 	return new GridCoordsGB(Math.round(east), Math.round(north));
// };

	/**
	 *
	 * @param {LatLngWGS84} latLngWGS84
	 * @returns {LatLngGB}
	 */
	static from_wgs84(latLngWGS84) {

		//first off convert to radians
		const radWGlat = latLngWGS84.lat * deg2rad;
		const radWGlon = latLngWGS84.lng * deg2rad;
		//these are the values for WGS84(GRS80) to OSGB36(Airy)
		const a = 6378137; // WGS84_AXIS
		const e = 0.00669438037928458; // WGS84_ECCENTRIC
		//var h = height; // height above datum (from GPGGA sentence)
		const h = 0;
		const a2 = 6377563.396; // OSGB_AXIS
		const e2 = 0.0066705397616; // OSGB_ECCENTRIC
		const xp = -446.448;
		const yp = 125.157;
		const zp = -542.06;
		const xr = -0.1502;
		const yr = -0.247;
		const zr = -0.8421;
		const s = 20.4894;

		// convert to cartesian; lat, lon are in radians
		const sf = s * 0.000001;
		let v = a / (Math.sqrt(1 - (e * Math.sin(radWGlat) * Math.sin(radWGlat))));
		const x = (v + h) * Math.cos(radWGlat) * Math.cos(radWGlon);
		const y = (v + h) * Math.cos(radWGlat) * Math.sin(radWGlon);
		const z = ((1 - e) * v + h) * Math.sin(radWGlat);

		// transform cartesian
		const xrot = (xr / 3600) * deg2rad;
		const yrot = (yr / 3600) * deg2rad;
		const zrot = (zr / 3600) * deg2rad;
		const hx = x + (x * sf) - (y * zrot) + (z * yrot) + xp;
		const hy = (x * zrot) + y + (y * sf) - (z * xrot) + yp;
		const hz = (-1 * x * yrot) + (y * xrot) + z + (z * sf) + zp;

		// Convert back to lat, lon
		const newLon = Math.atan(hy / hx);
		const p = Math.sqrt((hx * hx) + (hy * hy));
		let newLat = Math.atan(hz / (p * (1 - e2)));
		v = a2 / (Math.sqrt(1 - e2 * (Math.sin(newLat) * Math.sin(newLat))));
		let errvalue = 1.0;
		let lat0 = 0;
		while (errvalue > 0.001) {
			lat0 = Math.atan((hz + e2 * v * Math.sin(newLat)) / p);
			errvalue = Math.abs(lat0 - newLat);
			newLat = lat0;
		}

		return new LatLngGB(newLat * rad2deg, newLon * rad2deg);
	}
}

/**
 * represents lat lng as Modified Airy (Irish grid projection)
 *
 */
class LatLngIE extends LatLng {

	/**
	 *
	 * @param {number} lat
	 * @param {number} lng
	 */
	constructor(lat, lng) {
		super(lat, lng);
	};

// /**
//  * converts lat and lon (modified Airy) to OSI northings and eastings
//  *
//  * @returns {GridCoordsIE}
//  */
// to_os_coords() {
//     //var deg2rad = Math.PI / 180;
//     //var rad2deg = 180.0 / Math.PI;
//
//     var phi = this.lat * deg2rad; // convert latitude to radians
//     var lam = this.lng * deg2rad; // convert longitude to radians
//     var a = 6377340.189;      // OSI semi-major
//     var b = 6356034.447;      // OSI semi-minor
//     var e0 = 200000;          // OSI easting of false origin
//     var n0 = 250000;          // OSI northing of false origin
//     var f0 = 1.000035;        // OSI scale factor on central meridian
//     var e2 = 0.00667054015;   // OSI eccentricity squared
//     var lam0 = -0.13962634015954636615389526147909;   // OSI false east
//     var phi0 = 0.93375114981696632365417456114141;    // OSI false north
//     var af0 = a * f0;
//     var bf0 = b * f0;
//
//     // easting
//     var slat2 = Math.sin(phi) * Math.sin(phi);
//     var nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
//     var rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
//     var eta2 = (nu / rho) - 1;
//     var p = lam - lam0;
//     var IV = nu * Math.cos(phi);
//     var clat3 = Math.pow(Math.cos(phi), 3);
//     var tlat2 = Math.tan(phi) * Math.tan(phi);
//     var V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
//     var clat5 = Math.pow(Math.cos(phi), 5);
//     var tlat4 = Math.pow(Math.tan(phi), 4);
//     var VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
//     var east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);
//
//     // northing
//     var n = (af0 - bf0) / (af0 + bf0);
//     var M = LatLng._Marc(bf0, n, phi0, phi);
//     var I = M + (n0);
//     var II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
//     var III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
//     var IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
//     var north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);
//
// 	//return {x: Math.round(east), y: Math.round(north)};
//
// 	/*
// 	return (east > 0 && north > 0) ?
// 		new GridCoordsIE(Math.round(east), Math.round(north))
// 		:
// 		null;
// 	*/
//    return new GridCoordsIE(Math.round(east), Math.round(north));
// };

	/**
	 * convert Irish projection to WGS84 (for Google Maps)
	 * see http://www.carabus.co.uk/ll_ngr.html
	 */
	to_WGS84() {
		const IRISH_AXIS = 6377340.189;
		const IRISH_ECCENTRIC = 0.00667054015;

		const WGS84_AXIS = 6378137;
		const WGS84_ECCENTRIC = 0.00669438037928458;

		/*
		 * IE
		a = 6377340.189;      // OSI semi-major
		b = 6356034.447;      // OSI semi-minor
		e0 = 200000;          // OSI easting of false origin
		n0 = 250000;          // OSI northing of false origin
		f0 = 1.000035;        // OSI scale factor on central meridian
		e2 = 0.00667054015;   // OSI eccentricity squared
		lam0 = -0.13962634015954636615389526147909;   // OSI false east
		phi0 = 0.93375114981696632365417456114141;    // OSI false north
		*/

		//height = 0;

		const latLngRadians = LatLng._transform(this.lat * deg2rad, this.lng * deg2rad, IRISH_AXIS, IRISH_ECCENTRIC, 0, WGS84_AXIS, WGS84_ECCENTRIC,
			482.53, -130.596, 564.557, -1.042, -0.214, -0.631, -8.15);

		return new LatLngWGS84(latLngRadians.lat * rad2deg, latLngRadians.lng * rad2deg);
	};

	/**
	 *
	 * @param {LatLngWGS84} latLngWGS84
	 * @returns {LatLngIE}
	 */
	static from_wgs84(latLngWGS84) {
		const phip = latLngWGS84.lat * deg2rad;
		const lambdap = latLngWGS84.lng * deg2rad;

		const IRISH_AXIS = 6377340.189;
		const IRISH_ECCENTRIC = 0.00667054015;

		const WGS84_AXIS = 6378137;
		const WGS84_ECCENTRIC = 0.00669438037928458;


		/*
		 * IE
		a = 6377340.189;      // OSI semi-major
		b = 6356034.447;      // OSI semi-minor
		e0 = 200000;          // OSI easting of false origin
		n0 = 250000;          // OSI northing of false origin
		f0 = 1.000035;        // OSI scale factor on central meridian
		e2 = 0.00667054015;   // OSI eccentricity squared
		lam0 = -0.13962634015954636615389526147909;   // OSI false east
		phi0 = 0.93375114981696632365417456114141;    // OSI false north
		 */

		const height = 0;
		const latlng = LatLng._transform(phip, lambdap, WGS84_AXIS, WGS84_ECCENTRIC, height, IRISH_AXIS, IRISH_ECCENTRIC,
			-482.53, 130.596, -564.557, 1.042, 0.214, 0.631, 8.15);

		return new LatLngIE(latlng.lat * rad2deg, latlng.lng * rad2deg);
	}
}

class LatLngCI extends LatLng {
	/**
	 * represents lat lng as INT24 (CI grid projection)
	 *
	 * @constructor
	 * @param {number} lat
	 * @param {number} lng
	 */
	constructor(lat, lng) {
		super(lat, lng);
	};

	// /**
	//  * converts lat and lon to CI northings and eastings
	//  *
	//  * @returns GridCoordsCI
	//  */
	// to_os_coords() {
	// 	var phi = this.lat * deg2rad; // convert latitude to radians
	// 	var lam = this.lng * deg2rad; // convert longitude to radians
	// 	var a = 6378388.000;      // OSI semi-major
	// 	var b = 6356911.946;      // OSI semi-minor
	// 	var e0 = 500000;          // OSI easting of false origin
	// 	var n0 = 0;          // OSI northing of false origin
	// 	var f0 = 0.9996;        // OSI scale factor on central meridian
	// 	var e2 = 0.0067226700223333;   // OSI eccentricity squared
	// 	var lam0 = -0.0523598775598;   // OSI false east
	// 	var phi0 = 0;    // OSI false north
	// 	var af0 = a * f0;
	// 	var bf0 = b * f0;
	//
	// 	// easting
	// 	var slat2 = Math.sin(phi) * Math.sin(phi);
	// 	var nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
	// 	var rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
	// 	var eta2 = (nu / rho) - 1;
	// 	var p = lam - lam0;
	// 	var IV = nu * Math.cos(phi);
	// 	var clat3 = Math.pow(Math.cos(phi), 3);
	// 	var tlat2 = Math.tan(phi) * Math.tan(phi);
	// 	var V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
	// 	var clat5 = Math.pow(Math.cos(phi), 5);
	// 	var tlat4 = Math.pow(Math.tan(phi), 4);
	// 	var VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
	// 	var east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);
	//
	// 	// northing
	// 	var n = (af0 - bf0) / (af0 + bf0);
	// 	var M = LatLng._Marc(bf0, n, phi0, phi);
	// 	var I = M + (n0);
	// 	var II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
	// 	var III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
	// 	var IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
	// 	var north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);
	//
	// 		//return {x: Math.round(east), y: Math.round(north)};
	// 	return new GridCoordsCI(Math.round(east), Math.round(north));
	// };

	/**
	 *
	 * @param {LatLngWGS84} latLngWGS84
	 * @returns {LatLngCI}
	 */
	static from_wgs84(latLngWGS84) {
		const phip = latLngWGS84.lat * deg2rad;
		const lambdap = latLngWGS84.lng * deg2rad;

		const CI_AXIS = 6378388.000;
		const CI_ECCENTRIC = 0.0067226700223333;

		const WGS84_AXIS = 6378137;
		const WGS84_ECCENTRIC = 0.00669438037928458;


		/*
		 * CI
		 a = 6378388.000;       // INT24 ED50 semi-major
		 b = 6356911.946;       // INT24 ED50 semi-minor
		 e0 = 500000;           // CI easting of false origin
		 n0 = 0;                // CI northing of false origin
		 f0 = 0.9996;           // INT24 ED50 scale factor on central meridian
		 e2 = 0.0067226700223333;  // INT24 ED50 eccentricity squared
		 lam0 = -0.0523598775598;  // CI false east
		 phi0 = 0 * deg2rad;       // CI false north
		 */

		const height = 0;
		const latlng = LatLng._transform(phip, lambdap, WGS84_AXIS, WGS84_ECCENTRIC, height, CI_AXIS, CI_ECCENTRIC,
			83.901, 98.127, 118.635, 0, 0, 0, 0);

		return new LatLngCI(latlng.lat * rad2deg, latlng.lng * rad2deg);
	};
}

/**
 * tetrad letters ordered by easting then northing (steps of 2000m)
 * i.e. (x*4) + y
 *
 * where x and y are integer of (10km remainder / 2)
 * @type {string}
 */
const TETRAD_LETTERS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';

/**
 * abstract representation of a grid-ref co-ordinate pair
 * ( *not a grid-ref string* )
 *
 */
class GridCoords {

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
	 *
	 * @abstract
	 * @returns {?string}
	 */
	to_hectad() {
	}

	// /**
	//  * tetrad letters ordered by northing then easting (steps of 2000m)
	//  * i.e. (y*5) + x
	//  *
	//  * where x and y are integer of (10km remainder / 2)
	//  *
	//  * @type {string}
	//  */
	// static tetradLettersRowFirst = 'AFKQVBGLRWCHMSXDINTYEJPUZ';

	/**
	 *
	 * @param {number} lat WGS84 degrees
	 * @param {number} lng WGS84 degrees
	 * @returns {GridCoords|null}
	 */
	static from_latlng(lat, lng) {
		// test if GB
		if (lng >= -8.74 && lat > 49.88) {
			// lng extreme must accommodate St Kilda

			//let os = LatLngGB.from_wgs84(new LatLngWGS84(lat, lng)).to_os_coords();
			const os = GridCoords._from_gb_latlng(LatLngGB.from_wgs84(new LatLngWGS84(lat, lng)));
			if (os.x >= 0 && os.is_gb_hectad()) {
				return os;
			}
		}

		// test if Irish
		if (lng < -5.3 && lat > 51.34 && lng > -11 && lat < 55.73) {
			//let osI = LatLngIE.from_wgs84(new LatLngWGS84(lat, lng)).to_os_coords();
			const osI = GridCoords._from_ie_latlng(LatLngIE.from_wgs84(new LatLngWGS84(lat, lng)));

			if (osI.x < 0 || osI.y < 0) {
				return null;
			} else {
				return osI;
			}
		} else {
			//let osCi = LatLngCI.from_wgs84(new LatLngWGS84(lat, lng)).to_os_coords();
			const osCi = GridCoords._from_ci_latlng(LatLngCI.from_wgs84(new LatLngWGS84(lat, lng)));

			if (osCi.x >= 500000 && osCi.x < 600000 && osCi.y >= 5400000 && osCi.y < 5600000) {
				return osCi;
			}
		}

		return null; //not a valid location
	}

	/**
	 *
	 * @param {LatLngGB} latLng GB projected latitude / longitude (degrees)
	 */
	static _from_gb_latlng(latLng) {
		const phi = latLng.lat * deg2rad; // convert latitude to radians
		const lam = latLng.lng * deg2rad; // convert longitude to radians
		const a = 6377563.396; // OSGB semi-major axis
		const b = 6356256.91; // OSGB semi-minor axis
		const e0 = 400000; // easting of false origin
		const n0 = -100000; // northing of false origin
		const f0 = 0.9996012717; // OSGB scale factor on central meridian
		const e2 = 0.0066705397616; // OSGB eccentricity squared
		const lam0 = -0.034906585039886591; // OSGB false east
		const phi0 = 0.85521133347722145; // OSGB false north
		const af0 = a * f0;
		const bf0 = b * f0;

		// easting
		const slat2 = Math.sin(phi) * Math.sin(phi);
		const nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
		const rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
		const eta2 = (nu / rho) - 1;
		const p = lam - lam0;
		const IV = nu * Math.cos(phi);
		const clat3 = Math.pow(Math.cos(phi), 3);
		const tlat2 = Math.tan(phi) * Math.tan(phi);
		const V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
		const clat5 = Math.pow(Math.cos(phi), 5);
		const tlat4 = Math.pow(Math.tan(phi), 4);
		const VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
		const east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);

		// northing
		const n = (af0 - bf0) / (af0 + bf0);
		const M = LatLng._Marc(bf0, n, phi0, phi);
		const I = M + (n0);
		const II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
		const III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
		const IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
		const north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);

		return new GridCoordsGB(Math.round(east), Math.round(north));
	}

	/**
	 * converts lat and lon (modified Airy) to OSI northings and eastings
	 *
	 * @param {LatLngIE} latLng Irish projected latitude / longitude (degrees)
	 * @returns {GridCoordsIE}
	 */
	static _from_ie_latlng(latLng) {
		const phi = latLng.lat * deg2rad; // convert latitude to radians
		const lam = latLng.lng * deg2rad; // convert longitude to radians
		const a = 6377340.189;      // OSI semi-major
		const b = 6356034.447;      // OSI semi-minor
		const e0 = 200000;          // OSI easting of false origin
		const n0 = 250000;          // OSI northing of false origin
		const f0 = 1.000035;        // OSI scale factor on central meridian
		const e2 = 0.00667054015;   // OSI eccentricity squared
		const lam0 = -0.13962634015954636615389526147909;   // OSI false east
		const phi0 = 0.93375114981696632365417456114141;    // OSI false north
		const af0 = a * f0;
		const bf0 = b * f0;

		// easting
		const slat2 = Math.sin(phi) * Math.sin(phi);
		const nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
		const rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
		const eta2 = (nu / rho) - 1;
		const p = lam - lam0;
		const IV = nu * Math.cos(phi);
		const clat3 = Math.pow(Math.cos(phi), 3);
		const tlat2 = Math.tan(phi) * Math.tan(phi);
		const V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
		const clat5 = Math.pow(Math.cos(phi), 5);
		const tlat4 = Math.pow(Math.tan(phi), 4);
		const VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
		const east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);

		// northing
		const n = (af0 - bf0) / (af0 + bf0);
		const M = LatLng._Marc(bf0, n, phi0, phi);
		const I = M + (n0);
		const II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
		const III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
		const IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
		const north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);

		return new GridCoordsIE(Math.round(east), Math.round(north));
	}

	/**
	 * converts lat and lon to CI northings and eastings
	 * @param {LatLngCI} latLng Channel Islands projected latitude / longitude (degrees)
	 *
	 * @returns GridCoordsCI
	 */
	static _from_ci_latlng(latLng) {
		const phi = latLng.lat * deg2rad; // convert latitude to radians
		const lam = latLng.lng * deg2rad; // convert longitude to radians
		const a = 6378388.000;      // OSI semi-major
		const b = 6356911.946;      // OSI semi-minor
		const e0 = 500000;          // OSI easting of false origin
		const n0 = 0;          // OSI northing of false origin
		const f0 = 0.9996;        // OSI scale factor on central meridian
		const e2 = 0.0067226700223333;   // OSI eccentricity squared
		const lam0 = -0.0523598775598;   // OSI false east
		const phi0 = 0;    // OSI false north
		const af0 = a * f0;
		const bf0 = b * f0;

		// easting
		const slat2 = Math.sin(phi) * Math.sin(phi);
		const nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
		const rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
		const eta2 = (nu / rho) - 1;
		const p = lam - lam0;
		const IV = nu * Math.cos(phi);
		const clat3 = Math.pow(Math.cos(phi), 3);
		const tlat2 = Math.tan(phi) * Math.tan(phi);
		const V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
		const clat5 = Math.pow(Math.cos(phi), 5);
		const tlat4 = Math.pow(Math.tan(phi), 4);
		const VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
		const east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);

		// northing
		const n = (af0 - bf0) / (af0 + bf0);
		const M = LatLng._Marc(bf0, n, phi0, phi);
		const I = M + (n0);
		const II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
		const III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
		const IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
		const north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);

		return new GridCoordsCI(Math.round(east), Math.round(north));
	}

	/**
	 *
	 * @param {number} easting
	 * @param {number} northing
	 * @return {string} tetrad letter
	 */
	static calculate_tetrad(easting, northing) {
		return (easting >= 0 && northing >= 0) ?
			TETRAD_LETTERS.charAt((Math.floor(easting % 10000 / 2000) * 5) + Math.floor(northing % 10000 / 2000)) :
			'';
	};

	tetradLetter() {
		return (this.x >= 0 && this.y >= 0) ?
			TETRAD_LETTERS.charAt((Math.floor(this.x % 10000 / 2000) * 5) + Math.floor(this.y % 10000 / 2000)) :
			'';
	}

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
const _e_n_to_gr = function (letters, e, n, precision) {
	let eString = ('00000' + Math.floor(e));
	let nString = ('00000' + Math.floor(n));

	if (precision === 2000) {
		return letters +
			eString.charAt(eString.length - 5) + nString.charAt(nString.length - 5) +
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
					(eString.slice(-5, -logPrecision) + nString.slice(-5, -logPrecision))
					:
					(eString.slice(-5) + nString.slice(-5))
			);
	}
};

/**
 *
 */
class GridCoordsGB extends GridCoords {
	/**
	 * @type {GridCoordsGB}
	 */
	gridCoords = null;

	/**
	 *
	 * @param {number} easting
	 * @param {number} northing
	 */
	constructor(easting, northing) {
		super();
		this.x = easting | 0;
		this.y = northing | 0;
	};

	/**
	 *
	 * @type {string}
	 */
	country = 'GB';

	/**
	 *
	 * @type {string}
	 */
	static gbHectads = 'SV80SV81SV90SV91SW32SW33SW42SW43SW44SW52SW53SW54SW61SW62SW63SW64SW65SW71SW72SW73SW74SW75SW76SW81SW82SW83SW84SW85SW86SW87SW95SW96SW97SS10SS11SS20SS21SS30SW83SW84SW85SW93SW94SW95SW96SW97SW98SX03SX04SX05SX06SX07SX08SX09SX14SX15SX16SX17SX18SX19SX25SX26SX27SX28SX29SX35SX36SX37SX38SX39SX44SX45SX46SX47SS70SS80SS81SS90SS91ST00ST01ST10ST11ST20ST21ST30SX37SX44SX45SX46SX47SX48SX54SX55SX56SX57SX58SX63SX64SX65SX66SX67SX68SX69SX73SX74SX75SX76SX77SX78SX79SX83SX84SX85SX86SX87SX88SX89SX94SX95SX96SX97SX98SX99SY07SY08SY09SY18SY19SY28SY29SY38SY39SS14SS20SS21SS22SS30SS31SS32SS40SS41SS42SS43SS44SS50SS51SS52SS53SS54SS60SS61SS62SS63SS64SS70SS71SS72SS73SS74SS75SS80SS81SS82SS83SS91SS92ST01ST02SX28SX29SX37SX38SX39SX48SX49SX58SX59SX68SX69SX79SS73SS74SS82SS83SS84SS92SS93SS94ST01ST02ST03ST04ST11ST12ST13ST14ST20ST21ST22ST23ST24ST25ST30ST31ST32ST33ST34ST40ST41ST42ST50ST51ST52ST61ST62ST71ST72ST24ST25ST26ST32ST33ST34ST35ST36ST37ST42ST43ST44ST45ST46ST47ST52ST53ST54ST55ST56ST57ST62ST63ST64ST65ST66ST67ST72ST73ST74ST75ST76ST77ST83ST84ST85ST86SP00SP10ST76ST77ST85ST86ST87ST88ST89ST96ST97ST98ST99SU06SU07SU08SU09SU16SU17SU18SU19SU26SU27SU28SU29SU36SU37ST73ST74ST75ST76ST82ST83ST84ST85ST86ST91ST92ST93ST94ST95ST96SU01SU02SU03SU04SU05SU06SU11SU12SU13SU14SU15SU16SU21SU22SU23SU24SU25SU26SU31SU32SU34SU35SU36ST20ST30ST40ST50ST51ST60ST61ST70ST71ST72ST73ST80ST81ST82ST83ST90ST91ST92SU00SU01SU02SU10SU11SY39SY48SY49SY58SY59SY66SY67SY68SY69SY77SY78SY79SY87SY88SY89SY97SY98SY99SZ07SZ08SZ09SZ28SZ38SZ39SZ47SZ48SZ49SZ57SZ58SZ59SZ68SZ69SU00SU01SU02SU10SU11SU12SU20SU21SU22SU23SU30SU31SU32SU33SU40SU41SU42SU43SU50SU51SU52SU60SU61SU62SU70SU71SU72SZ08SZ09SZ19SZ29SZ38SZ39SZ49SZ59SZ69SZ79SU23SU24SU25SU33SU34SU35SU36SU42SU43SU44SU45SU46SU52SU53SU54SU55SU56SU62SU63SU64SU65SU66SU72SU73SU74SU75SU76SU82SU83SU84SU85SU86SU70SU71SU72SU80SU81SU82SU83SU90SU91SU92SU93SZ79SZ89SZ99TQ00TQ01TQ02TQ03TQ10TQ11TQ12TQ13TQ20TQ21TQ22TQ23TQ30TQ31TQ32TQ20TQ21TQ22TQ23TQ30TQ31TQ32TQ33TQ40TQ41TQ42TQ43TQ44TQ50TQ51TQ52TQ53TQ54TQ60TQ61TQ62TQ63TQ70TQ71TQ72TQ80TQ81TQ82TQ91TQ92TV49TV59TV69TQ65TQ72TQ73TQ74TQ75TQ76TQ77TQ82TQ83TQ84TQ85TQ86TQ87TQ91TQ92TQ93TQ94TQ95TQ96TQ97TR01TR02TR03TR04TR05TR06TR07TR12TR13TR14TR15TR16TR23TR24TR25TR26TR27TR33TR34TR35TR36TR37TR46TR47TQ35TQ36TQ37TQ38TQ43TQ44TQ45TQ46TQ47TQ48TQ53TQ54TQ55TQ56TQ57TQ58TQ63TQ64TQ65TQ66TQ67TQ72TQ73TQ74TQ75TQ76TQ77TQ78TQ87TQ88TQ97SU83SU84SU85SU86SU93SU94SU95SU96SU97TQ03TQ04TQ05TQ06TQ07TQ13TQ14TQ15TQ16TQ17TQ23TQ24TQ25TQ26TQ27TQ33TQ34TQ35TQ36TQ37TQ38TQ43TQ44TQ45TL30TL40TL50TL60TL70TL80TL90TM00TQ38TQ39TQ47TQ48TQ49TQ57TQ58TQ59TQ67TQ68TQ69TQ77TQ78TQ79TQ88TQ89TQ98TQ99TR08TR09TR19TL30TL31TL34TL40TL41TL42TL43TL44TL50TL51TL52TL53TL54TL60TL61TL62TL63TL64TL70TL71TL72TL73TL74TL80TL81TL82TL83TL84TL90TL91TL92TL93TM01TM02TM03TM11TM12TM13TM21TM22TM23TQ49SP81SP90SP91TL00TL01TL02TL10TL11TL12TL13TL20TL21TL22TL23TL24TL30TL31TL32TL33TL34TL41TL42TL43TL44TL51TL52TQ09TQ19TQ29TQ39TL20TL30TQ06TQ07TQ08TQ09TQ16TQ17TQ18TQ19TQ27TQ28TQ29TQ37TQ38TQ39SP20SP30SP40SP41SP50SU19SU26SU27SU28SU29SU36SU37SU38SU39SU46SU47SU48SU49SU56SU57SU58SU59SU66SU67SU68SU69SU76SU77SU78SU86SU87SU88SU96SU97SU98SP10SP20SP21SP22SP23SP30SP31SP32SP33SP34SP40SP41SP42SP43SP44SP45SP50SP51SP52SP53SP54SP60SP61SP62SP63SP70SU29SU39SU49SU57SU58SU59SU67SU68SU69SU77SU78SU79SP51SP53SP60SP61SP62SP63SP64SP70SP71SP72SP73SP74SP80SP81SP82SP83SP84SP85SP90SP91SP92SP93SP94SP95SU78SU79SU88SU89SU97SU98SU99TL00TL01TQ07TQ08TQ09TG40TG50TM03TM04TM05TM06TM07TM13TM14TM15TM16TM17TM23TM24TM25TM26TM27TM28TM33TM34TM35TM36TM37TM38TM39TM44TM45TM46TM47TM48TM49TM57TM58TM59TL64TL65TL66TL67TL68TL74TL75TL76TL77TL78TL83TL84TL85TL86TL87TL88TL93TL94TL95TL96TL97TL98TM03TM04TM05TM06TM07TM08TG00TG01TG02TG03TG04TG10TG11TG12TG13TG14TG20TG21TG22TG23TG24TG30TG31TG32TG33TG40TG41TG42TG50TG51TM07TM08TM09TM17TM18TM19TM27TM28TM29TM38TM39TM49TM59TF40TF41TF42TF50TF51TF52TF53TF60TF61TF62TF63TF64TF70TF71TF72TF73TF74TF80TF81TF82TF83TF84TF90TF91TF92TF93TF94TG00TG01TG02TG03TG04TL49TL59TL68TL69TL78TL79TL87TL88TL89TL98TL99TM07TM08TM09TF20TF30TF31TF40TF41TF50TL15TL19TL23TL24TL25TL26TL28TL29TL33TL34TL35TL36TL37TL38TL39TL44TL45TL46TL47TL48TL49TL54TL55TL56TL57TL58TL59TL63TL64TL65TL66TL67TL68TL69TL75TL76SP91SP92SP93SP94SP95SP96TL01TL02TL03TL04TL05TL06TL07TL11TL12TL13TL14TL15TL16TL23TL24TL25TL06TL07TL08TL09TL15TL16TL17TL18TL19TL25TL26TL27TL28TL29TL36TL37TL38TL39SK90SP43SP44SP45SP46SP53SP54SP55SP56SP57SP58SP63SP64SP65SP66SP67SP68SP73SP74SP75SP76SP77SP78SP79SP84SP85SP86SP87SP88SP89SP95SP96SP97SP98SP99TF00TF10TF20TL06TL07TL08TL09TL18TL19TL29SO70SO71SO80SO81SO82SO83SO90SO91SO92SO93SO94SP00SP01SP02SP03SP04SP10SP11SP12SP13SP14SP15SP20SP21SP22SP23SP24SP25ST99SU09SU19SU29SO50SO51SO60SO61SO62SO63SO70SO71SO72SO73SO80SO81SO82SO83SO90ST57ST58ST59ST66ST67ST68ST69ST76ST77ST78ST79ST87ST88ST89ST98ST99SO10SO11SO20SO21SO22SO23SO30SO31SO32SO40SO41SO42SO50SO51ST18ST19ST27ST28ST29ST37ST38ST39ST47ST48ST49ST58ST59SO22SO23SO24SO25SO26SO32SO33SO34SO35SO36SO37SO41SO42SO43SO44SO45SO46SO47SO51SO52SO53SO54SO55SO56SO57SO61SO62SO63SO64SO65SO66SO73SO74SO75SO76SO56SO64SO65SO66SO67SO72SO73SO74SO75SO76SO77SO78SO82SO83SO84SO85SO86SO87SO88SO93SO94SO95SO96SO97SO98SO99SP03SP04SP05SP06SP07SP08SP13SP14SP16SP17SP18SK10SK20SK30SP04SP05SP06SP07SP08SP09SP14SP15SP16SP17SP18SP19SP22SP23SP24SP25SP26SP27SP28SP29SP33SP34SP35SP36SP37SP38SP39SP44SP45SP46SP47SP48SP49SP55SP56SP57SP58SJ63SJ70SJ71SJ72SJ73SJ74SJ75SJ80SJ81SJ82SJ83SJ84SJ85SJ86SJ90SJ91SJ92SJ93SJ94SJ95SJ96SK00SK01SK02SK03SK04SK05SK06SK10SK11SK12SK13SK14SK15SK16SK20SK21SK22SO77SO78SO79SO88SO89SO98SO99SP08SP09SP19SP29SJ20SJ21SJ22SJ23SJ30SJ31SJ32SJ33SJ34SJ40SJ41SJ42SJ43SJ50SJ51SJ52SJ53SJ54SJ60SJ61SJ62SJ63SJ64SJ70SJ71SJ72SJ73SJ74SJ80SO17SO18SO27SO28SO29SO37SO38SO39SO46SO47SO48SO49SO56SO57SO58SO59SO66SO67SO68SO69SO77SO78SO79SO88SO89SN50SN60SN61SN70SN71SN80SN81SN90SO00SO01SO10SO11SS38SS39SS48SS49SS58SS59SS68SS69SS77SS78SS79SS87SS88SS89SS96SS97SS98SS99ST06ST07ST08ST09ST16ST17ST18ST19ST26ST27ST28SN70SN71SN74SN80SN81SN82SN83SN84SN85SN86SN90SN91SN92SN93SN94SN95SN96SO00SO01SO02SO03SO04SO05SO06SO10SO11SO12SO13SO14SO21SO22SO23SO24SN86SN87SN96SN97SO04SO05SO06SO07SO08SO13SO14SO15SO16SO17SO18SO24SO25SO26SO27SO36SO37SN01SN02SN10SN11SN12SN20SN21SN22SN23SN24SN30SN31SN32SN33SN34SN40SN41SN42SN43SN44SN50SN51SN52SN53SN54SN60SN61SN62SN63SN64SN65SN71SN72SN73SN74SN75SN81SN82SN83SN84SS39SS49SS59SM50SM62SM70SM71SM72SM73SM80SM81SM82SM83SM84SM90SM91SM92SM93SM94SN00SN01SN02SN03SN04SN10SN11SN12SN13SN14SN22SN23SN24SR89SR99SS09SS19SN14SN15SN24SN25SN33SN34SN35SN36SN44SN45SN46SN54SN55SN56SN57SN58SN64SN65SN66SN67SN68SN69SN74SN75SN76SN77SN78SN79SN84SN85SN86SN87SN88SN89SH70SH71SH80SH81SH90SH91SH92SJ00SJ01SJ02SJ03SJ10SJ11SJ12SJ20SJ21SJ22SJ31SN69SN78SN79SN87SN88SN89SN97SN98SN99SO07SO08SO09SO18SO19SO28SO29SO39SH50SH51SH52SH53SH54SH60SH61SH62SH63SH64SH70SH71SH72SH73SH74SH80SH81SH82SH83SH84SH91SH92SH93SH94SH95SJ03SJ04SJ05SJ13SJ14SN59SN69SN79SH12SH13SH22SH23SH24SH32SH33SH34SH43SH44SH45SH46SH53SH54SH55SH56SH57SH64SH65SH66SH67SH74SH75SH76SH77SH78SH84SH85SH86SH87SH88SH74SH75SH76SH77SH84SH85SH86SH87SH88SH94SH95SH96SH97SH98SJ02SJ03SJ04SJ05SJ06SJ07SJ08SJ12SJ13SJ14SJ15SJ16SJ17SJ22SJ23SJ24SJ25SJ26SJ33SJ34SJ35SJ43SJ44SJ45SJ53SJ54SH97SH98SJ06SJ07SJ08SJ15SJ16SJ17SJ18SJ25SJ26SJ27SJ35SJ36SJ37SH27SH28SH29SH36SH37SH38SH39SH46SH47SH48SH49SH56SH57SH58SH59SH67SH68SK81SK82SK83SK84SK85SK86SK87SK90SK91SK92SK93SK94SK95SK96SK97TF00TF01TF02TF03TF04TF05TF06TF07TF10TF11TF12TF13TF14TF15TF16TF17TF20TF21TF22TF23TF24TF25TF30TF31TF32TF33TF34TF41TF42TF43TF44TF52SE60SE70SE71SE80SE81SE82SE90SE91SE92SK78SK79SK87SK88SK89SK97SK98SK99TA00TA01TA02TA10TA11TA12TA20TA21TA30TA31TA40TF07TF08TF09TF15TF16TF17TF18TF19TF24TF25TF26TF27TF28TF29TF33TF34TF35TF36TF37TF38TF39TF43TF44TF45TF46TF47TF48TF49TF54TF55TF56TF57TF58SK20SK21SK30SK31SK32SK40SK41SK42SK43SK50SK51SK52SK60SK61SK62SK70SK71SK72SK73SK74SK80SK81SK82SK83SK84SK90SK91SP39SP48SP49SP57SP58SP59SP68SP69SP78SP79SP89SP99TF00TF01SE60SE70SK42SK43SK44SK45SK46SK52SK53SK54SK55SK56SK57SK58SK59SK62SK63SK64SK65SK66SK67SK68SK69SK72SK73SK74SK75SK76SK77SK78SK79SK84SK85SK86SK87SK88SK89SK97SJ98SJ99SK03SK06SK07SK08SK09SK11SK12SK13SK14SK15SK16SK17SK18SK19SK21SK22SK23SK24SK25SK26SK27SK28SK31SK32SK33SK34SK35SK36SK37SK38SK42SK43SK44SK45SK46SK47SK48SK53SK56SK57SD90SE00SE10SJ18SJ19SJ27SJ28SJ29SJ35SJ36SJ37SJ38SJ39SJ44SJ45SJ46SJ47SJ48SJ54SJ55SJ56SJ57SJ58SJ63SJ64SJ65SJ66SJ67SJ68SJ69SJ74SJ75SJ76SJ77SJ78SJ79SJ85SJ86SJ87SJ88SJ89SJ96SJ97SJ98SJ99SK06SK07SK08SK09SK19SD20SD21SD22SD30SD31SD32SD40SD41SD42SD50SD51SD52SD53SD60SD61SD62SD63SD70SD71SD72SD73SD74SD80SD81SD82SD83SD84SD90SD91SD92SD93SD94SJ29SJ38SJ39SJ48SJ49SJ58SJ59SJ68SJ69SJ79SJ88SJ89SJ99SD22SD23SD32SD33SD34SD35SD36SD42SD43SD44SD45SD46SD47SD52SD53SD54SD55SD56SD57SD63SD64SD65SD66SD67SD68SD73SD78SE53SE54SE62SE63SE64SE65SE72SE73SE74SE75SE76SE82SE83SE84SE85SE86SE87SE92SE93SE94SE95SE96SE97SE98TA02TA03TA04TA05TA06TA07TA08TA12TA13TA14TA15TA16TA17TA18TA21TA22TA23TA24TA26TA27TA31TA32TA33TA41TA42NZ30NZ31NZ40NZ41NZ42NZ50NZ51NZ52NZ60NZ61NZ62NZ70NZ71NZ72NZ80NZ81NZ90NZ91SE37SE38SE39SE46SE47SE48SE49SE55SE56SE57SE58SE59SE64SE65SE66SE67SE68SE69SE75SE76SE77SE78SE79SE86SE87SE88SE89SE97SE98SE99TA08TA09TA18SD84SD90SD91SD92SD93SD94SD95SE00SE01SE02SE03SE04SE10SE11SE12SE13SE14SE20SE21SE22SE23SE30SE31SE32SE33SE40SE41SE42SE50SE51SE52SE60SE61SE62SE70SE71SE72SE81SE82SK18SK19SK28SK29SK38SK39SK47SK48SK49SK57SK58SK59SK69SD54SD55SD64SD65SD66SD67SD68SD73SD74SD75SD76SD77SD78SD84SD85SD86SD87SD88SD94SD95SD96SD97SD98SE04SE05SE06SE07SE13SE14SE15SE16SE17SE23SE24SE25SE26SE27SE32SE33SE34SE35SE36SE37SE42SE43SE44SE45SE46SE52SE53SE54SE55SE56SE62SE63SE64SE65SE72NY72NY80NY81NY82NY90NY91NY92NZ00NZ01NZ02NZ10NZ11NZ20NZ21NZ30NZ31SD68SD69SD78SD79SD88SD89SD97SD98SD99SE07SE08SE09SE17SE18SE19SE27SE28SE29SE36SE37SE38SE39SE46SE47NY73NY74NY82NY83NY84NY92NY93NY94NY95NZ01NZ02NZ03NZ04NZ05NZ11NZ12NZ13NZ14NZ15NZ16NZ20NZ21NZ22NZ23NZ24NZ25NZ26NZ30NZ31NZ32NZ33NZ34NZ35NZ36NZ41NZ42NZ43NZ44NZ45NZ46NZ52NZ53NT60NT70NT80NT90NU00NU10NU20NY58NY59NY64NY65NY66NY67NY68NY69NY74NY75NY76NY77NY78NY79NY84NY85NY86NY87NY88NY89NY94NY95NY96NY97NY98NY99NZ04NZ05NZ06NZ07NZ08NZ09NZ15NZ16NZ17NZ18NZ19NZ26NZ27NZ28NZ29NZ36NZ37NZ38NZ39NT70NT71NT73NT80NT81NT82NT83NT84NT90NT91NT92NT93NT94NT95NU00NU01NU02NU03NU04NU05NU10NU11NU12NU13NU14NU20NU21NU22NU23NZ09NZ19NY20NY21NY30NY31NY40NY41NY42NY50NY51NY52NY53NY60NY61NY62NY63NY70NY71NY72NY73NY80NY81NY82NY83SD16SD17SD18SD19SD26SD27SD28SD29SD36SD37SD38SD39SD46SD47SD48SD49SD57SD58SD59SD67SD68SD69SD78SD79SD89NX90NX91NX92NX93NY00NY01NY02NY03NY04NY05NY10NY11NY12NY13NY14NY15NY16NY20NY21NY22NY23NY24NY25NY26NY31NY32NY33NY34NY35NY36NY37NY41NY42NY43NY44NY45NY46NY47NY48NY52NY53NY54NY55NY56NY57NY58NY62NY63NY64NY65NY66NY67NY68NY73NY74NY75NY84SD08SD09SD17SD18SD19SD28SD29NX30NX40SC16SC17SC26SC27SC28SC36SC37SC38SC39SC47SC48SC49NS60NS61NS70NS71NS72NS80NS81NS90NT00NT01NT10NT11NT20NT21NT30NX69NX78NX79NX88NX89NX96NX97NX98NX99NY05NY06NY07NY08NY09NY16NY17NY18NY19NY26NY27NY28NY29NY36NY37NY38NY39NY47NY48NY49NS50NS60NX36NX37NX38NX45NX46NX47NX48NX49NX54NX55NX56NX57NX58NX59NX64NX65NX66NX67NX68NX69NX74NX75NX76NX77NX78NX79NX84NX85NX86NX87NX88NX95NX96NX97NX98NY05NY06NW95NW96NW97NX03NX04NX05NX06NX07NX13NX14NX15NX16NX17NX24NX25NX26NX27NX33NX34NX35NX36NX37NX43NX44NX45NX46NS00NS10NS14NS15NS16NS20NS21NS23NS24NS25NS26NS30NS31NS32NS33NS34NS35NS36NS40NS41NS42NS43NS44NS45NS50NS51NS52NS53NS54NS55NS60NS61NS62NS63NS64NS71NS72NS73NX07NX08NX09NX17NX18NX19NX27NX28NX29NX37NX38NX39NX48NX49NX59NS16NS17NS26NS27NS35NS36NS37NS44NS45NS46NS47NS54NS55NS56NS64NS65NS66NS53NS54NS55NS56NS57NS63NS64NS65NS66NS67NS71NS72NS73NS74NS75NS76NS77NS80NS81NS82NS83NS84NS85NS86NS87NS90NS91NS92NS93NS94NS95NS96NT00NT01NT02NT03NT04NT05NT14NT01NT02NT03NT04NT05NT11NT12NT13NT14NT15NT21NT22NT23NT24NT25NT32NT33NT34NT10NT11NT20NT21NT22NT23NT30NT31NT32NT33NT34NT41NT42NT43NT44NT53NT20NT30NT31NT40NT41NT42NT43NT44NT50NT51NT52NT53NT54NT60NT61NT62NT63NT64NT70NT71NT72NT73NT74NT81NT82NT83NY39NY47NY48NY49NY58NY59NY69NT44NT45NT46NT53NT54NT55NT56NT63NT64NT65NT66NT73NT74NT75NT76NT77NT83NT84NT85NT86NT87NT94NT95NT96NT36NT37NT45NT46NT47NT48NT55NT56NT57NT58NT65NT66NT67NT68NT76NT77NS95NS96NT05NT06NT15NT16NT17NT24NT25NT26NT27NT34NT35NT36NT37NT43NT44NT45NT46NS86NS87NS95NS96NS97NS98NT06NT07NT08NT16NT17NO00NO01NO10NO11NO20NO21NO22NO30NO31NO32NO40NO41NO42NO50NO51NO52NO60NO61NS99NT08NT09NT18NT19NT28NT29NT39NT49NT59NT69NN30NN31NN40NN41NS38NS39NS47NS48NS49NS57NS58NS59NS67NS68NS69NS77NS78NS79NS86NS87NS88NS89NS97NS98NN21NN22NN30NN31NN32NN40NN41NN42NN50NN51NN52NN60NN61NN70NN71NN80NN81NN90NN91NO00NS49NS59NS69NS79NS88NS89NS98NS99NT08NT09NN22NN23NN32NN33NN34NN35NN42NN43NN44NN45NN46NN47NN51NN52NN53NN54NN55NN56NN57NN61NN62NN63NN64NN65NN66NN67NN71NN72NN73NN74NN75NN76NN77NN81NN82NN83NN84NN85NN86NN90NN91NN92NN93NN94NN95NN96NO00NO01NO02NO03NO04NO11NO12NO13NO21NN56NN57NN66NN67NN68NN76NN77NN78NN86NN87NN88NN94NN95NN96NN97NN98NO02NO03NO04NO05NO06NO07NO08NO11NO12NO13NO14NO15NO16NO17NO21NO22NO23NO24NO25NO32NO33NO34NO15NO16NO17NO23NO24NO25NO26NO27NO28NO32NO33NO34NO35NO36NO37NO38NO42NO43NO44NO45NO46NO47NO48NO53NO54NO55NO56NO57NO58NO63NO64NO65NO66NO67NO74NO75NO76NJ60NJ70NJ80NJ90NO57NO58NO66NO67NO68NO69NO76NO77NO78NO79NO86NO87NO88NO89NO99NH90NJ00NJ10NJ11NJ20NJ21NJ30NJ31NJ32NJ40NJ41NJ42NJ50NJ51NJ52NJ60NJ61NJ62NJ70NJ71NJ72NJ80NJ81NJ82NJ90NJ91NJ92NK02NN98NN99NO07NO08NO09NO17NO18NO19NO27NO28NO29NO37NO38NO39NO48NO49NO58NO59NO68NO69NO79NO89NJ31NJ32NJ33NJ34NJ42NJ43NJ44NJ52NJ53NJ54NJ55NJ62NJ63NJ64NJ65NJ72NJ73NJ74NJ75NJ76NJ82NJ83NJ84NJ85NJ86NJ92NJ93NJ94NJ95NJ96NK02NK03NK04NK05NK06NK13NK14NK15NH90NJ00NJ01NJ10NJ11NJ12NJ13NJ14NJ21NJ22NJ23NJ24NJ25NJ32NJ33NJ34NJ35NJ36NJ42NJ43NJ44NJ45NJ46NJ54NJ55NJ56NJ64NJ65NJ66NJ74NJ75NJ76NJ86NN99NH72NH81NH82NH91NH92NH93NH94NH95NH96NJ00NJ01NJ02NJ03NJ04NJ05NJ06NJ11NJ12NJ13NJ14NJ15NJ16NJ17NJ23NJ24NJ25NJ26NJ27NJ34NJ35NJ36NJ45NH01NH02NH10NH11NH12NH13NH14NH20NH21NH22NH23NH24NH30NH31NH32NH33NH34NH40NH41NH42NH43NH44NH50NH51NH52NH53NH54NH60NH61NH62NH63NH64NH70NH71NH72NH73NH74NH75NH80NH81NH82NH83NH84NH85NH90NH91NH92NH93NH94NH95NH96NJ00NJ01NN39NN46NN47NN48NN49NN56NN57NN58NN59NN67NN68NN69NN77NN78NN79NN88NN89NN98NN99NG60NG70NG71NG72NG80NG81NG82NG90NG91NH00NH01NH10NH20NH30NM46NM47NM54NM55NM56NM57NM64NM65NM66NM67NM68NM69NM74NM75NM76NM77NM78NM79NM84NM85NM86NM87NM88NM89NM95NM96NM97NM98NM99NN05NN06NN07NN08NN09NN16NN17NN18NN19NN26NN27NN28NN29NN35NN36NN37NN38NN39NN46NN47NN48NN49NN57NN58NN59NM70NM71NM72NM73NM80NM81NM82NM83NM84NM90NM91NM92NM93NM94NM95NN00NN01NN02NN03NN04NN05NN10NN11NN12NN13NN14NN15NN16NN20NN21NN22NN23NN24NN25NN26NN30NN33NN34NN35NN36NN44NN45NN46NR79NR88NR89NR96NR97NR98NR99NS06NS07NS08NS09NS16NS17NS18NS19NS28NS29NN20NN21NN30NN31NS28NS29NS37NS38NS39NS46NS47NS48NS56NS57NR82NR83NR84NR92NR93NR94NR95NR96NR97NS01NS02NS03NS04NS05NS06NS07NS15NS16NR50NR51NR60NR61NR62NR63NR64NR65NR67NR68NR70NR71NR72NR73NR74NR75NR76NR77NR78NR79NR83NR84NR85NR86NR87NR88NR89NR95NR96NM40NM60NM61NM70NM71NR15NR16NR24NR25NR26NR27NR34NR35NR36NR37NR38NR39NR44NR45NR46NR47NR48NR49NR56NR57NR58NR59NR67NR68NR69NR79NL93NL94NM04NM05NM15NM16NM21NM22NM23NM24NM25NM26NM31NM32NM33NM34NM35NM41NM42NM43NM44NM45NM51NM52NM53NM54NM55NM61NM62NM63NM64NM72NM73NG13NG14NG15NG20NG23NG24NG25NG26NG30NG31NG32NG33NG34NG35NG36NG37NG38NG40NG41NG42NG43NG44NG45NG46NG47NG50NG51NG52NG53NG54NG55NG56NG60NG61NG62NG63NG64NG65NG66NG71NG72NG82NM19NM29NM37NM38NM39NM47NM48NM49NM59NB90NB91NC00NC01NC10NC11NC20NC21NG63NG64NG65NG72NG73NG74NG75NG76NG77NG78NG79NG82NG83NG84NG85NG86NG87NG88NG89NG91NG92NG93NG94NG95NG96NG97NG98NG99NH00NH01NH02NH03NH04NH05NH06NH07NH08NH09NH10NH11NH15NH16NH17NH18NH19NH27NH28NH29NC10NC20NC21NC30NC31NC40NH02NH03NH04NH05NH06NH07NH12NH13NH14NH15NH16NH17NH19NH23NH24NH25NH26NH27NH28NH29NH34NH35NH36NH37NH38NH39NH44NH45NH46NH47NH48NH49NH54NH55NH56NH57NH58NH59NH64NH65NH66NH67NH68NH69NH75NH76NH77NH78NH86NH87NH88NH97NH98NC22NC30NC31NC32NC33NC40NC41NC42NC43NC50NC51NC52NC60NC61NC62NC63NC70NC71NC72NC73NC74NC80NC81NC82NC83NC84NC90NC91NC92NC93ND01ND02NH49NH59NH68NH69NH78NH79NH88NH89NC01NC02NC03NC10NC11NC12NC13NC14NC15NC16NC20NC21NC22NC23NC24NC25NC26NC27NC31NC32NC33NC34NC35NC36NC37NC42NC43NC44NC45NC46NC52NC53NC54NC55NC56NC62NC63NC64NC65NC66NC73NC74NC75NC76NC83NC84NC85NC86NC93NC94NC95NC96NC92NC93NC94NC95NC96ND01ND02ND03ND04ND05ND06ND07ND12ND13ND14ND15ND16ND17ND23ND24ND25ND26ND27ND33ND34ND35ND36ND37ND47HW63HW83HX62NA00NA10NA64NA74NA81NA90NA91NA92NA93NB00NB01NB02NB03NB10NB11NB12NB13NB14NB20NB21NB22NB23NB24NB30NB31NB32NB33NB34NB35NB40NB41NB42NB43NB44NB45NB46NB52NB53NB54NB55NB56NF09NF19NF56NF58NF60NF61NF66NF67NF68NF70NF71NF72NF73NF74NF75NF76NF77NF80NF81NF82NF83NF84NF85NF86NF87NF88NF89NF95NF96NF97NF98NF99NG07NG08NG09NG18NG19NG29NG49NL57NL58NL68NL69NL79HY10HY20HY21HY22HY23HY30HY31HY32HY33HY34HY35HY40HY41HY42HY43HY44HY45HY50HY51HY52HY53HY54HY55HY60HY61HY62HY63HY64HY73HY74HY75ND19ND28ND29ND38ND39ND47ND48ND49ND59HP40HP50HP51HP60HP61HT93HT94HU14HU15HU16HU24HU25HU26HU27HU28HU30HU31HU32HU33HU34HU35HU36HU37HU38HU39HU40HU41HU42HU43HU44HU45HU46HU47HU48HU49HU53HU54HU55HU56HU57HU58HU59HU66HU67HU68HU69HZ16HZ17HZ26HZ27';

	/**
	 *
	 * @param {number} precision metres
	 * @returns {string}
	 */
	to_gridref(precision) {
		const hundredkmE = this.x / 100000 | 0; // Math.floor(this.x / 100000);
		const hundredkmN = this.y / 100000 | 0; // Math.floor(this.y / 100000);
		let firstLetter;
		if (hundredkmN < 5) {
			firstLetter = (hundredkmE < 5) ? 'S' : 'T';
		} else if (hundredkmN < 10) {
			firstLetter = (hundredkmE < 5) ? 'N' : 'O';
		} else {
			firstLetter = (hundredkmE < 5) ? 'H' : 'J';
		}


		let index = 65 + ((4 - (hundredkmN % 5)) * 5) + (hundredkmE % 5);

		if (index >= 73) {
			index++;
		}

		const secondLetter = String.fromCharCode(index);

		return _e_n_to_gr(
			firstLetter + secondLetter,
			(this.x - (100000 * hundredkmE)),
			(this.y - (100000 * hundredkmN)),
			precision ? precision : 1
		);
	};

	/**
	 *
	 * @return {string} hectad
	 */
	to_hectad() {
		const hundredkmE = this.x / 100000 | 0; // Math.floor(easting / 100000);
		const hundredkmN = this.y / 100000 | 0; // Math.floor(northing / 100000);
		let firstLetter;
		if (hundredkmN < 5) {
			firstLetter = (hundredkmE < 5) ? 'S' : 'T';
		} else if (hundredkmN < 10) {
			firstLetter = (hundredkmE < 5) ? 'N' : 'O';
		} else {
			firstLetter = (hundredkmE < 5) ? 'H' : 'J';
		}

		let index = 65 + ((4 - (hundredkmN % 5)) * 5) + (hundredkmE % 5);

		if (index >= 73) {
			index++;
		}

		return firstLetter +
			String.fromCharCode(index) + // secondLetter
			(((this.x - (100000 * hundredkmE)) / 10000) | 0) +
			(((this.y - (100000 * hundredkmN)) / 10000) | 0);
	};

	/**
	 *
	 * @returns {boolean}
	 */
	is_gb_hectad() {
		return GridCoordsGB.gbHectads.indexOf(this.to_hectad()) !== -1;
	};

	/**
	 * convert easting,northing to a WGS84 lat lng
	 *
	 * @returns {LatLngWGS84}
	 */
	to_latLng() {
		//airy1830 = RefEll::airy1830(); //new RefEll(6377563.396, 6356256.909);
		//var OSGB_F0  = 0.9996012717;
		//var N0       = -100000.0;
		const E0 = 400000.0;
		const phi0 = 0.85521133347722; //deg2rad(49.0);
		const lambda0 = -0.034906585039887; //deg2rad(-2.0);
		const a = 6377563.396; // airy1830->maj;
		//var b        = 6356256.909; // airy1830->min;
		const eSquared = 0.00667054007; // ((maj * maj) - (min * min)) / (maj * maj); // airy1830->ecc;
		//var phi      = 0.0;
		//var lambda   = 0.0;
		const E = this.x;
		const N = this.y;
		const n = 0.0016732203289875; //(a - b) / (a + b);
		let M;
		let phiPrime = ((N + 100000) / (a * 0.9996012717)) + phi0;

		// 15 / 8 === 1.875
		// 5 / 4 === 1.25
		// 21 / 8 === 2.625

		do {
			M = N + 100000 - (
				6353722.489 // (b * OSGB_F0)
				* ((1.0016767257674 // * (((1 + n + (1.25 * n * n) + (1.25 * n * n * n))
						* (phiPrime - phi0))
					- (0.00502807228247412 // - (((3 * n) + (3 * n * n) + (2.625 * n * n * n))
						* Math.sin(phiPrime - phi0)
						* Math.cos(phiPrime + phi0))
					+ (((1.875 * n * n) + (1.875 * n * n * n))
						* Math.sin(2.0 * (phiPrime - phi0))
						* Math.cos(2.0 * (phiPrime + phi0)))
					- (((35.0 / 24.0) * n * n * n)
						* Math.sin(3.0 * (phiPrime - phi0))
						* Math.cos(3.0 * (phiPrime + phi0)))));

			phiPrime += M / 6375020.48098897; // (N - N0 - M) / (a * OSGB_F0);
		} while (M >= 0.001);

		const sinphiPrime2 = Math.sin(phiPrime) * Math.sin(phiPrime);
		const tanphiPrime2 = Math.tan(phiPrime) * Math.tan(phiPrime);
		const secphiPrime = 1.0 / Math.cos(phiPrime);

		const v = a * 0.9996012717 * Math.pow(1.0 - eSquared * sinphiPrime2, -0.5);

		const rho =
			a
			* 0.9996012717
			* (1.0 - eSquared)
			* Math.pow(1.0 - eSquared * sinphiPrime2, -1.5);
		const etaSquared = (v / rho) - 1.0;
		const VII = Math.tan(phiPrime) / (2 * rho * v);
		const VIII =
			(Math.tan(phiPrime) / (24.0 * rho * Math.pow(v, 3.0)))
			* (5.0
				+ (3.0 * tanphiPrime2)
				+ etaSquared
				- (9.0 * tanphiPrime2 * etaSquared));
		const IX =
			(Math.tan(phiPrime) / (720.0 * rho * Math.pow(v, 5.0)))
			* (61.0
				+ (90.0 * tanphiPrime2)
				+ (45.0 * tanphiPrime2 * tanphiPrime2));
		const X = secphiPrime / v;
		const XI =
			(secphiPrime / (6.0 * v * v * v))
			* ((v / rho) + (2 * tanphiPrime2));
		const XII =
			(secphiPrime / (120.0 * Math.pow(v, 5.0)))
			* (5.0
				+ (28.0 * tanphiPrime2)
				+ (24.0 * tanphiPrime2 * tanphiPrime2));
		const XIIA =
			(secphiPrime / (5040.0 * Math.pow(v, 7.0)))
			* (61.0
				+ (662.0 * tanphiPrime2)
				+ (1320.0 * tanphiPrime2 * tanphiPrime2)
				+ (720.0
					* tanphiPrime2
					* tanphiPrime2
					* tanphiPrime2));
		const phi =
			phiPrime
			- (VII * Math.pow(E - E0, 2.0))
			+ (VIII * Math.pow(E - E0, 4.0))
			- (IX * Math.pow(E - E0, 6.0));
		const lambda =
			lambda0
			+ (X * (E - E0))
			- (XI * Math.pow(E - E0, 3.0))
			+ (XII * Math.pow(E - E0, 5.0))
			- (XIIA * Math.pow(E - E0, 7.0));

		return (new LatLngGB(rad2deg * phi, rad2deg * lambda)).to_WGS84();
	}
}

class GridCoordsIE extends GridCoords {
	/**
	 *
	 * @type {string}
	 */
	country = 'IE';

	/**
	 * @type {GridCoordsIE}
	 */
	gridCoords = null;

	/**
	 *
	 * @param {number} easting metres
	 * @param {number} northing metres
	 * @constructor
	 * @returns {GridCoordsIE}
	 */
	constructor(easting, northing) {
		super();
		this.x = easting;
		this.y = northing;
	}


	static irishGrid = {
		0: ['V', 'Q', 'L', 'F', 'A'],
		1: ['W', 'R', 'M', 'G', 'B'],
		2: ['X', 'S', 'N', 'H', 'C'],
		3: ['Y', 'T', 'O', 'J', 'D']
	};

	/**
	 * convert easting,northing to a WGS84 lat lng
	 *
	 * @returns {LatLngWGS84}
	 */
	to_latLng() {
		//converts OSI coords to lat/long.

		// modified from OSGBtoLL, Equations from USGS Bulletin 1532
		//East Longitudes are positive, West longitudes are negative.
		//North latitudes are positive, South latitudes are negative
		//Lat and Long are in decimal degrees.
		//Written by Chuck Gantz- chuck.gantz@globalstar.com

		// php transliteration by TH

		//OSIENorthing = this.y;
		//OSIEEasting = this.x;

		//constants
		//PI = 3.14159265;
		//FOURTHPI = M_PI / 4.0;
		//DEG2RAD = M_PI / 180.0;
		//RAD2DEG = 180.0 / M_PI;
		// ////////////////

		const k0 = 1.000035; // scale factor
		//double a;
		//double eccPrimeSquared;
		//double N1, T1, C1, R1, D, M;
		const LongOrigin = -8.0;
		//LatOrigin = 53.5;
		//LatOriginRad = LatOrigin * DEG2RAD;

		//UK
		//majoraxis=6377563.396; //Airy
		//a=6377563.396;
		//minoraxis = 6356256.91; //Airy

		//IE
		//majoraxis = 6377340.189; //Airy
		const a = 6377340.189;
		//minoraxis = 6356034.447; //Airy

		//eccSquared = (majoraxis * majoraxis - minoraxis * minoraxis) / (majoraxis * majoraxis);
		const eccSquared = 0.0066705402933363;

		//e1 = (1-Math.sqrt(1-eccSquared))/(1+Math.sqrt(1-eccSquared));
		const e1 = 0.0016732203841521;
		//error_log("eccSquared={eccSquared} e1={e1}");

		//only calculate M0 once since it is based on the origin of the OSGB projection, which is fixed
		//M0 = a*((1	- eccSquared/4		- 3*eccSquared*eccSquared/64	- 5*eccSquared*eccSquared*eccSquared/256)*LatOriginRad
		//	- (3*eccSquared/8	+ 3*eccSquared*eccSquared/32	+ 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(2*LatOriginRad)
		//	+ (15*eccSquared*eccSquared/256 + 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(4*LatOriginRad)
		//	- (35*eccSquared*eccSquared*eccSquared/3072)*Math.sin(6*LatOriginRad));
		//error_log("M0 = {M0}");
		const M0 = 5929615.3530033;

		//OSGBSquareToRefCoords(OSGBZone, RefEasting, RefNorthing); // Assume supplied MapInfo northing and easting take this into account
		const x = this.x - 200000.0; //remove 400,000 meter false easting for longitude
		const y = this.y - 250000.0; //remove 100,000 meter false easting for longitude

		//eccPrimeSquared = (eccSquared)/(1.0-eccSquared);
		const eccPrimeSquared = 0.0067153352074207;
		//error_log("eccPrimeSquared={eccPrimeSquared}");

		const M = M0 + y / k0;
		const mu = M / (a * (1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256));

		const phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu)
			+ (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu)
			+ (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
		//phi1 = phi1Rad*RAD2DEG;

		const N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
		const T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
		const C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
		const R1 = a * (1 - eccSquared) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
		const D = x / (N1 * k0);

		let Lat = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D / 24
			+ (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D / 720);
		Lat = Lat * rad2deg;

		let Long = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1)
			* D * D * D * D * D / 120) / Math.cos(phi1Rad);

		Long = LongOrigin + Long * rad2deg;

		//return new LatLng(Lat, Long);

		//var ll = new LatLngIE(Lat, Long); // Irish projection (modified Airy)
		//ll.IE_to_WGS84(); // google earth uses WGS84

		//return ll;

		return (new LatLngIE(Lat, Long)).to_WGS84();
	}

	/**
	 *
	 * @param {number} precision metres
	 * @returns {String}
	 */
	to_gridref(precision) {
		const hundredkmE = (this.x / 100000) | 0,
			hundredkmN = (this.y / 100000) | 0;
		if (GridCoordsIE.irishGrid[hundredkmE] && GridCoordsIE.irishGrid[hundredkmE][hundredkmN]) {

			return _e_n_to_gr(GridCoordsIE.irishGrid[hundredkmE][hundredkmN],
				(this.x - (100000 * hundredkmE)),
				(this.y - (100000 * hundredkmN)),
				precision ? precision : 1
			);
		} else {
			return null;
		}
	}

	/**
	 *
	 * @return {?string} hectad
	 */
	to_hectad() {
		const hundredkmE = (this.x / 100000) | 0,
			hundredkmN = (this.y / 100000) | 0;

		if (GridCoordsIE.irishGrid[hundredkmE] && GridCoordsIE.irishGrid[hundredkmE][hundredkmN]) {
			return (GridCoordsIE.irishGrid[hundredkmE][hundredkmN]) + Math.floor((this.x % 100000) / 10000) + Math.floor((this.y % 100000) / 10000);
		} else {
			return null;
		}
	}
}

class GridCoordsCI extends GridCoords {
	/**
	 *
	 * @type {string}
	 */
	country = 'CI';

	/**
	 *
	 * @param {number} easting metres
	 * @param {number} northing metres
	 * @constructor
	 * @returns {GridCoordsCI}
	 */
	constructor(easting, northing) {
		super();

		this.x = easting;
		this.y = northing;
	}

	/**
	 * convert easting,northing to a WGS84 lat lng
	 *
	 * @returns {LatLngWGS84}
	 */
	to_latLng() {
		//nX = north;
		//ex = east;

		const a = 6378388.000;       // INT24 ED50 semi-major
		const b = 6356911.946;       // INT24 ED50 semi-minor
		const e0 = 500000;           // easting of false origin
		const n0 = 0;                // northing of false origin
		const f0 = 0.9996;           // INT24 ED50 scale factor on central meridian
		const e2 = 0.0067226700223333;  // INT24 ED50 eccentricity squared
		const lam0 = -0.0523598775598;  // INT24 ED50 false east
		const phi0 = 0; //0 * deg2rad;    // INT24 ED50 false north

		const af0 = a * f0;
		const bf0 = b * f0;
		const n = (af0 - bf0) / (af0 + bf0);
		const Et = this.x - e0;
		const phid = _initial_lat(this.y, n0, af0, phi0, n, bf0);
		const nu = af0 / (Math.sqrt(1 - (e2 * (Math.sin(phid) * Math.sin(phid)))));
		const rho = (nu * (1 - e2)) / (1 - (e2 * (Math.sin(phid)) * (Math.sin(phid))));
		const eta2 = (nu / rho) - 1;
		const tlat2 = Math.tan(phid) * Math.tan(phid);
		const tlat4 = Math.pow(Math.tan(phid), 4);
		const tlat6 = Math.pow(Math.tan(phid), 6);
		const clatm1 = Math.pow(Math.cos(phid), -1);
		const VII = Math.tan(phid) / (2 * rho * nu);
		const VIII = (Math.tan(phid) / (24 * rho * (nu * nu * nu))) * (5 + (3 * tlat2) + eta2 - (9 * eta2 * tlat2));
		const IX = ((Math.tan(phid)) / (720 * rho * Math.pow(nu, 5))) * (61 + (90 * tlat2) + (45 * tlat4));
		const phip = (phid - ((Et * Et) * VII) + (Math.pow(Et, 4) * VIII) - (Math.pow(Et, 6) * IX));
		const X = Math.pow(Math.cos(phid), -1) / nu;
		const XI = (clatm1 / (6 * (nu * nu * nu))) * ((nu / rho) + (2 * (tlat2)));
		const XII = (clatm1 / (120 * Math.pow(nu, 5))) * (5 + (28 * tlat2) + (24 * tlat4));
		const XIIA = clatm1 / (5040 * Math.pow(nu, 7)) * (61 + (662 * tlat2) + (1320 * tlat4) + (720 * tlat6));
		const lambdap = (lam0 + (Et * X) - ((Et * Et * Et) * XI) + (Math.pow(Et, 5) * XII) - (Math.pow(Et, 7) * XIIA));

		// var WGS84_AXIS = 6378137;
		// var WGS84_ECCENTRIC = 0.00669438037928458;
		//
		// var INT24_AXIS = 6378388.000;
		// var INT24_ECCENTRIC = 0.0067226700223333;
		// var height = 10;  // dummy height
		// //var latLngRadians = LatLng._transform(phip, lambdap, INT24_AXIS, INT24_ECCENTRIC, height, WGS84_AXIS, WGS84_ECCENTRIC, -83.901, -98.127, -118.635, 0, 0, 0, 0);

		const latLngRadians = convert_to_wgs(phip, lambdap);
		return new LatLngWGS84(latLngRadians.lat * rad2deg, latLngRadians.lng * rad2deg);

		//return (new LatLngCI(rad2deg * phip, rad2deg * lambdap)).to_WGS84()
	}

	/**
	 *
	 * @param {number} precision metres
	 * @returns {?string}
	 */
	to_gridref(precision) {
		if (this.y >= 5500000) {
			return _e_n_to_gr('WA', this.x - 500000, this.y - 5500000, precision ? precision : 1);
		} else if (this.y < 5500000) {
			return _e_n_to_gr('WV', this.x - 500000, this.y - 5400000, precision ? precision : 1);
		}
		return null;
	}

	/**
	 *
	 * @returns {?string}
	 */
	to_hectad() {
		if (this.y > 5500000) {
			return 'WA' + this.x.toString().substring(1, 2) + this.y.toString().substring(2, 3);
		} else if (this.y < 5500000) {
			return 'WV' + this.x.toString().substring(1, 2) + this.y.toString().substring(2, 3);
		}
		return null;
	}
}

const convert_to_wgs = function (phip, lambdap) {
	const WGS84_AXIS = 6378137;
	const WGS84_ECCENTRIC = 0.00669438037928458;
	//OSGB_AXIS = 6377563.396;
	//OSGB_ECCENTRIC = 0.0066705397616;
	//IRISH_AXIS = 6377340.189;
	//IRISH_ECCENTRIC = 0.00667054015;
	const INT24_AXIS = 6378388.000;
	const INT24_ECCENTRIC = 0.0067226700223333;
	const height = 10;  // dummy height
	return LatLng._transform(phip, lambdap, INT24_AXIS, INT24_ECCENTRIC, height, WGS84_AXIS, WGS84_ECCENTRIC, -83.901, -98.127, -118.635, 0, 0, 0, 0);
};

const _initial_lat = function (north, n0, af0, phi0, n, bf0) {
	let phi1 = ((north - n0) / af0) + phi0;
	let M = LatLng._Marc(bf0, n, phi0, phi1);
	let phi2 = ((north - n0 - M) / af0) + phi1;
	let ind = 0;
	while ((Math.abs(north - n0 - M) > 0.00001) && (ind < 20))  // max 20 iterations in case of error
	{
		ind += 1;
		phi2 = ((north - n0 - M) / af0) + phi1;
		M = LatLng._Marc(bf0, n, phi0, phi2);
		phi1 = phi2;
	}
	return phi2;
};

/**
 * x,y offsets (in metres) for tetrad letter codes
 * @type {Object.<string,Array.<number>>}
 */

 const TETRAD_OFFSETS = {
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
const QUADRANT_OFFSETS = {
	NW: [0, 5000],
	NE: [5000, 5000],
	SW: [0, 0],
	SE: [5000, 0]
};

class GridRef {

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

				let o = TETRAD_LETTERS.indexOf(gridRefString.substring(gridRefString.length - 1));
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

class GridRefCI extends GridRef {
	/**
	 *
	 * @type {string}
	 */
	country = 'CI';

	/**
	 *
	 * @type {typeof GridCoordsCI}
	 */
	GridCoords = GridCoordsCI;

	/**
	 * @type {GridCoordsCI}
	 */
	gridCoords = null;

	/**
	 * @constructor
	 */
	constructor() {
		super();

		this.parse_well_formed = this.fromString;
	};

	/**
	 *
	 * @param {string} rawGridRef
	 * @throws Error
	 */
	fromString(rawGridRef) {
		let trimmedLocality = rawGridRef.replace(/[\[\]\s\t.\/-]+/gu, '').toUpperCase();
		let tetradCode = '';
		let enl;

		if (/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(trimmedLocality)) {
			// tetrad or quadrant

			if (QUADRANT_OFFSETS.hasOwnProperty(trimmedLocality.substring(trimmedLocality.length - 2))) {
				this.quadrantCode = trimmedLocality.substring(trimmedLocality.length - 2);
				trimmedLocality = trimmedLocality.substring(0, trimmedLocality.length - 2);
			} else {
				tetradCode = trimmedLocality.charAt(trimmedLocality.length - 1);
				trimmedLocality = trimmedLocality.substring(0, trimmedLocality.length - 1);
			}
		}

		if (/^(W[AV](?:\d\d){1,5})$/.test(trimmedLocality)) {
			if ((enl = GridRefCI.gridref_string_to_e_n_l(trimmedLocality))) {
				this.length = enl.length;

				this.gridCoords = new GridCoordsCI(enl.e, enl.n);
				this.hectad = this.gridCoords.to_gridref(10000);

				if (this.length === 10000 && (tetradCode || this.quadrantCode)) {
					if (tetradCode) {
						this.preciseGridRef = trimmedLocality + tetradCode;
						this.tetrad = this.hectad + tetradCode;
						this.tetradLetter = tetradCode;
						this.length = 2000; // 2km square
						this.gridCoords.x += TETRAD_OFFSETS[tetradCode][0];
						this.gridCoords.y += TETRAD_OFFSETS[tetradCode][1];
					} else {
						// quadrant
						this.preciseGridRef = trimmedLocality + this.quadrantCode;
						this.tetradLetter = '';
						this.tetrad = '';
						this.quadrant = this.preciseGridRef;
						this.length = 5000; // 5km square
						this.gridCoords.x += QUADRANT_OFFSETS[this.quadrantCode][0];
						this.gridCoords.y += QUADRANT_OFFSETS[this.quadrantCode][1];
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
				this.errorMessage = 'Grid reference format not understood (odd length).';
			}
		} else {
			// no match
			this.error = true;
			this.errorMessage = "Channel Island grid reference format not understood. ('" + rawGridRef + "')";
		}
	}


	/**
	 *
	 *
	 * @param {string} gridRef plain string without tetrad or quadrant suffix
	 * @return {(boolean|{e : number, n : number, length : number})}
	 * returns false on error or object {'e' : easting, 'n' : northing, 'length' : length}
	 */
	static gridref_string_to_e_n_l(gridRef) {
		let northOffset, x, y, length;

		// assume modern alphabetical sheet ref
		let chars = gridRef.substring(0, 2);

		if (chars === 'WA') {
			northOffset = 5500000;
		} else if (chars === 'WV') {
			northOffset = 5400000;
		} else {
			console.log("Bad Channel Island grid letters: '" + chars + "'");
			return false;
		}

		let ref = gridRef.substring(2);
		switch (ref.length) {
			case 2:
				x = ref.charAt(0) * 10000;
				y = ref.charAt(1) * 10000;
				length = 10000; //10 km square
				break;

			case 4:
				x = ref.substring(0, 2) * 1000;
				y = ref.substring(2) * 1000;
				length = 1000; //1 km square
				break;

			case 6:
				x = ref.substring(0, 3) * 100;
				y = ref.substring(3) * 100;
				length = 100; //100m square
				break;

			case 8:
				x = ref.substring(0, 4) * 10;
				y = ref.substring(4) * 10;
				length = 10; //10m square
				break;

			case 10:
				x = parseInt(ref.substring(0, 5), 10);
				y = parseInt(ref.substring(5), 10);
				length = 1; //1m square
				break;

			default:
				console.log("Bad length for Channel Island grid ref '" + gridRef + "'");
				return false;
		}

		return {
			e: (x + 500000),
			n: (y + northOffset),
			length: length
		};
	}
}

/**
 * numerical mapping of letters to numbers
 * 'I' is omitted
 *
 * @type {{A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number, J: number, K: number, L: number, M: number, N: number, O: number, P: number, Q: number, R: number, S: number, T: number, U: number, V: number, W: number, X: number, Y: number, Z: number}}
 */
const LETTER_MAPPING = {
	A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, J: 8, K: 9,
	L: 10, M: 11, N: 12, O: 13, P: 14, Q: 15, R: 16, S: 17, T: 18,
	U: 19, V: 20, W: 21, X: 22, Y: 23, Z: 24
};

class GridRefGB extends GridRef {
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

			if (QUADRANT_OFFSETS.hasOwnProperty(rawGridRef.substring(rawGridRef.length - 2))) {
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
				this.gridCoords.x += TETRAD_OFFSETS[this.tetradLetter][0];
				this.gridCoords.y += TETRAD_OFFSETS[this.tetradLetter][1];
			} else {
				// quadrant
				this.preciseGridRef = this.quadrant = rawGridRef + this.quadrantCode;
				this.length = 5000; // 5km square
				this.gridCoords.x += QUADRANT_OFFSETS[this.quadrantCode][0];
				this.gridCoords.y += QUADRANT_OFFSETS[this.quadrantCode][1];
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
		let trimmedLocality = rawGridRef.replace(/[\[\]\s\t.-]+/gu, '').toUpperCase();
		let tetradCode = '';
		let ref;

		if (/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(trimmedLocality)) {
			// tetrad or quadrant

			if (QUADRANT_OFFSETS.hasOwnProperty(trimmedLocality.substring(trimmedLocality.length - 2))) {
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
						this.gridCoords.x += TETRAD_OFFSETS[tetradCode][0];
						this.gridCoords.y += TETRAD_OFFSETS[tetradCode][1];
					} else {
						// quadrant
						this.preciseGridRef = trimmedLocality + this.quadrantCode;
						this.tetradLetter = '';
						this.tetrad = '';
						this.quadrant = this.preciseGridRef;
						this.length = 5000; // 5km square
						this.gridCoords.x += QUADRANT_OFFSETS[this.quadrantCode][0];
						this.gridCoords.y += QUADRANT_OFFSETS[this.quadrantCode][1];
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
						this.gridCoords.x += TETRAD_OFFSETS[tetradCode][0];
						this.gridCoords.y += TETRAD_OFFSETS[tetradCode][1];
					} else if (this.quadrantCode) {
						trimmedLocality += this.quadrantCode;
						this.quadrant = trimmedLocality;
						this.length = 5000; // 5km square
						this.gridCoords.x += QUADRANT_OFFSETS[this.quadrantCode][0];
						this.gridCoords.y += QUADRANT_OFFSETS[this.quadrantCode][1];
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
			if (!LETTER_MAPPING.hasOwnProperty(gridRef.charAt(0)) || !LETTER_MAPPING.hasOwnProperty(gridRef.charAt(1))) {
				// invalid
				this.length = 0;
				this.gridCoords = null;
				return;
			}

			let char1 = LETTER_MAPPING[gridRef.charAt(0)];
			let char2 = LETTER_MAPPING[gridRef.charAt(1)];
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
		char1 = LETTER_MAPPING[gridRef.charAt(0)];
		char2 = LETTER_MAPPING[gridRef.charAt(1)];
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

class GridRefIE extends GridRef {
	/**
	 * @constructor
	 */
	constructor() {
		super();
		this.parse_well_formed = this.fromString;
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
	fromString(rawGridRef) {
		let trimmedLocality = rawGridRef.replace(/[\[\]\s\t.-]+/gu, '').toUpperCase();

		if (/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(trimmedLocality)) {
			// tetrad or quadrant

			if (QUADRANT_OFFSETS.hasOwnProperty(trimmedLocality.substring(trimmedLocality.length - 2))) {
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
					this.gridCoords.x += TETRAD_OFFSETS[this.tetradLetter][0];
					this.gridCoords.y += TETRAD_OFFSETS[this.tetradLetter][1];
				} else {
					// quadrant
					this.preciseGridRef = this.hectad + this.quadrantCode;
					this.quadrant = this.preciseGridRef;
					this.length = 5000; // 5km square
					this.gridCoords.x += QUADRANT_OFFSETS[this.quadrantCode][0];
					this.gridCoords.y += QUADRANT_OFFSETS[this.quadrantCode][1];
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
	 *
	 * @param {?number} significantPrecision default null (precision in metres of centroid diameter)
	 * @return {string}
	 */
	toHtml(significantPrecision = null) {
		let formattedGr;

		if (!significantPrecision || significantPrecision === this.length) {
			if (this.length <= 1000) {
				let halfNumLen = ((this.preciseGridRef.length - 1) / 2) | 0;
				formattedGr = this.preciseGridRef[0] +
					"<span class='sig'>" + this.preciseGridRef.substring(1, 1 + halfNumLen) +
					"</span><span class='sig'>" + this.preciseGridRef.substring(1 + halfNumLen) + "</span>";
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
					let halfNumLen = ((this.preciseGridRef.length - 1) / 2) | 0;

					formattedGr = this.preciseGridRef[0] + "<span class='sig'>" + this.preciseGridRef.substring(1, 1 + columns) + "</span>" +
						"<span class='nonsig'>" + this.preciseGridRef.substring(columns + 1, 1 + halfNumLen) + "</span>" +
						"<span class='sig'>" + this.preciseGridRef.substring(1 + halfNumLen, 1 + halfNumLen + columns) + "</span>" +
						"<span class='nonsig'>" + this.preciseGridRef.substring(1 + halfNumLen + columns) + "</span>"
					;
				}
			}
		}

		return formattedGr;
	}
}

/**
 * returns a GridRef (GB, IE or CI-specific parser) or false
 * crudely tries to determine the country by trying each country in turn
 *
 * @param {string} rawGridRef
 * @returns {(GridRefCI|GridRefGB|GridRefIE|false)}
 */
GridRef.fromString = function (rawGridRef) {
	let parser;
	let cleanRef = rawGridRef.replace(/\s+/gu, '').toUpperCase();

	if (!cleanRef) {
		return false;
	}

	// if canonical ref form then be more efficient
	if (/^(?:[BCDFGHJLMNOQRSTVWXY]|[HJNOST][ABCDEFGHJKLMNOPQRSTUVWXYZ]|W[VA])\d{2}(?:[A-Z]|[NS][EW]|(?:\d{2}){0,4})?$/.test(cleanRef)) {
		// have simple well-formed grid ref

		if (/^.\d/.test(cleanRef)) {
			parser = new GridRefIE();
		} else {
			if (cleanRef.charAt(0) === 'W') {
				parser = new GridRefCI();
			} else {
				parser = new GridRefGB();
			}
		}

		parser.parse_well_formed(cleanRef);

		return (parser.length && !parser.error) ? parser : false;
	} else {
		parser = new GridRefGB();
		parser.fromString(cleanRef);

		if (parser.length && !parser.error) {
			return parser;
		}

		if (cleanRef.charAt(0) === 'W') {
			parser = new GridRefCI();
			parser.fromString(cleanRef);

			if (parser.length && !parser.error) {
				return parser;
			}
		} else {
			parser = new GridRefIE();
			parser.fromString(cleanRef);

			if (parser.length && !parser.error) {
				return parser;
			}
		}
	}
	return false;
};

export { GridCoords, GridCoordsCI, GridCoordsGB, GridCoordsIE, GridRef, GridRefCI, GridRefGB, GridRefIE, LatLngCI, LatLngGB, LatLngIE, LatLngWGS84 };
//# sourceMappingURL=gridrefutils.mjs.map
