import { useEffect, useRef, useState } from "react";

const Draw = ({ data }: { data: number[] }) => {
  const max = Math.max(...data) || 1;
  const step = 100 / data.length;
  return (
    <svg viewBox="0 0 100 18" preserveAspectRatio="none" className="size-full" aria-hidden>
      {data.map((value, index) => {
        const height = Math.max(1.5, (value / max) * 18);
        return (
          <rect
            key={index}
            x={index * step + step * 0.15}
            y={18 - height}
            width={step * 0.7}
            height={height}
            rx={0.6}
            className={index === data.length - 1 ? "fill-chart-1" : "fill-chart-4"}
          />
        );
      })}
    </svg>
  );
};

export const Bars = ({ data }: { data: number[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen]);

  return (
    <div ref={ref} className="h-4.5">
      {seen && data.length > 0 ? <Draw data={data} /> : null}
    </div>
  );
};
