/**
 * represents lat lng as WGS84 (google map form)
 *
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */
import {LatLng} from "./LatLng";

export class LatLngWGS84 extends LatLng {
	constructor(lat, lng) {
		super(lat, lng);
	}
}
