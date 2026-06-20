export interface DiscountRecord {
  id: string;
  itemId: string;
  type: "percentage" | "fixed";
  value: number;
  startDate: Date | null;
  endDate: Date | null;
  weekdays: number[];
  isActive: boolean;
}

function parseWeekdays(raw: string): number[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

export function normalizeDiscount(discount: {
  id: string;
  itemId: string;
  type: string;
  value: number;
  startDate: Date | null;
  endDate: Date | null;
  weekdays: string;
  isActive: boolean;
}): DiscountRecord {
  return {
    id: discount.id,
    itemId: discount.itemId,
    type: discount.type as "percentage" | "fixed",
    value: discount.value,
    startDate: discount.startDate,
    endDate: discount.endDate,
    weekdays: parseWeekdays(discount.weekdays),
    isActive: discount.isActive,
  };
}

export function getActiveDiscount(
  discounts: DiscountRecord[],
  now = new Date()
): DiscountRecord | null {
  for (const discount of discounts) {
    if (!discount.isActive) continue;

    if (discount.startDate && now < discount.startDate) continue;
    if (discount.endDate && now > discount.endDate) continue;

    if (discount.weekdays.length > 0) {
      const day = now.getDay();
      if (!discount.weekdays.includes(day)) continue;
    }

    return discount;
  }
  return null;
}

export function calculateDiscountedPrice(
  basePrice: number,
  discount: DiscountRecord
): number {
  if (discount.type === "percentage") {
    return Math.max(0, Math.round(basePrice * (1 - discount.value / 100)));
  }
  return Math.max(0, Math.round(basePrice - discount.value));
}

export function getEffectiveDiscountPercent(
  basePrice: number,
  discountedPrice: number | null | undefined
): number | null {
  if (
    discountedPrice == null ||
    discountedPrice >= basePrice ||
    basePrice <= 0
  ) {
    return null;
  }
  return Math.round(((basePrice - discountedPrice) / basePrice) * 100);
}
