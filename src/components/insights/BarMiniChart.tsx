// src/components/insights/BarMiniChart.tsx
"use client";

export function BarMiniChart({
  data,
  height = 72,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d) => {
          const h = Math.round((d.value / max) * (height - 8));
          return (
            <div key={d.label} className="flex-1">
              <div
                className="w-full rounded-lg bg-gray-900/80"
                style={{ height: h }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
