import {deg2rad} from '../constants';

export class LatLng {

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
