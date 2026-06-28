// Pricing calculator — shared between New Quote form and persisted quote
import type { Tables } from "@/integrations/supabase/types";

export type CleaningType = "regular" | "deep" | "end_of_tenancy" | "office" | "airbnb";
export type Frequency = "one_time" | "weekly" | "fortnightly" | "monthly";

export const CLEANING_TYPES: { value: CleaningType; label: string }[] = [
  { value: "regular", label: "Regular Cleaning" },
  { value: "deep", label: "Deep Cleaning" },
  { value: "end_of_tenancy", label: "End of Tenancy" },
  { value: "office", label: "Office Cleaning" },
  { value: "airbnb", label: "Airbnb Cleaning" },
];

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "one_time", label: "One-Time" },
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly", label: "Monthly" },
];

export const EXTRA_OPTIONS = [
  { key: "oven_cleaning", label: "Oven Cleaning" },
  { key: "fridge_cleaning", label: "Fridge Cleaning" },
  { key: "carpet_cleaning", label: "Carpet Cleaning" },
  { key: "window_cleaning", label: "Window Cleaning" },
  { key: "balcony", label: "Balcony Cleaning" },
  { key: "inside_cabinets", label: "Inside Cabinets" },
  { key: "garage", label: "Garage" },
] as const;

export type ExtraKey = (typeof EXTRA_OPTIONS)[number]["key"];

type Pricing = Tables<"pricing_settings">;

const BASE_KEY: Record<CleaningType, keyof Pricing> = {
  regular: "regular_base",
  deep: "deep_base",
  end_of_tenancy: "end_of_tenancy_base",
  office: "office_base",
  airbnb: "airbnb_base",
};

const FREQ_MULTIPLIER: Record<Frequency, number> = {
  one_time: 1,
  weekly: 0.85,
  fortnightly: 0.9,
  monthly: 0.95,
};

export interface QuoteInput {
  cleaning_type: CleaningType;
  bedrooms: number;
  bathrooms: number;
  living_rooms: number;
  frequency: Frequency;
  extras: ExtraKey[];
}

export interface QuoteBreakdown {
  base_price: number;
  bedroom_extra_total: number;
  bathroom_extra_total: number;
  living_room_total: number;
  extras_total: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  extra_line_items: { key: ExtraKey; label: string; price: number }[];
}

const n = (v: unknown) => Number(v ?? 0);

export function calculateQuote(input: QuoteInput, p: Pricing): QuoteBreakdown {
  const basePriceRaw = n(p[BASE_KEY[input.cleaning_type]]);
  const base_price = basePriceRaw * FREQ_MULTIPLIER[input.frequency];

  // first bedroom/bathroom/living-room included in base
  const bedroom_extra_total = Math.max(0, input.bedrooms - 1) * n(p.extra_bedroom);
  const bathroom_extra_total = Math.max(0, input.bathrooms - 1) * n(p.extra_bathroom);
  const living_room_total = Math.max(0, input.living_rooms - 1) * n(p.extra_living_room);

  const extra_line_items = input.extras.map((key) => {
    const label = EXTRA_OPTIONS.find((e) => e.key === key)?.label ?? key;
    return { key, label, price: n(p[key as keyof Pricing]) };
  });
  const extras_total = extra_line_items.reduce((s, e) => s + e.price, 0);

  const subtotal = base_price + bedroom_extra_total + bathroom_extra_total + living_room_total + extras_total;
  const discount_amount = subtotal * (n(p.discount_pct) / 100);
  const after_discount = subtotal - discount_amount;
  const tax_amount = after_discount * (n(p.tax_pct) / 100);
  const total = after_discount + tax_amount;

  return {
    base_price: round(base_price),
    bedroom_extra_total: round(bedroom_extra_total),
    bathroom_extra_total: round(bathroom_extra_total),
    living_room_total: round(living_room_total),
    extras_total: round(extras_total),
    subtotal: round(subtotal),
    discount_amount: round(discount_amount),
    tax_amount: round(tax_amount),
    total: round(total),
    extra_line_items,
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

const CURRENCY_SYMBOL: Record<string, string> = { GBP: "£", USD: "$", EUR: "€" };
export const currencySymbol = (c?: string | null) => CURRENCY_SYMBOL[c ?? "GBP"] ?? c ?? "£";
export const formatMoney = (v: number | string | null | undefined, c?: string | null) =>
  `${currencySymbol(c)}${Number(v ?? 0).toFixed(2)}`;

export const cleaningTypeLabel = (t: CleaningType) =>
  CLEANING_TYPES.find((c) => c.value === t)?.label ?? t;
export const frequencyLabel = (f: Frequency) =>
  FREQUENCIES.find((c) => c.value === f)?.label ?? f;
