"use client";

import { useState } from "react";
import AutoChart from "@/components/AutoChart";

const API_URL = "http://127.0.0.1:8000";

export default function ChartToolPage() {
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateChart() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/charts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset: "DataPilot_TimeSeries_Test.csv",
          chart_type: "line",
          x_column: "Date",
          y_column: "Revenue",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to generate chart.");
      }

      setChart(result.chart);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-8 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          DataPilot Chart Tool
        </h1>

        <p className="mt-2 text-white/50">
          Generate a visualization using the backend Chart Tool.
        </p>

        <button
          onClick={generateChart}
          disabled={loading}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Revenue Chart"}
        </button>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {chart && (
          <div className="mt-8">
            <AutoChart
              chartType={chart.chart_type}
              data={chart.data}
              x={chart.x}
              y={chart.y}
            />
          </div>
        )}
      </div>
    </main>
  );
}