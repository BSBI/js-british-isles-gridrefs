import NationalGridCoords from 'NationalGridCoords';

/**
 *
 * @param {number} easting metres
 * @param {number} northing metres
 * @constructor
 * @returns {OSIRef}
 */
let OSIRef = function(easting, northing) {
  this.x = easting;
  this.y = northing;
};

OSIRef.prototype = new NationalGridCoords();
OSIRef.prototype.constructor = OSIRef;
OSIRef.prototype.country = 'IE';

/**
 * convert easting,northing to a WGS84 lat lng
 *
 * @returns {WGS84LatLng}
 */
OSIRef.prototype.to_latLng = function() {
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

  var k0 = 1.000035; // scale factor
  //double a;
  //double eccPrimeSquared;
  //double N1, T1, C1, R1, D, M;
  var LongOrigin = -8.0;
  //LatOrigin = 53.5;
  //LatOriginRad = LatOrigin * DEG2RAD;

  //UK
  //majoraxis=6377563.396; //Airy
  //a=6377563.396;
  //minoraxis = 6356256.91; //Airy

  //IE
  //majoraxis = 6377340.189; //Airy
  var a = 6377340.189;
  //minoraxis = 6356034.447; //Airy

  //eccSquared = (majoraxis * majoraxis - minoraxis * minoraxis) / (majoraxis * majoraxis);
  var eccSquared = 0.0066705402933363;

  //e1 = (1-Math.sqrt(1-eccSquared))/(1+Math.sqrt(1-eccSquared));
  var e1 = 0.0016732203841521;
  //error_log("eccSquared={eccSquared} e1={e1}");

  //only calculate M0 once since it is based on the origin of the OSGB projection, which is fixed
  //M0 = a*((1	- eccSquared/4		- 3*eccSquared*eccSquared/64	- 5*eccSquared*eccSquared*eccSquared/256)*LatOriginRad
  //	- (3*eccSquared/8	+ 3*eccSquared*eccSquared/32	+ 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(2*LatOriginRad)
  //	+ (15*eccSquared*eccSquared/256 + 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(4*LatOriginRad)
  //	- (35*eccSquared*eccSquared*eccSquared/3072)*Math.sin(6*LatOriginRad));
  //error_log("M0 = {M0}");
  var M0 = 5929615.3530033;

  //OSGBSquareToRefCoords(OSGBZone, RefEasting, RefNorthing); // Assume supplied MapInfo northing and easting take this into account
  var x = this.x - 200000.0; //remove 400,000 meter false easting for longitude
  var y = this.y - 250000.0; //remove 100,000 meter false easting for longitude

  //eccPrimeSquared = (eccSquared)/(1.0-eccSquared);
  var eccPrimeSquared = 0.0067153352074207;
  //error_log("eccPrimeSquared={eccPrimeSquared}");

  var M = M0 + y / k0;
  var mu = M/(a*(1-eccSquared/4-3*eccSquared*eccSquared/64-5*eccSquared*eccSquared*eccSquared/256));

  var phi1Rad = mu	+ (3*e1/2-27*e1*e1*e1/32)*Math.sin(2*mu)
    + (21*e1*e1/16-55*e1*e1*e1*e1/32)*Math.sin(4*mu)
    + (151*e1*e1*e1/96)*Math.sin(6*mu);
  //phi1 = phi1Rad*RAD2DEG;

  var N1 = a/Math.sqrt(1-eccSquared*Math.sin(phi1Rad)*Math.sin(phi1Rad));
  var T1 = Math.tan(phi1Rad)*Math.tan(phi1Rad);
  var C1 = eccPrimeSquared*Math.cos(phi1Rad)*Math.cos(phi1Rad);
  var R1 = a*(1-eccSquared)/Math.pow(1-eccSquared*Math.sin(phi1Rad)*Math.sin(phi1Rad), 1.5);
  var D = x/(N1*k0);

  var Lat = phi1Rad - (N1*Math.tan(phi1Rad)/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*eccPrimeSquared)*D*D*D*D/24
    +(61+90*T1+298*C1+45*T1*T1-252*eccPrimeSquared-3*C1*C1)*D*D*D*D*D*D/720);
  Lat = Lat * rad2deg;

  var Long = (D-(1+2*T1+C1)*D*D*D/6+(5-2*C1+28*T1-3*C1*C1+8*eccPrimeSquared+24*T1*T1)
    *D*D*D*D*D/120)/Math.cos(phi1Rad);

  Long = LongOrigin + Long * rad2deg;

  //return new LatLng(Lat, Long);

  //var ll = new IELatLng(Lat, Long); // Irish projection (modified Airy)
  //ll.IE_to_WGS84(); // google earth uses WGS84

  //return ll;

  return (new IELatLng(Lat, Long)).IE_to_WGS84();
};

OSIRef.prototype.to_gridref = function(precision) {
  var hundredkmE = Math.floor(this.x / 100000),
      hundredkmN = Math.floor(this.y / 100000);
  if (MappingUtils.irishGrid[hundredkmE] && MappingUtils.irishGrid[hundredkmE][hundredkmN]) {
    //var letter = MappingUtils.irishGrid[hundredkmE][hundredkmN];

    //var eKm = '0' + Math.floor((this.x % 100000)/1000).toString();
    //var nKm = '0' + Math.floor((this.x % 100000)/1000).toString();

    return NationalGridCoords._e_n_to_gr(MappingUtils.irishGrid[hundredkmE][hundredkmN],
      (this.x - (100000 * hundredkmE)),
      (this.y - (100000 * hundredkmN)),
      precision ? precision : 1
    );
  } else {
    return null;
  }
};

export default OSIRef;
