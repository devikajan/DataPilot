
"use client";

import { useEffect, useState } from "react";
import AutoChart from "@/components/AutoChart";

type ChartRecommendation = {
  chart_type: string;
  x: string;
  y?: string;
};

type ChartToolRendererProps = {
  dataset: string;
  recommendation: ChartRecommendation;
};

type GeneratedChart = {
  chart_type: string;
  data: any;
  x: string;
  y?: string | null;
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://datapilot-api-sgvj.onrender.com"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/^http:\/\/https:\/\//i, "https://");

export default function ChartToolRenderer({
  dataset,
  recommendation,
}: ChartToolRendererProps) {
  const [chart, setChart] = useState<GeneratedChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function generateChart() {
      if (!dataset?.trim()) {
        setError("No dataset was selected.");
        setLoading(false);
        return;
      }

      if (!recommendation?.chart_type || !recommendation?.x) {
        setError("The chart recommendation is incomplete.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setChart(null);

        const response = await fetch(`${API_BASE}/charts/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataset,
            chart_type: recommendation.chart_type,
            x_column: recommendation.x,
            y_column: recommendation.y ?? null,
          }),
          signal: controller.signal,
        });

        const responseText = await response.text();

        let result: any = {};

        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            throw new Error(
              `The chart API returned an invalid response (HTTP ${response.status}).`
            );
          }
        }

        if (!response.ok) {
          const detail =
            typeof result.detail === "string"
              ? result.detail
              : typeof result.message === "string"
                ? result.message
                : `Chart API failed with status ${response.status}.`;

          throw new Error(detail);
        }

        const generatedChart = result.chart ?? result;

        if (
          !generatedChart ||
          !generatedChart.chart_type ||
          !Array.isArray(generatedChart.data) ||
          !generatedChart.x
        ) {
          throw new Error(
            "The API response does not contain the expected chart data. Check the backend /charts/ response format."
          );
        }

        setChart(generatedChart as GeneratedChart);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Chart generation error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not generate the chart."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    generateChart();

    return () => {
      controller.abort();
    };
  }, [
    dataset,
    recommendation.chart_type,
    recommendation.x,
    recommendation.y,
  ]);

  if (loading) {
    return (
      <div className="mt-4 flex h-[400px] items-center justify-center rounded-xl border border-[#A99A8C]/40 bg-[#CDBBA9]/20">
        <p className="text-sm text-[#6E473B]">
          Generating chart...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mt-4 rounded-xl border border-[#6E473B]/25 bg-[#6E473B]/5 p-5"
      >
        <p className="text-sm font-medium text-[#6E473B]">
          Could not generate chart
        </p>
        <p className="mt-2 break-words text-sm text-[#6E473B]">
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
      y={chart.y ?? undefined}
    />
  );
}
