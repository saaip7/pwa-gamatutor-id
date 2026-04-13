"use client";

import React from "react";
import { Gender } from "./types";

// Item components
import { HeadBase } from "./items/head/head-base";
import { HeadLv1 } from "./items/head/head-lv1";
import { HeadLv2 } from "./items/head/head-lv2";
import { HeadLv3 } from "./items/head/head-lv3";
import { HeadLv4 } from "./items/head/head-lv4";
import { TopBase } from "./items/top/top-base";
import { TopLv1 } from "./items/top/top-lv1";
import { TopLv2 } from "./items/top/top-lv2";
import { TopLv3 } from "./items/top/top-lv3";
import { TopLv4 } from "./items/top/top-lv4";
import { TopLv5 } from "./items/top/top-lv5";
import { BottomBase } from "./items/bottom/bottom-base";
import { BottomLv1 } from "./items/bottom/bottom-lv1";
import { BottomLv2 } from "./items/bottom/bottom-lv2";
import { BottomLv3 } from "./items/bottom/bottom-lv3";
import { BottomLv4 } from "./items/bottom/bottom-lv4";
import { BottomLv5 } from "./items/bottom/bottom-lv5";
// Special items — to be added later
// import { SpecialLv1 } from "./items/special/special-lv1";
// import { SpecialLv2 } from "./items/special/special-lv2";
// import { SpecialLv3 } from "./items/special/special-lv3";

// ─── Types ────────────────────────────────────────────────────

export type SlotType = "head" | "top" | "bottom" | "special";
export type SlotLevel = "base" | "lv1" | "lv2" | "lv3" | "lv4" | "lv5";

export interface EquippedItems {
  head: SlotLevel;
  top: SlotLevel;
  bottom: SlotLevel;
  special: SlotLevel | null;
}

export interface PreviewTransform {
  offsetY?: number; // % of container, negative = shift up
  scale?: number;   // 1 = default, <1 = smaller
}

export interface ItemDef {
  id: SlotLevel;
  slot: SlotType;
  names: Record<Gender, string>;
  badgeId: Record<Gender, string | null>; // gender-specific badge unlock
  preview?: Partial<Record<Gender, PreviewTransform>>;
}

// ─── Item Definitions ─────────────────────────────────────────
//
// Distribution (approved Apr 13):
//   initiator  = Auto (onboard) → base character only
//   architect  = Easy → Head♂lv1, Top♀lv1, Bottom♂lv1
//   deep_diver = Easy → Head♀lv1, Top♂lv1, Bottom♀lv1
//   marathoner = Easy-Med → Head♂lv2, Top♂lv2, Bottom♀lv2
//   ritualist  = Medium → Head♀lv2, Top♀lv2, Bottom♂lv2, Bottom♂lv3
//   reflector  = Medium → Head♂lv3, Top♂lv3, Bottom♀lv3, Special lv1
//   strategist = Med-Hard → Head♀lv3, Top♀lv3, Bottom♂lv4, Head♀lv4
//   explorer   = Hard → Head♂lv4, Top♂lv4, Bottom♀lv4
//   improver   = Hard → Top♀lv4, Bottom♂lv5, Top♂lv5, Special lv2
//   zenith     = Hardest → Bottom♀lv5, Top♀lv5, Special lv3

