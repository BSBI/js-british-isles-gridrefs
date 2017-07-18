
/**
 * represents lat lng as WGS84 (google map form)
 *
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */
export const LatLngWGS84 = function(lat, lng) {
  this.lat = lat;
  this.lng = lng;
};
