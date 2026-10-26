export const BANNER_INTERVAL_MS = 5000;
export const nextBanner = (current: number, count: number, direction = 1) => count ? (current + direction + count) % count : 0;