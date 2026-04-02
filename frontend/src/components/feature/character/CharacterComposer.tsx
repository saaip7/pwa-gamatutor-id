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

// Per-gender offsets for each piece (tune to fit)
const LAYOUT: Record<Gender, {
  head:    { x: number; y: number; maxH: number };
  top:     { x: number; y: number; maxH: number };
  bottom:  { x: number; y: number; maxH: number };
}> = {
  male: {
    head:    { x: 0, y: 5,  maxH: 120 },
    top:     { x: 0, y: 110, maxH: 170 },
    bottom:  { x: 1, y: 218, maxH: 150 },
  },
  female: {
    head:    { x: 0, y: 40,  maxH: 120 },
    top:     { x: 0, y: 110, maxH: 170 },
    bottom:  { x: 1, y: 238, maxH: 150 },
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
        y={layout.bottom.y}
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
