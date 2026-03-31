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

// Horizontal & vertical offsets for each piece (tune to fit)
const HEAD_X = 11.5;
const HEAD_Y = 20;
const HEAD_MAX_H = 120;

const TOP_X = 0;
const TOP_Y = 110;
const TOP_MAX_H = 170;

const BOTTOM_X = 10;
const BOTTOM_Y = 230;
const BOTTOM_MAX_H = 150;

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

  return (
    <svg
      viewBox={`0 0 ${COMPOSER_WIDTH} ${COMPOSER_HEIGHT}`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bottom piece (rendered first = behind) */}
      <svg
        x={BOTTOM_X}
        y={BOTTOM_Y}
        width={COMPOSER_WIDTH}
        height={BOTTOM_MAX_H}
        overflow="visible"
      >
        <BottomComponent gender={gender} />
      </svg>

      {/* Top piece (middle layer) */}
      <svg
        x={TOP_X}
        y={TOP_Y}
        width={COMPOSER_WIDTH}
        height={TOP_MAX_H}
        overflow="visible"
      >
        <TopComponent gender={gender} />
      </svg>

      {/* Head piece (rendered last = on top) */}
      <svg
        x={HEAD_X}
        y={HEAD_Y}
        width={COMPOSER_WIDTH}
        height={HEAD_MAX_H}
        overflow="visible"
      >
        <HeadComponent gender={gender} />
      </svg>
    </svg>
  );
}
