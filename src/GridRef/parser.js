import {GridRef} from './GridRef';
import {GridRefCI} from './GridRefCI';
import {GridRefGB} from './GridRefGB';
import {GridRefIE} from './GridRefIE';

/**
 * returns a GridRef (GB, IE or CI-specific parser) or false
 * crudely tries to determine the country by trying each country in turn
 *
 * @param {string} rawGridRef
 * @return {(GridRefCI|GridRefGB|GridRefIE|boolean)}
 */
GridRef.from_string = function(rawGridRef) {
	let parser;
	let cleanRef = rawGridRef.replace(/\s+/g, '').toUpperCase();

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
		parser.from_string(cleanRef);

		if (parser.length && !parser.error) {
			return parser;
		}

		if (cleanRef.charAt(0) === 'W') {
			parser = new GridRefCI();
			parser.from_string(cleanRef);

			if (parser.length && !parser.error) {
				return parser;
			}
		} else {
			parser = new GridRefIE();
			parser.from_string(cleanRef);

			if (parser.length && !parser.error) {
				return parser;
			}
		}
	}
	return false;
};

export {GridRef, GridRefCI, GridRefGB, GridRefIE};
