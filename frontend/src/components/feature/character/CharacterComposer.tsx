"use client";

import React from "react";
import { Gender } from "./types";
import { SlotLevel, getHeadComponent, getTopComponent, getBottomComponent } from "./item-registry";

interface CharacterComposerProps {
  gender: Gender;
  head?: SlotLevel;
  top?: SlotLevel;
  bottom?: SlotLevel;
  className?: string;
}

/**
 * Composes a full character from modular SVG pieces.
 *
 * Uses nested <svg> elements inside a parent <svg> to position
 * head, top, and bottom pieces vertically.
 *
 * Layout (based on existing CharacterShowcase viewBox 128×352):
 * - Head:  y=0, centered horizontally
 * - Top:   overlaps head slightly, centered
 * - Bottom: below top, centered
 */

const COMPOSER_WIDTH = 120;
const COMPOSER_HEIGHT = 400;

// How much the bottom needs to shift UP to meet the top's waist.
// Formula: topFrameHeight - waistY (per female top item).
const FEMALE_BOTTOM_OFFSET: Record<SlotLevel, number> = {
  base: 8,   // 165 - 157
  lv1: -6,   // 165 - (165 + 8 translate)
  lv2: 5,    // 165 - 160
  lv3: -8,   // 165 - (133 + 40 translate)
  lv4: -5,   // 165 - (130 + 40 translate)
  lv5: -5,    // 165 - (153 + 17 translate)
};

// Per-gender offsets for each piece (tune to fit)
const LAYOUT: Record<Gender, {
  head:    { x: number; y: number; maxH: number };
  top:     { x: number; y: number; maxH: number };
  bottom:  { x: number; y: number; maxH: number };
}> = {
  male: {
    head:    { x: 0, y: 5,  maxH: 120 },
    top:     { x: 0, y: 110, maxH: 170 },
    bottom:  { x: 0, y: 218, maxH: 150 },
  },
  female: {
    head:    { x: 0, y: 40,  maxH: 120 },
    top:     { x: 0, y: 110, maxH: 170 },
    bottom:  { x: 0, y: 238, maxH: 150 },
  },
};

export function CharacterComposer({
  gender,
  head = "base",
  top = "base",
  bottom = "base",
  className,
}: CharacterComposerProps) {
  const HeadComponent = getHeadComponent(head);
  const TopComponent = getTopComponent(top);
  const BottomComponent = getBottomComponent(bottom);

  const layout = LAYOUT[gender];
  const bottomOffset = gender === "female" ? FEMALE_BOTTOM_OFFSET[top] : 0;

  return (
    <svg
      viewBox={`0 0 ${COMPOSER_WIDTH} ${COMPOSER_HEIGHT}`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bottom piece (rendered first = behind) */}
      <svg
        x={layout.bottom.x}
        y={layout.bottom.y - bottomOffset}
        width={COMPOSER_WIDTH}
        height={layout.bottom.maxH}
        overflow="visible"
      >
        <BottomComponent gender={gender} />
      </svg>

      {/* Top piece (middle layer) */}
      <svg
        x={layout.top.x}
        y={layout.top.y}
        width={COMPOSER_WIDTH}
        height={layout.top.maxH}
        overflow="visible"
      >
        <TopComponent gender={gender} />
      </svg>

      {/* Head piece (rendered last = on top) */}
      <svg
        x={layout.head.x}
        y={layout.head.y}
        width={COMPOSER_WIDTH}
        height={layout.head.maxH}
        overflow="visible"
      >
        <HeadComponent gender={gender} />
      </svg>
    </svg>
  );
}
