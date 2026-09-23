"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
  }
);

type CorrelationHeatmapProps = {
  data: Record<string, Record<string, number | null>>;
};

export default function CorrelationHeatmap({
  data,
}: CorrelationHeatmapProps) {
  const columns = Object.keys(data);

  const z = columns.map((column) =>
    columns.map((otherColumn) => {
      if (column === otherColumn) {
        return 1;
      }

      return data[column]?.[otherColumn] ?? 0;
    })
  );

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-2">
      <Plot
        data={[
          {
            z,
            x: columns,
            y: columns,
            type: "heatmap",
            colorscale: [
              [0, "#fee2e2"],
              [0.25, "#fca5a5"],
              [0.5, "#ef4444"],
              [0.75, "#dc2626"],
              [1, "#991b1b"],
            ],
            zmin: -1,
            zmax: 1,
            hovertemplate:
              "%{y} × %{x}<br>Correlation: %{z:.2f}<extra></extra>",
            colorbar: {
              title: {
                text: "Correlation",
                font: {
                  color: "#ffffff",
                },
              },
              tickfont: {
                color: "#ffffff",
              },
            },
          },
        ]}
        layout={{
          autosize: true,
          height: Math.max(450, columns.length * 35),
          margin: {
            l: 140,
            r: 40,
            t: 20,
            b: 120,
          },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: {
            color: "#ffffff",
          },
          xaxis: {
            tickangle: -45,
            gridcolor: "rgba(255,255,255,0.05)",
          },
          yaxis: {
            autorange: "reversed",
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