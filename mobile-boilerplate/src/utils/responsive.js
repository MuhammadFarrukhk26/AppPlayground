import { Dimensions, PixelRatio } from 'react-native';

// Baseline device used as the design reference (iPhone 11 / standard mid-size phone)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Scales a size horizontally based on screen width relative to the baseline device.
 * Use for widths, horizontal padding/margin, and icon sizes that should track screen width.
 */
export const scaleWidth = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;

/**
 * Scales a size vertically based on screen height relative to the baseline device.
 * Use for heights, vertical padding/margin.
 */
export const scaleHeight = (size) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

/**
 * Moderate scale: scales a value but dampens the effect by a `factor` (default 0.5),
 * so things don't get comically large on big-screen devices or tiny on small ones.
 * This is the one to reach for most often — font sizes, icon sizes, spacing, border radius.
 */
export const scale = (size, factor = 0.5) => {
  return size + (scaleWidth(size) - size) * factor;
};

/**
 * Font scaling that also respects the user's OS-level font size / accessibility settings,
 * on top of device-width scaling.
 */
export const scaleFont = (size, factor = 0.3) => {
  const scaled = scale(size, factor);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// Convenience breakpoint helpers
export const isSmallDevice = SCREEN_WIDTH < 375; // iPhone SE / mini-class
export const isLargeDevice = SCREEN_WIDTH >= 428; // Pro Max-class

export { SCREEN_WIDTH, SCREEN_HEIGHT };
