import { LatLng} from './LatLng';
import { GridCoordsCI } from '../GridCoords/GridCoordsCI';
import { rad2deg, deg2rad } from '../constants';

/**
 * represents lat lng as INT24 (CI grid projection)
 *
 * @constructor
 * @param {number} lat
 * @param {number} lng
 */
export const LatLngCI = function(lat, lng) {
	this.lat = lat;
	this.lng = lng;
};

/**
 * converts lat and lon to CI northings and eastings
 * 
 * @returns GridCoordsCI
 */
LatLngCI.prototype.to_os_coords = function() {
	var phi = this.lat * deg2rad; // convert latitude to radians
	var lam = this.lng * deg2rad; // convert longitude to radians
	var a = 6378388.000;      // OSI semi-major
	var b = 6356911.946;      // OSI semi-minor
	var e0 = 500000;          // OSI easting of false origin
	var n0 = 0;          // OSI northing of false origin
	var f0 = 0.9996;        // OSI scale factor on central meridian
	var e2 = 0.0067226700223333;   // OSI eccentricity squared
	var lam0 = -0.0523598775598;   // OSI false east
	var phi0 = 0;    // OSI false north
	var af0 = a * f0;
	var bf0 = b * f0;

	// easting
	var slat2 = Math.sin(phi) * Math.sin(phi);
	var nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
	var rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
	var eta2 = (nu / rho) - 1;
	var p = lam - lam0;
	var IV = nu * Math.cos(phi);
	var clat3 = Math.pow(Math.cos(phi), 3);
	var tlat2 = Math.tan(phi) * Math.tan(phi);
	var V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
	var clat5 = Math.pow(Math.cos(phi), 5);
	var tlat4 = Math.pow(Math.tan(phi), 4);
	var VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
	var east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);

	// northing
	var n = (af0 - bf0) / (af0 + bf0);
	var M = LatLng._Marc(bf0, n, phi0, phi);
	var I = M + (n0);
	var II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
	var III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
	var IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
	var north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);

		//return {x: Math.round(east), y: Math.round(north)};
	return new GridCoordsCI(Math.round(east), Math.round(north));
};

/**
 * 
 * @param {LatLngWGS84} latLngWGS84
 * @returns {LatLngCI}
 */
LatLngCI.from_wgs84 = function (latLngWGS84) {
	var phip = latLngWGS84.lat * deg2rad;
	var lambdap = latLngWGS84.lng * deg2rad;
	
	var CI_AXIS = 6378388.000;
	var CI_ECCENTRIC = 0.0067226700223333;
	
	var WGS84_AXIS = 6378137;
	var WGS84_ECCENTRIC = 0.00669438037928458;

		
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
	
	var height = 0;
	var latlng =  LatLng._transform(phip, lambdap, WGS84_AXIS, WGS84_ECCENTRIC, height, CI_AXIS, CI_ECCENTRIC, 
		83.901, 98.127, 118.635, 0, 0, 0, 0);
	 
	return new LatLngCI(latlng.lat * rad2deg, latlng.lng * rad2deg);
};
