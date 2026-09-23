"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
  }
);

type AutoChartProps = {
  chartType: string;
  data: any[];
  x: string;
  y?: string;
};

export default function AutoChart({
  chartType,
  data,
  x,
  y,
}: AutoChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-sm text-white/30">
        No data available for this chart.
      </div>
    );
  }

  let plotData: any[] = [];

  if (chartType === "line") {
    plotData = [
      {
        x: data.map((row) => row[x]),
        y: y ? data.map((row) => row[y]) : [],
        type: "scatter",
        mode: "lines+markers",
        name: y,
      },
    ];
  }

  if (chartType === "bar") {
    plotData = [
      {
        x: data.map((row) => row[x]),
        y: y ? data.map((row) => row[y]) : [],
        type: "bar",
        name: y,
      },
    ];
  }

  if (chartType === "scatter") {
    plotData = [
      {
        x: data.map((row) => row[x]),
        y: y ? data.map((row) => row[y]) : [],
        type: "scatter",
        mode: "markers",
        name: y,
      },
    ];
  }

  if (chartType === "histogram") {
    plotData = [
      {
        x: data.map((row) => row[x]),
        type: "histogram",
        name: x,
      },
    ];
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-2">
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          height: 400,
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
              text: x,
            },
            gridcolor: "rgba(255,255,255,0.05)",
          },
          yaxis: {
            title: {
              text: y || "Count",
            },
            gridcolor: "rgba(255,255,255,0.05)",
          },
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