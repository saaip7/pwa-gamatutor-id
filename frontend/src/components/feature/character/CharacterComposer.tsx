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
  slotClassNames?: {
    head?: string;
    top?: string;
    bottom?: string;
  };
}

/**
 * Composes a full character from modular SVG pieces.
 *
 * Uses nested <svg> elements inside a parent <svg> to position
 * head, top, and bottom pieces vertically.
 *
 * A single GENDER_SCALE is applied uniformly to the whole character —
 * no per-slot individual scaling.
 */

const COMPOSER_WIDTH = 120;
const COMPOSER_HEIGHT = 380;

/** Single general scale per gender — applied uniformly to the whole character. */
const GENDER_SCALE: Record<Gender, number> = {
  male: 1.0,
  female: 1.0,
};

// How much the bottom needs to shift UP to meet the top's waist.
const FEMALE_BOTTOM_OFFSET: Record<SlotLevel, number> = {
  base: 8,
  lv1: -6,
  lv2: 5,
  lv3: -8,
  lv4: -5,
  lv5: -5,
};

interface SlotLayout {
  x: number;
  y: number;
  maxH: number;
}

const LAYOUT: Record<Gender, {
  head:    SlotLayout;
  top:     SlotLayout;
  bottom:  SlotLayout;
}> = {
  male: {
    head:    { x: 0, y: 25,  maxH: 120 },
    top:     { x: 0, y: 130, maxH: 170 },
    bottom:  { x: 0, y: 238, maxH: 150 },
  },
  female: {
    head:    { x: -1, y: 42,  maxH: 120 },
    top:     { x: 0, y: 110, maxH: 170 },
    bottom:  { x: 4, y: 238, maxH: 150 },
  },
};

export function CharacterComposer({
  gender,
  head = "base",
  top = "base",
  bottom = "base",
  className,
  slotClassNames,
}: CharacterComposerProps) {
  const HeadComponent = getHeadComponent(head);
  const TopComponent = getTopComponent(top);
  const BottomComponent = getBottomComponent(bottom);

  const layout = LAYOUT[gender];
  const bottomOffset = gender === "female" ? FEMALE_BOTTOM_OFFSET[top] : 0;
  const scale = GENDER_SCALE[gender];

  const renderSlot = (
    Component: React.FC<{ gender: Gender }>,
    slot: SlotLayout,
    bottomAdjust: number = 0,
    slotClassName?: string,
  ) => {
    const { x, y, maxH } = slot;
    return (
      <svg
        x={x}
        y={y - bottomAdjust}
        width={COMPOSER_WIDTH}
        height={maxH}
        overflow="visible"
        className={slotClassName}
      >
        <Component gender={gender} />
      </svg>
    );
  };

  // Scale around center of the viewBox
  const cx = COMPOSER_WIDTH / 2;
  const cy = COMPOSER_HEIGHT / 2;

  return (
    <svg
      viewBox={`0 0 ${COMPOSER_WIDTH} ${COMPOSER_HEIGHT}`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={`translate(${cx},${cy}) scale(${scale}) translate(${-cx},${-cy})`}>
        {renderSlot(BottomComponent, layout.bottom, bottomOffset, slotClassNames?.bottom)}
        {renderSlot(TopComponent, layout.top, 0, slotClassNames?.top)}
        {renderSlot(HeadComponent, layout.head, 0, slotClassNames?.head)}
      </g>
    </svg>
  );
}
