export const COUPON_CODES = {
    BFRIDAY: "BFRIDAY",
XMAS2025: "XMAS2025",
NY2026: "NY2026",
} as const 
export type Couponcode = keyof typeof COUPON_CODES;