type Range = Map<string, Array<number>>;

const mediaRanges = new Map<string, Range>();

const DEAFULT_RANGE_SET: Range = new Map<string, Array<number>>();
DEAFULT_RANGE_SET.set("S", [0, 599]);
DEAFULT_RANGE_SET.set("M", [600, 1023]);
DEAFULT_RANGE_SET.set("L", [1024, 1439]);
DEAFULT_RANGE_SET.set("XL", [1440, Infinity]);

/**
 * Enumeration containing the names and settings of predefined screen width media query range sets.
 *
 * @public
 */
 enum RANGESETS {
	/**
	 * A 4-step range set (S-M-L-XL).
	 *
	 * The ranges of this set are:
	 * <ul>
	 * <li><code>"S"</code>: For screens smaller than 600 pixels.</li>
	 * <li><code>"M"</code>: For screens greater than or equal to 600 pixels and smaller than 1024 pixels.</li>
	 * <li><code>"L"</code>: For screens greater than or equal to 1024 pixels and smaller than 1440 pixels.</li>
	 * <li><code>"XL"</code>: For screens greater than or equal to 1440 pixels.</li>
	 * </ul>
	 *
	 * @public
	 */
	RANGE_4STEPS = "4Step",
}

/**
 * Initializes a screen width media query range set.
 *
 * This initialization step makes the range set ready to be used for one of the other functions in namespace <code>MediaRange</code>.
 *
 * A range set can be defined as shown in the following example:
 * <pre>
 * MediaRange.initRangeSet("MyRangeSet", [200, 400], ["Small", "Medium", "Large"]);
 * </pre>
 * This example defines the following named ranges:
 * <ul>
 * <li><code>"Small"</code>: For screens smaller than 200 pixels.</li>
 * <li><code>"Medium"</code>: For screens greater than or equal to 200 pixels and smaller than 400 pixels.</li>
 * <li><code>"Large"</code>: For screens greater than or equal to 400 pixels.</li>
 * </ul>
 *
 * @param name The name of the range set to be initialized.
 * The name must be a valid id and consist only of letters and numeric digits.
 * @param range The given range set.
 */
const initRangeSet = (name: string, range: Range) => {
	mediaRanges.set(name, range);
};

/**
 * Returns information about the current active range of the range set with the given name.
 *
 * If the optional parameter <code>width</code> is given, the active range will be determined for that width,
 * otherwise it is determined for the current window size.
 *
 * @param name The name of the range set. The range set must be initialized beforehand ({@link MediaRange.initRangeSet})
 * @param [width] An optional width, based on which the range should be determined;
 * If <code>width</code> is not provided, the window size will be used.
 * @returns The name of the current active interval of the range set.
 * @public
 */
const getCurrentRange = (name: string, width = window.innerWidth): string => {
	let rangeSet = mediaRanges.get(name);

	if (!rangeSet) {
		rangeSet = mediaRanges.get(RANGESETS.RANGE_4STEPS)!;
	}

	let currentRangeName;
	const effectiveWidth = Math.floor(width);

	rangeSet.forEach((value, key) => {
		if (effectiveWidth >= value[0] && effectiveWidth <= value[1]) {
			currentRangeName = key;
		}
	});

	return currentRangeName || [...rangeSet.keys()][0];
};

/**
 * API for screen width changes.
 */
const MediaRange = {
	RANGESETS,
	initRangeSet,
	getCurrentRange,
};

MediaRange.initRangeSet(MediaRange.RANGESETS.RANGE_4STEPS, DEAFULT_RANGE_SET);

export default MediaRange;
