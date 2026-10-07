"use client";

import { useEffect, useState } from "react";
import AutoChart from "@/components/AutoChart";

type ChartToolRendererProps = {
  dataset: string;
  recommendation: {
    chart_type: string;
    x: string;
    y?: string;
  };
};

export default function ChartToolRenderer({
  dataset,
  recommendation,
}: ChartToolRendererProps) {
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function generateChart() {
      try {
        setLoading(true);
        setError("");
        setChart(null);

        const token = localStorage.getItem("access_token");

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:8000/charts/generate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              dataset,
              chart_type: recommendation.chart_type,
              x: recommendation.x,
              y: recommendation.y ?? null,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
  console.error("Chart API error:", {
    status: response.status,
    statusText: response.statusText,
    result,
  });

  throw new Error(
    result.detail ||
      result.message ||
      `Chart API failed with status ${response.status}`
  );
}

        setChart(result.chart);
      } catch (err) {
        console.error("Chart generation error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not generate chart."
        );
      } finally {
        setLoading(false);
      }
    }

    generateChart();
  }, [
    dataset,
    recommendation.chart_type,
    recommendation.x,
    recommendation.y,
  ]);

  if (loading) {
    return (
      <div className="mt-4 flex h-[400px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.02]">
        <p className="text-sm text-white/40">
          Generating chart...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm text-red-300">
          {error}
        </p>
      </div>
    );
  }

  if (!chart) {
    return null;
  }

  return (
    <AutoChart
      chartType={chart.chart_type}
      data={chart.data}
      x={chart.x}
      y={chart.y}
    />
  );
}