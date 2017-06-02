
/**
 * represents lat lng as Modified Airy (Irish grid projection)
 *
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */
BIGU.IELatLng = function(lat, lng) {
  this.lat = lat;
  this.lng = lng;
};

//converts lat and lon (modified Airy) to OSI northings and eastings
BIGU.IELatLng.prototype.to_os_coords = function() {
  //var deg2rad = Math.PI / 180;
  //var rad2deg = 180.0 / Math.PI;

  var phi = this.lat * deg2rad; // convert latitude to radians
  var lam = this.lng * deg2rad; // convert longitude to radians
  var a = 6377340.189;      // OSI semi-major
  var b = 6356034.447;      // OSI semi-minor
  var e0 = 200000;          // OSI easting of false origin
  var n0 = 250000;          // OSI northing of false origin
  var f0 = 1.000035;        // OSI scale factor on central meridian
  var e2 = 0.00667054015;   // OSI eccentricity squared
  var lam0 = -0.13962634015954636615389526147909;   // OSI false east
  var phi0 = 0.93375114981696632365417456114141;    // OSI false north
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
  var M = BIGU.OSGB36LatLng._Marc(bf0, n, phi0, phi);
  var I = M + (n0);
  var II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
  var III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
  var IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
  var north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);

  //return {x: Math.round(east), y: Math.round(north)};

  /*
   return (east > 0 && north > 0) ?
   new BIGU.OSIRef(Math.round(east), Math.round(north))
   :
   null;
   */
  return new BIGU.OSIRef(Math.round(east), Math.round(north));
};

/**
 * convert Irish projection to WGS84 (for Google Maps)
 * see http://www.dorcus.co.uk/carabus/ll_ngr.html
 */
BIGU.IELatLng.prototype.IE_to_WGS84 = function() {
  var IRISH_AXIS = 6377340.189;
  var IRISH_ECCENTRIC = 0.00667054015;

  var WGS84_AXIS = 6378137;
  var WGS84_ECCENTRIC = 0.00669438037928458;

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

  var latLngRadians = BIGU.LatLng.transform(this.lat * deg2rad, this.lng * deg2rad, IRISH_AXIS, IRISH_ECCENTRIC, 0, WGS84_AXIS, WGS84_ECCENTRIC,
    482.53, -130.596, 564.557, -1.042, -0.214, -0.631, -8.15);

  return new BIGU.WGS84LatLng(latLngRadians.lat * rad2deg, latLngRadians.lng * rad2deg);
};
