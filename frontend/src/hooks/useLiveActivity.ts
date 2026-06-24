import { useCallback, useEffect, useState } from 'react';

export interface LiveActivityItem {
  time: string;
  message: string;
}

export function useLiveActivity(maxItems = 10) {
  const [items, setItems] = useState<LiveActivityItem[]>([]);

  const log = useCallback(
    (message: string) => {
      const time = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setItems((prev) => [{ time, message }, ...prev].slice(0, maxItems));
    },
    [maxItems]
  );

  return { items, log };
}

export function useAnimatedNumber(value: number, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(value)) return;
    const start = performance.now();
    const from = display;
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate to new target only
  }, [value, duration]);

  return display;
}

export function parseNumericDisplay(value: string | number): { num: number | null; prefix: string; suffix: string } {
  if (typeof value === 'number') return { num: value, prefix: '', suffix: '' };
  const match = value.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) return { num: null, prefix: '', suffix: String(value) };
  return { num: parseFloat(match[2]), prefix: match[1], suffix: match[3] };
}
