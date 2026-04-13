import { memo } from "react";

const COLOR = {
  critical: "bg-orange-300",
  warning:  "bg-amber-200",
  normal:   "bg-wellness-500/40",
};

const CONFIGS = {
  spermCount: {
    min: 0, max: 80,
    zones: [
      { end: 5,  color: COLOR.critical },
      { end: 16, color: COLOR.warning },
      { end: 80, color: COLOR.normal },
    ],
    thresholds: [5, 16],
  },
  motility: {
    min: 0, max: 100,
    zones: [
      { end: 30,  color: COLOR.critical },
      { end: 42,  color: COLOR.warning },
      { end: 100, color: COLOR.normal },
    ],
    thresholds: [30, 42],
  },
  morphology: {
    min: 0, max: 15,
    zones: [
      { end: 2,  color: COLOR.critical },
      { end: 4,  color: COLOR.warning },
      { end: 15, color: COLOR.normal },
    ],
    thresholds: [2, 4],
  },
  volume: {
    min: 0, max: 8,
    zones: [
      { end: 0.5, color: COLOR.critical },
      { end: 1.4, color: COLOR.warning },
      { end: 8,   color: COLOR.normal },
    ],
    thresholds: [0.5, 1.4],
  },
};

export default memo(function RangeGauge({ paramKey, value }) {
  const config = CONFIGS[paramKey];
  if (!config) return null;

  const range = config.max - config.min;
  const clamped = Math.max(config.min, Math.min(config.max, value));
  const markerPct = Math.max(2, Math.min(98, ((clamped - config.min) / range) * 100));

  let prev = config.min;
  const segments = config.zones.map((zone) => {
    const width = ((zone.end - prev) / range) * 100;
    prev = zone.end;
    return { width, color: zone.color };
  });

  return (
    <div className="mt-4 mb-3" aria-hidden="true">
      <div className="relative">
        <div className="flex h-[4px] overflow-hidden">
          {segments.map((seg, i) => (
            <div key={i} className={seg.color} style={{ width: `${seg.width}%` }} />
          ))}
        </div>

        <div
          className="absolute top-1/2"
          style={{ left: `${markerPct}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-brand-900 ring-[2px] ring-white" />
        </div>

        {config.thresholds.map((t) => {
          const pos = ((t - config.min) / range) * 100;
          return (
            <div key={t} className="absolute -bottom-[16px]" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
              <span className="text-[9px] text-gray-400 font-medium tabular-nums">{t}</span>
            </div>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
});
