"use client";

import { useEffect, useRef } from "react";

interface RotaryKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  accentColor?: string;
  onChange: (value: number) => void;
}

const KNOB_RADIUS = 36;
const STROKE_WIDTH = 4;
const ARC_START_ANGLE = 135;
const ARC_END_ANGLE = 405;
const ARC_TOTAL = ARC_END_ANGLE - ARC_START_ANGLE;

const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
};

/**
 * Premium SVG-based rotary knob with pointer-drag interaction and glowing arc.
 */
export const RotaryKnob = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit = "",
  accentColor = "#97af86",
  onChange,
}: RotaryKnobProps) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);
  const onChangeRef = useRef(onChange);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const stepRef = useRef(step);

  // Keep refs in sync so event handlers always see fresh values.
  onChangeRef.current = onChange;
  minRef.current = min;
  maxRef.current = max;
  stepRef.current = step;

  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const valueAngle = ARC_START_ANGLE + normalizedValue * ARC_TOTAL;

  const cx = KNOB_RADIUS + STROKE_WIDTH + 2;
  const cy = KNOB_RADIUS + STROKE_WIDTH + 2;
  const svgSize = (KNOB_RADIUS + STROKE_WIDTH + 2) * 2;

  const trackArcPath = describeArc(
    cx,
    cy,
    KNOB_RADIUS,
    ARC_START_ANGLE,
    ARC_END_ANGLE,
  );
  const valueArcPath =
    normalizedValue > 0.005
      ? describeArc(cx, cy, KNOB_RADIUS, ARC_START_ANGLE, valueAngle)
      : "";

  const indicatorPos = polarToCartesian(cx, cy, KNOB_RADIUS - 12, valueAngle);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      const totalDeltaY = startYRef.current - event.clientY;
      const sensitivity = (maxRef.current - minRef.current) / 200;
      const rawNext = startValueRef.current + totalDeltaY * sensitivity;
      const stepped = Math.round(rawNext / stepRef.current) * stepRef.current;
      const clamped = Math.max(minRef.current, Math.min(maxRef.current, stepped));

      onChangeRef.current(clamped);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    const knobElement = knobRef.current;
    if (!knobElement) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      isDraggingRef.current = true;
      startYRef.current = event.clientY;
      startValueRef.current = value;
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    };

    knobElement.addEventListener("pointerdown", handlePointerDown);

    return () => {
      knobElement.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [value]);

  const displayValue =
    value < 1 ? value.toFixed(2) : value < 10 ? value.toFixed(1) : Math.round(value).toString();

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="group relative cursor-grab touch-none select-none active:cursor-grabbing"
        ref={knobRef}
      >
        <svg
          className="h-16 w-16 drop-shadow-lg sm:h-[84px] sm:w-[84px]"
          viewBox={`0 0 ${svgSize} ${svgSize}`}
        >
          {/* Background glow */}
          <defs>
            <filter id={`glow-${label.replace(/\s+/g, "-")}`}>
              <feGaussianBlur result="coloredBlur" stdDeviation="3" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer ring / knob body */}
          <circle
            cx={cx}
            cy={cy}
            fill="#171b22"
            r={KNOB_RADIUS - 4}
            stroke="#252b35"
            strokeWidth={1.5}
          />

          {/* Track arc */}
          <path
            d={trackArcPath}
            fill="none"
            opacity={0.25}
            stroke="#5d6573"
            strokeLinecap="round"
            strokeWidth={STROKE_WIDTH}
          />

          {/* Value arc with glow */}
          {valueArcPath ? (
            <path
              d={valueArcPath}
              fill="none"
              filter={`url(#glow-${label.replace(/\s+/g, "-")})`}
              stroke={accentColor}
              strokeLinecap="round"
              strokeWidth={STROKE_WIDTH}
            />
          ) : null}

          {/* Indicator dot */}
          <circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            fill={accentColor}
            r={3}
          />

          {/* Center value text */}
          <text
            dominantBaseline="central"
            fill="#f8f4ec"
            fontFamily="var(--font-display)"
            fontSize="13"
            textAnchor="middle"
            x={cx}
            y={cy}
          >
            {displayValue}
          </text>
        </svg>
      </div>

      <div className="text-center">
        <p className="font-body text-[0.62rem] uppercase tracking-[0.24em] text-paper-300">
          {label}
        </p>
        {unit ? (
          <p className="font-body text-[0.5rem] uppercase tracking-[0.18em] text-ink-500">
            {unit}
          </p>
        ) : null}
      </div>
    </div>
  );
};
