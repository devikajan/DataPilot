
"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center">
      <p className="text-sm text-[#6E473B]">
        Loading time-series chart...
      </p>
    </div>
  ),
});

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
  const validData = (Array.isArray(data) ? data : [])
    .filter(
      (item) =>
        item.date &&
        typeof item.value === "number" &&
        Number.isFinite(item.value) &&
        !Number.isNaN(Date.parse(item.date))
    )
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

  if (validData.length === 0) {
    return (
      <div className="mt-6 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[#A99A8C]/40 bg-[#F7F1E8] p-8 text-center">
        <p className="text-sm font-semibold text-[#291C0E]">
          No time-series data available
        </p>
        <p className="mt-2 max-w-sm text-sm text-[#6E473B]">
          This chart requires valid dates and numeric values for{" "}
          {metric || "the selected metric"}.
        </p>
      </div>
    );
  }

  const chartHeight = Math.min(
    600,
    Math.max(350, validData.length > 30 ? 450 : 400)
  );

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[#A99A8C]/40 bg-[#F7F1E8] p-2 sm:p-4">
      <Plot
        data={[
          {
            x: validData.map((item) => item.date),
            y: validData.map((item) => item.value),
            type: "scatter",
            mode: "lines+markers",
            name: metric || "Value",
            line: {
              color: "#6E473B",
              width: 3,
              shape: "linear",
            },
            marker: {
              color: "#A77B66",
              size: validData.length > 60 ? 4 : 7,
              line: {
                color: "#F7F1E8",
                width: 1.5,
              },
            },
            hovertemplate:
              "%{x}<br>" +
              `${metric || "Value"}: %{y:.2f}` +
              "<extra></extra>",
          },
        ]}
        layout={{
          autosize: true,
          height: chartHeight,
          margin: {
            l: 70,
            r: 25,
            t: 30,
            b: 75,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: {
            color: "#291C0E",
            family: "Inter, system-ui, sans-serif",
            size: 12,
          },
          xaxis: {
            title: {
              text: "Date",
              font: { color: "#6E473B", size: 12 },
            },
            type: "date",
            tickfont: { color: "#6E473B", size: 10 },
            gridcolor: "rgba(169,154,140,0.25)",
            zeroline: false,
            showline: false,
            automargin: true,
          },
          yaxis: {
            title: {
              text: metric || "Value",
              font: { color: "#6E473B", size: 12 },
            },
            tickfont: { color: "#6E473B", size: 10 },
            gridcolor: "rgba(169,154,140,0.25)",
            zeroline: false,
            showline: false,
            automargin: true,
          },
          hovermode: "x unified",
          hoverlabel: {
            bgcolor: "#291C0E",
            bordercolor: "#A99A8C",
            font: {
              color: "#F7F1E8",
              size: 12,
            },
          },
          showlegend: false,
        }}
        config={{
          responsive: true,
          displayModeBar: false,
          displaylogo: false,
        }}
        style={{
          width: "100%",
        }}
        useResizeHandler
      />
    </div>
  );
}