export const ITEMS: ItemDef[] = [
  // HEAD (5 items: 1 base + 4 unlockable)
  { id: "base", slot: "head", names: { male: "Short Fade", female: "Chic Long Hair" },
    badgeId: { male: null, female: null },
    preview: { female: { offsetY: -7, scale: 0.85 } } },
  { id: "lv1", slot: "head", names: { male: "Textured Crop", female: "Cute Bangs" },
    badgeId: { male: "architect", female: "deep_diver" },
    preview: { female: { offsetY: -5, scale: 0.9 } } },
  { id: "lv2", slot: "head", names: { male: "Messy Wavy", female: "Sweet Pink Bob" },
    badgeId: { male: "marathoner", female: "ritualist" },
    preview: { female: { offsetY: 0 } } },
  { id: "lv3", slot: "head", names: { male: "Side Part", female: "Neat Ponytail" },
    badgeId: { male: "reflector", female: "strategist" },
    preview: { female: { offsetY: -14, scale: 1.15 } } },
  { id: "lv4", slot: "head", names: { male: "Blue Spiky", female: "Messy Bun" },
    badgeId: { male: "explorer", female: "strategist" },
    preview: { female: { offsetY: -7, scale: 1.1 } } },

  // TOP (6 items: 1 base + 5 unlockable)
  { id: "base", slot: "top", names: { male: "Open Jacket", female: "Beige Parka" },
    badgeId: { male: null, female: null },
    preview: { female: { offsetY: -12, scale: 1.1 } } },
  { id: "lv1", slot: "top", names: { male: "Overshirt", female: "Graphic Hoodie" },
    badgeId: { male: "deep_diver", female: "architect" },
    preview: { female: { offsetY: -10, scale: 1.1 } } },
  { id: "lv2", slot: "top", names: { male: "Crewneck", female: "Striped Sweater" },
    badgeId: { male: "marathoner", female: "ritualist" },
    preview: { female: { offsetY: -10, scale: 1.1 } } },
  { id: "lv3", slot: "top", names: { male: "Denim Jacket", female: "Light Blue Coat" },
    badgeId: { male: "reflector", female: "strategist" },
    preview: { female: { offsetY: -15, scale: 1.1 } } },
  { id: "lv4", slot: "top", names: { male: "Track Jacket", female: "Navy Cardigan" },
    badgeId: { male: "explorer", female: "improver" },
    preview: { female: { offsetY: -15, scale: 1.1 } } },
  { id: "lv5", slot: "top", names: { male: "Formal Blazer", female: "Brown Jacket" },
    badgeId: { male: "improver", female: "zenith" },
    preview: { female: { offsetY: -10, scale: 1.1 } } },

  // BOTTOM (6 items: 1 base + 5 unlockable)
  { id: "base", slot: "bottom", names: { male: "Light Denim", female: "Track Pants" },
    badgeId: { male: null, female: null } },
  { id: "lv1", slot: "bottom", names: { male: "Black Joggers", female: "Black Cropped Pants" },
    badgeId: { male: "architect", female: "deep_diver" } },
  { id: "lv2", slot: "bottom", names: { male: "Ripped Jeans", female: "Straight Pants" },
    badgeId: { male: "ritualist", female: "marathoner" } },
  { id: "lv3", slot: "bottom", names: { male: "Dark Denim", female: "Pleated Skirt" },
    badgeId: { male: "ritualist", female: "reflector" } },
  { id: "lv4", slot: "bottom", names: { male: "Navy Trousers", female: "Brown Midi Skirt" },
    badgeId: { male: "strategist", female: "explorer" } },
  { id: "lv5", slot: "bottom", names: { male: "Khaki Chinos", female: "Floral Skirt" },
    badgeId: { male: "improver", female: "zenith" } },

  // SPECIAL (3 items: all unlockable)
  { id: "lv1", slot: "special", names: { male: "Mirror Pendant", female: "Mirror Pendant" },
    badgeId: { male: "reflector", female: "reflector" } },
  { id: "lv2", slot: "special", names: { male: "Growth Shield", female: "Growth Shield" },
    badgeId: { male: "improver", female: "improver" } },
  { id: "lv3", slot: "special", names: { male: "Zenith Crown", female: "Zenith Crown" },
    badgeId: { male: "zenith", female: "zenith" } },
];

// ─── Helpers ──────────────────────────────────────────────────

export function getItemsBySlot(slot: SlotType): ItemDef[] {
  return ITEMS.filter((item) => item.slot === slot);
}

export function isItemUnlocked(item: ItemDef, unlockedBadges: string[], gender: Gender): boolean {
  if (!item.badgeId[gender]) return true; // base items always available
  return unlockedBadges.includes(item.badgeId[gender]!);
}

export function getItemDisplayName(item: ItemDef, gender: Gender): string {
  return item.names[gender];
}

export function getItemPreviewStyle(item: ItemDef, gender: Gender): React.CSSProperties | undefined {
  const p = item.preview?.[gender];
  if (!p) return undefined;
  return {
    transform: `translateY(${p.offsetY ?? 0}%) scale(${p.scale ?? 1})`,
  };
}

// ─── Component Mapping ────────────────────────────────────────

const HEAD_MAP: Record<SlotLevel, React.FC<{ gender: Gender }>> = {
  base: HeadBase,
  lv1: HeadLv1,
  lv2: HeadLv2,
  lv3: HeadLv3,
  lv4: HeadLv4,
  lv5: HeadBase, // no lv5 head, fallback to base
};

const TOP_MAP: Record<SlotLevel, React.FC<{ gender: Gender }>> = {
  base: TopBase,
  lv1: TopLv1,
  lv2: TopLv2,
  lv3: TopLv3,
  lv4: TopLv4,
  lv5: TopLv5,
};

const BOTTOM_MAP: Record<SlotLevel, React.FC<{ gender: Gender }>> = {
  base: BottomBase,
  lv1: BottomLv1,
  lv2: BottomLv2,
  lv3: BottomLv3,
  lv4: BottomLv4,
  lv5: BottomLv5,
};

// Special items not yet implemented — will be added later
// const SPECIAL_MAP: Record<SlotLevel, React.FC<{ gender: Gender }>> = { ... };

const SLOT_MAP: Record<SlotType, Record<SlotLevel, React.FC<{ gender: Gender }>>> = {
  head: HEAD_MAP,
  top: TOP_MAP,
  bottom: BOTTOM_MAP,
  special: HEAD_MAP, // placeholder until special items are ready
};

export function getItemComponent(slot: SlotType, level: SlotLevel) {
  return SLOT_MAP[slot][level];
}

// Convenience aliases for backward compatibility
export const getHeadComponent = (level: SlotLevel) => HEAD_MAP[level];
export const getTopComponent = (level: SlotLevel) => TOP_MAP[level];
export const getBottomComponent = (level: SlotLevel) => BOTTOM_MAP[level];
