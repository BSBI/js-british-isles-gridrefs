//import {GridCoords as gridCoords} from '../GridCoords/GridCoords';
import {LatLngGB as latLngGB} from '../LatLng/LatLngGB';
import {GridCoordsGB as gridCoordsGB} from '../GridCoords/GridCoordsGB';
import {deg2rad} from "../constants";
import {LatLng} from "../LatLng/LatLng";

//export const GridCoords = (function() {return gridCoords})();
export const GridCoordsGB = (function() {return gridCoordsGB})();
export const LatLngGB = (function() {
    /**
     * converts lat and lon (OSGB36) to OS northings and eastings
     *
     * @returns {GridCoordsGB}
     */
    latLngGB.prototype.to_os_coords = function() {
        var phi = this.lat * deg2rad; // convert latitude to radians
        var lam = this.lng * deg2rad; // convert longitude to radians
        var a = 6377563.396; // OSGB semi-major axis
        var b = 6356256.91; // OSGB semi-minor axis
        var e0 = 400000; // easting of false origin
        var n0 = -100000; // northing of false origin
        var f0 = 0.9996012717; // OSGB scale factor on central meridian
        var e2 = 0.0066705397616; // OSGB eccentricity squared
        var lam0 = -0.034906585039886591; // OSGB false east
        var phi0 = 0.85521133347722145; // OSGB false north
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

        return new GridCoordsGB(Math.round(east), Math.round(north));
    };

    return latLngGB
})();