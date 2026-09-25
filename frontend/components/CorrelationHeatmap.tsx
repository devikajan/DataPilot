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

            /*
             * DataPilot dark UI correlation scale:
             *
             * Strong negative → blue
             * Neutral         → dark navy
             * Strong positive → purple
             */
            colorscale: [
              [0, "#1d4ed8"],
              [0.2, "#2563eb"],
              [0.4, "#1e3a8a"],
              [0.5, "#0f172a"],
              [0.6, "#312e81"],
              [0.8, "#6366f1"],
              [1, "#8b5cf6"],
            ],

            zmin: -1,
            zmax: 1,

            hovertemplate:
              "%{y} × %{x}<br>" +
              "Correlation: %{z:.2f}" +
              "<extra></extra>",

            colorbar: {
              title: {
                text: "Correlation",
                font: {
                  color: "#ffffff",
                  size: 12,
                },
              },

              tickfont: {
                color: "rgba(255,255,255,0.65)",
                size: 11,
              },

              tickvals: [-1, -0.5, 0, 0.5, 1],

              ticktext: [
                "-1.0",
                "-0.5",
                "0",
                "0.5",
                "1.0",
              ],

              thickness: 12,

              len: 0.8,

              outlinecolor: "rgba(255,255,255,0.08)",
              outlinewidth: 1,
            },

            xgap: 2,
            ygap: 2,
          },
        ]}
        layout={{
          autosize: true,

          height: Math.max(
            450,
            columns.length * 35
          ),

          margin: {
            l: 140,
            r: 55,
            t: 20,
            b: 120,
          },

          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",

          font: {
            color: "#ffffff",
            family: "Inter, system-ui, sans-serif",
          },

          xaxis: {
            tickangle: -45,

            tickfont: {
              color: "rgba(255,255,255,0.65)",
              size: 11,
            },

            gridcolor: "rgba(255,255,255,0.04)",

            zeroline: false,

            showline: false,
          },

          yaxis: {
            autorange: "reversed",

            tickfont: {
              color: "rgba(255,255,255,0.65)",
              size: 11,
            },

            gridcolor: "rgba(255,255,255,0.04)",

            zeroline: false,

            showline: false,
          },

          hoverlabel: {
            bgcolor: "#0d1220",
            bordercolor: "rgba(99,102,241,0.5)",
            font: {
              color: "#ffffff",
              size: 12,
            },
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