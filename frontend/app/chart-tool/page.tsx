"use client";

import { useState } from "react";
import AutoChart from "@/components/AutoChart";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://datapilot-api-sgvj.onrender.com"
).replace(/\/$/, "");

type ChartResult = {
  chart_type?: string;
  data?: unknown[];
  x?: string;
  y?: string;
};

export default function ChartToolPage() {
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateChart() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/charts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset: "DataPilot_TimeSeries_Test.csv",
          chart_type: "line",
          x_column: "Date",
          y_column: "Revenue",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof result?.detail === "string"
            ? result.detail
            : `The server returned HTTP ${response.status}.`;
        throw new Error(detail || "Failed to generate chart.");
      }

      if (!result?.chart) {
        throw new Error("The server response did not contain a chart.");
      }

      setChart(result.chart as ChartResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the chart."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#E7DCCE] px-4 py-8 text-[#291C0E] sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#291C0E] text-xl font-bold text-[#E7DCCE] shadow-sm">
              D
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#6E473B]">
                DATAPILOT
              </p>
              <p className="mt-1 text-xs text-[#76665A]">
                Business intelligence workspace
              </p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="rounded-xl border border-[#CDBBA9] bg-[#F5EEE6] px-4 py-2.5 text-sm font-medium text-[#6E473B] transition hover:border-[#6E473B] hover:bg-white"
          >
            Back to dashboard
          </a>
        </header>

        <section className="relative mb-7 overflow-hidden rounded-[2rem] border border-[#CDBBA9] bg-[#F5EEE6] p-6 shadow-sm sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-[#CDBBA9]/40 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex rounded-full border border-[#CDBBA9] bg-[#E7DCCE] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6E473B]">
              Data visualization studio
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#291C0E] sm:text-4xl">
              Chart Tool
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#76665A] sm:text-base">
              Turn your dataset into a clear visual story. Generate a sample revenue
              trend chart using the connected DataPilot API.
            </p>
            <button
              onClick={generateChart}
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6E473B] px-5 py-3 text-sm font-semibold text-[#FFF9F2] shadow-md shadow-[#6E473B]/15 transition hover:-translate-y-0.5 hover:bg-[#54362D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating chart…
                </>
              ) : (
                <>Generate revenue chart <span aria-hidden="true">→</span></>
              )}
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#B96B55]/40 bg-[#F7E8E2] p-4 text-sm text-[#7A3527]"
          >
            <div>
              <p className="font-semibold">Chart generation failed</p>
              <p className="mt-1 leading-6">{error}</p>
              <p className="mt-2 text-xs text-[#8C5143]">
                Check that the sample dataset is available to the backend and that
                the /charts/ endpoint accepts this request format.
              </p>
            </div>
            <button
              onClick={() => setError("")}
              className="rounded-lg border border-[#B96B55]/30 px-3 py-1.5 text-xs font-medium hover:bg-[#F0D9D0]"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="rounded-[2rem] border border-[#CDBBA9] bg-[#F5EEE6] p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A7666]">
                Visualization preview
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#291C0E]">
                Revenue over time
              </h2>
              <p className="mt-1 text-sm text-[#76665A]">
                Your generated chart will appear here.
              </p>
            </div>
            <span className="rounded-full border border-[#CDBBA9] bg-[#E7DCCE] px-3 py-1.5 text-xs font-medium text-[#6E473B]">
              Line chart · Sample data
            </span>
          </div>

          {chart ? (
            <div className="overflow-hidden rounded-2xl border border-[#D8C8B8] bg-white p-3 sm:p-5">
              
<AutoChart
  chartType={chart.chart_type || "line"}
  data={(chart.data ?? []).filter(
    (row): row is Record<string, unknown> =>
      typeof row === "object" &&
      row !== null &&
      !Array.isArray(row)
  )}
  x={chart.x || "Date"}
  y={chart.y || "Revenue"}
/>

            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#CDBBA9] bg-[#EDE2D6]/70 px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#CDBBA9] bg-[#F5EEE6] text-2xl text-[#6E473B]">
                ↗
              </div>
              <h3 className="mt-4 font-semibold text-[#453126]">
                Your chart will appear here
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#76665A]">
                Select “Generate revenue chart” to request a visualization from the
                DataPilot backend.
              </p>
            </div>
          )}
        </section>

        <footer className="mt-8 border-t border-[#CDBBA9] py-5 text-center text-xs text-[#8A7666]">
          DataPilot · Insights made clearer
        </footer>
      </div>
    </main>
  );
}
