import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

// Counts up from the previous value to `value` with an ease-out curve. Non-numbers render as-is.
export default function AnimatedCounter({ value, duration = 900, className, style }) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (typeof value !== 'number') return undefined;
    const start = Date.now();
    const a = from.current;
    let raf;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(a + (value - a) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <Text className={className} style={style}>
      {typeof value === 'number' ? display : value}
    </Text>
  );
}
