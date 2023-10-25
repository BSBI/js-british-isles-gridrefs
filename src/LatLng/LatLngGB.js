import {LatLng} from './LatLng';
import {LatLngWGS84} from './LatLngWGS84';
import {deg2rad, rad2deg} from '../constants';

/**
 * represents lat lng as OSGB1936 (Ordnance Survey projection)
 *
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */
export class LatLngGB extends LatLng {

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
