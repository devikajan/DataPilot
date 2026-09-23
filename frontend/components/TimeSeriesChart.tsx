"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
  }
);

type TimeSeriesChartProps = {
  data: {
    date: string;
    value: number | null;
  }[];
  metric: string;
};

export default function TimeSeriesChart({
  data,
  metric,
}: TimeSeriesChartProps) {
  const validData = data.filter(
    (item) => item.value !== null
  );

  if (validData.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-sm text-gray-400">
        No time-series data available.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-2">
      <Plot
        data={[
          {
            x: validData.map((item) => item.date),
            y: validData.map((item) => item.value),
            type: "scatter",
            mode: "lines+markers",
            name: metric,
            line: {
              width: 3,
            },
            marker: {
              size: 6,
            },
            hovertemplate:
              "%{x}<br>" +
              metric +
              ": %{y:.2f}<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          height: 450,
          margin: {
            l: 70,
            r: 30,
            t: 30,
            b: 80,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: {
            color: "#ffffff",
          },
          xaxis: {
            title: {
              text: "Date",
            },
            gridcolor: "rgba(255,255,255,0.05)",
          },
          yaxis: {
            title: {
              text: metric,
            },
            gridcolor: "rgba(255,255,255,0.05)",
          },
          hovermode: "x unified",
        }}
        config={{
          responsive: true,
          displayModeBar: false,
        }}
        style={{
          width: "100%",
        }}
      />
    </div>
  );
}