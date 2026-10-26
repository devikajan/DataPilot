
"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center">
      <p className="text-sm text-[#6E473B]">
        Loading correlation heatmap...
      </p>
    </div>
  ),
});

type CorrelationHeatmapProps = {
  data: Record<string, Record<string, number | null>>;
};

export default function CorrelationHeatmap({
  data,
}: CorrelationHeatmapProps) {
  const columns = Object.keys(data ?? {});

  if (columns.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-[#A99A8C]/40 bg-[#CDBBA9]/20 p-8 text-center">
        <p className="text-sm font-medium text-[#291C0E]">
          No correlation data available
        </p>
        <p className="mt-2 text-sm text-[#6E473B]">
          Correlation analysis requires numeric columns with valid data.
        </p>
      </div>
    );
  }

  const z = columns.map((column) =>
    columns.map((otherColumn) => {
      if (column === otherColumn) {
        return 1;
      }

      const value = data[column]?.[otherColumn];

      // Keep missing correlations distinct from a true zero.
      return typeof value === "number" && Number.isFinite(value)
        ? value
        : null;
    })
  );

  const chartHeight = Math.min(
    900,
    Math.max(400, columns.length * 38)
  );

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[#A99A8C]/40 bg-[#F7F1E8] p-2 sm:p-4">
      <Plot
        data={[
          {
            z,
            x: columns,
            y: columns,
            type: "heatmap",
            colorscale: [
              [0, "#8B5144"],
              [0.25, "#CDBBA9"],
              [0.5, "#F7F1E8"],
              [0.75, "#A77B66"],
              [1, "#6E473B"],
            ],
            zmin: -1,
            zmax: 1,
            zmid: 0,
            xgap: 2,
            ygap: 2,
            hoverongaps: false,
            hovertemplate:
              "%{y} × %{x}<br>" +
              "Correlation: %{z:.2f}" +
              "<extra></extra>",
            colorbar: {
              title: {
                text: "Correlation",
                font: {
                  color: "#291C0E",
                  size: 12,
                },
              },
              tickfont: {
                color: "#6E473B",
                size: 11,
              },
              tickvals: [-1, -0.5, 0, 0.5, 1],
              ticktext: ["-1.0", "-0.5", "0", "0.5", "1.0"],
              thickness: 12,
              len: 0.8,
              outlinecolor: "#A99A8C",
              outlinewidth: 1,
            },
          },
        ]}
        layout={{
          autosize: true,
          height: chartHeight,
          margin: {
            l: Math.min(180, Math.max(100, columns.length > 12 ? 150 : 120)),
            r: 65,
            t: 20,
            b: Math.min(180, Math.max(100, columns.length > 12 ? 150 : 120)),
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: {
            color: "#291C0E",
            family: "Inter, system-ui, sans-serif",
          },
          xaxis: {
            tickangle: -45,
            automargin: true,
            tickfont: {
              color: "#6E473B",
              size: 10,
            },
            zeroline: false,
            showline: false,
          },
          yaxis: {
            autorange: "reversed",
            automargin: true,
            tickfont: {
              color: "#6E473B",
              size: 10,
            },
            zeroline: false,
            showline: false,
          },
          hoverlabel: {
            bgcolor: "#F7F1E8",
            bordercolor: "#A99A8C",
            font: {
              color: "#291C0E",
              size: 12,
            },
          },
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
