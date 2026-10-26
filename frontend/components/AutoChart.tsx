
"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] items-center justify-center">
      <p className="text-sm text-[#6E473B]">
        Preparing chart...
      </p>
    </div>
  ),
});

type AutoChartProps = {
  chartType: string;
  data: Record<string, unknown>[];
  x: string;
  y?: string;
};

const COLORS = {
  background: "#F7F1E8",
  text: "#291C0E",
  brown: "#6E473B",
  accent: "#A77B66",
  grid: "rgba(169,154,140,0.25)",
  border: "#A99A8C",
};

export default function AutoChart({
  chartType,
  data,
  x,
  y,
}: AutoChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="mt-4 flex min-h-[300px] items-center justify-center rounded-2xl border border-[#A99A8C]/40 bg-[#F7F1E8] p-8 text-center">
        <div>
          <p className="text-sm font-semibold text-[#291C0E]">
            No chart data available
          </p>
          <p className="mt-2 text-sm text-[#6E473B]">
            Try selecting a different dataset or chart configuration.
          </p>
        </div>
      </div>
    );
  }

  const normalizedType = chartType.toLowerCase().trim();

  const validTypes = ["line", "bar", "scatter", "histogram"];

  if (!validTypes.includes(normalizedType)) {
    return (
      <div className="mt-4 rounded-xl border border-[#A99A8C]/40 bg-[#F7F1E8] p-5">
        <p className="text-sm font-semibold text-[#291C0E]">
          Unsupported chart type
        </p>
        <p className="mt-1 text-sm text-[#6E473B]">
          Chart type &quot;{chartType}&quot; is not supported.
          Choose line, bar, scatter, or histogram.
        </p>
      </div>
    );
  }

  const hasX = data.some(
    (row) =>
      row[x] !== null &&
      row[x] !== undefined &&
      row[x] !== ""
  );

  if (!x || !hasX) {
    return (
      <div className="mt-4 rounded-xl border border-[#A99A8C]/40 bg-[#F7F1E8] p-5 text-sm text-[#6E473B]">
        The selected X-axis column has no usable values.
      </div>
    );
  }

  const xValues = data.map((row) => row[x] ?? null);
  const yValues = y
    ? data.map((row) => {
        const value = row[y];

        return typeof value === "number" &&
          Number.isFinite(value)
          ? value
          : null;
      })
    : [];

  if (
    normalizedType !== "histogram" &&
    (!y ||
      !data.some(
        (row) =>
          typeof row[y] === "number" &&
          Number.isFinite(row[y] as number)
      ))
  ) {
    return (
      <div className="mt-4 rounded-xl border border-[#A99A8C]/40 bg-[#F7F1E8] p-5 text-sm text-[#6E473B]">
        Select a valid numeric Y-axis column to generate this chart.
      </div>
    );
  }

  const commonTrace = {
    x: xValues,
    y: yValues,
    name: y || x,
    hovertemplate:
      normalizedType === "histogram"
        ? `${x}: %{x}<br>Count: %{y}<extra></extra>`
        : `${x}: %{x}<br>${y || "Value"}: %{y}<extra></extra>`,
  };

  let plotData: any[];

  switch (normalizedType) {
    case "line":
      plotData = [
        {
          ...commonTrace,
          type: "scatter",
          mode: "lines+markers",
          connectgaps: false,
          line: {
            color: COLORS.brown,
            width: 3,
          },
          marker: {
            color: COLORS.accent,
            size: 7,
          },
        },
      ];
      break;

    case "bar":
      plotData = [
        {
          ...commonTrace,
          type: "bar",
          marker: {
            color: COLORS.brown,
            line: {
              color: COLORS.accent,
              width: 1,
            },
          },
        },
      ];
      break;

    case "scatter":
      plotData = [
        {
          ...commonTrace,
          type: "scatter",
          mode: "markers",
          marker: {
            color: COLORS.brown,
            size: 9,
            opacity: 0.8,
            line: {
              color: COLORS.accent,
              width: 1,
            },
          },
        },
      ];
      break;

    case "histogram":
      plotData = [
        {
          x: xValues,
          type: "histogram",
          name: x,
          marker: {
            color: COLORS.brown,
            line: {
              color: COLORS.accent,
              width: 1,
            },
          },
          hovertemplate:
            `${x}: %{x}<br>Count: %{y}<extra></extra>`,
        },
      ];
      break;

    default:
      return null;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#A99A8C]/40 bg-[#F7F1E8] p-2 sm:p-4">
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          height: 400,
          margin: {
            l: 70,
            r: 25,
            t: 30,
            b: 85,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: {
            color: COLORS.text,
            family: "Inter, system-ui, sans-serif",
            size: 12,
          },
          xaxis: {
            title: {
              text: x,
              font: { color: COLORS.brown, size: 12 },
            },
            tickfont: { color: COLORS.brown, size: 10 },
            gridcolor: COLORS.grid,
            zeroline: false,
            automargin: true,
          },
          yaxis: {
            title: {
              text:
                normalizedType === "histogram"
                  ? "Count"
                  : y || "Value",
              font: { color: COLORS.brown, size: 12 },
            },
            tickfont: { color: COLORS.brown, size: 10 },
            gridcolor: COLORS.grid,
            zeroline: false,
            automargin: true,
          },
          hoverlabel: {
            bgcolor: COLORS.text,
            bordercolor: COLORS.border,
            font: {
              color: COLORS.background,
              size: 12,
            },
          },
          showlegend: false,
          bargap: 0.2,
        }}
        config={{
          responsive: true,
          displayModeBar: false,
          displaylogo: false,
        }}
        style={{ width: "100%" }}
        useResizeHandler
      />
    </div>
  );
}
