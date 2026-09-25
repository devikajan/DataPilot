"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import AutoChart from "@/components/AutoChart";

import {
  Database,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const filename = searchParams.get("dataset");

  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loadDataset = async () => {
      if (!filename) {
        setError("No dataset selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const datasetResponse = await fetch(
  `http://127.0.0.1:8000/datasets/${encodeURIComponent(filename)}`
);

const datasetData = await datasetResponse.json();

if (!datasetResponse.ok) {
  throw new Error(
    datasetData.detail || "Could not load dataset."
  );
}

const analysisResponse = await fetch(
  `http://127.0.0.1:8000/datasets/analyze/${encodeURIComponent(filename)}`,
  {
    method: "POST",
  }
);

const analysisData = await analysisResponse.json();

if (!analysisResponse.ok) {
  throw new Error(
    analysisData.detail || "Could not analyze dataset."
  );
}

setDataset({
  ...datasetData,
  analysis: analysisData.analysis,
});
const rowsResponse = await fetch(
  `http://127.0.0.1:8000/datasets/${encodeURIComponent(filename)}/data`
);

const rowsData = await rowsResponse.json();

if (!rowsResponse.ok) {
  throw new Error(
    rowsData.detail || "Could not load dataset rows."
  );
}

setChartData(rowsData.data ?? []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not load dataset."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDataset();
  }, [filename]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070a13] px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-sm text-white/40">
              Loading dataset insights...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !dataset) {
    return (
      <main className="min-h-screen bg-[#070a13] px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
              <BarChart3 size={21} className="text-blue-300" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Insights
              </h1>

              <p className="mt-1 text-sm text-white/40">
                Discover insights from your datasets.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <Database size={28} className="text-blue-400" />

            <h2 className="mt-4 text-xl font-semibold">
              No dataset available
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Upload a dataset from the Overview page to generate insights.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { profile } = dataset;

  const analysisInsights = dataset.analysis?.insights ?? [];

  const datasetSummary = analysisInsights.find(
    (insight: any) => insight.type === "dataset_summary"
  );

  const numericSummary = analysisInsights.find(
    (insight: any) => insight.type === "numeric_summary"
  );

  const categoricalSummary = analysisInsights.find(
    (insight: any) => insight.type === "categorical_summary"
  );

  const correlations = analysisInsights.find(
    (insight: any) => insight.type === "correlations"
  );

  const datasetOverview = analysisInsights.find(
    (insight: any) => insight.type === "dataset_overview"
  );

  const timeSeriesSummary = analysisInsights.find(
    (insight: any) => insight.type === "time_series_summary"
  );
  const chartRecommendations = analysisInsights.find(
  (insight: any) => insight.type === "chart_recommendations"
);

  const outlierAnalysis = analysisInsights.find(
  (insight: any) => insight.type === "outlier_analysis"
);

  const numericColumns = profile.column_details.filter(
    (column: any) => column.statistics
  );

  const categoricalColumns = profile.column_details.filter(
    (column: any) => !column.statistics
  );

  const hasTimeSeriesData =
    timeSeriesSummary?.data &&
    Object.keys(timeSeriesSummary.data).length > 0;

  return (
    <main className="min-h-screen bg-[#070a13] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
            <BarChart3
              size={21}
              className="text-blue-300"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              Insights
            </h1>

            <p className="mt-1 text-sm text-white/40">
              Automated analysis of {dataset.filename}
            </p>
          </div>
        </div>

        {/* =====================================================
            DATASET METRICS
        ====================================================== */}

        <section className="mt-4 grid gap-4 md:grid-cols-3">

          {/* Rows */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/15 hover:bg-white/[0.04]">
            <p className="text-sm text-white/40">
              Rows
            </p>

            <p className="mt-3 text-4xl font-bold tracking-tight">
              {profile.rows.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-white/25">
              Total records
            </p>
          </div>

          {/* Columns */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/15 hover:bg-white/[0.04]">
            <p className="text-sm text-white/40">
              Columns
            </p>

            <p className="mt-3 text-4xl font-bold tracking-tight">
              {profile.columns}
            </p>

            <p className="mt-2 text-xs text-white/25">
              Data attributes
            </p>
          </div>

          {/* Duplicate Rows */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/15 hover:bg-white/[0.04]">
            <p className="text-sm text-white/40">
              Duplicate Rows
            </p>

            <p className="mt-3 text-4xl font-bold tracking-tight">
              {profile.duplicate_rows}
            </p>

            <p className="mt-2 text-xs text-white/25">
              Data quality check
            </p>
          </div>

        </section>

        {/* =====================================================
            DATASET SUMMARY
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex items-center gap-3">
            <Database
              size={20}
              className="text-blue-400"
            />

            <h2 className="text-lg font-semibold">
              Dataset Summary
            </h2>
          </div>

          <p className="mt-4 text-sm leading-6 text-white/60">
            {dataset.filename} contains{" "}
            <span className="font-medium text-white">
              {profile.rows.toLocaleString()}
            </span>{" "}
            rows across{" "}
            <span className="font-medium text-white">
              {profile.columns}
            </span>{" "}
            columns.
          </p>

        </section>

        {/* =====================================================
            AUTOMATIC DATASET INSIGHTS
        ====================================================== */}

        {datasetOverview && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400/80">
                Automated Analysis
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                Dataset Overview
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Automatically detected characteristics of your dataset.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-xl border border-white/5 bg-white/[0.04] p-5">
                <p className="text-sm text-white/40">
                  Numeric Columns
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {datasetOverview.numeric_column_count}
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.04] p-5">
                <p className="text-sm text-white/40">
                  Categorical Columns
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {datasetOverview.categorical_column_count}
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.04] p-5">
                <p className="text-sm text-white/40">
                  Date Columns
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {datasetOverview.datetime_column_count}
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.04] p-5">
                <p className="text-sm text-white/40">
                  Missing Values
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {datasetOverview.missing_value_count}
                </p>
              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            TIME ANALYSIS
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

  <div>
    <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400/80">
      Trend Analysis
    </p>

    <h2 className="mt-2 text-lg font-semibold">
      Time Analysis
    </h2>

    <p className="mt-1 text-sm text-white/40">
      Trends automatically detected across date and numeric columns.
    </p>
  </div>

  {hasTimeSeriesData ? (
    <div className="mt-6 space-y-6">

      {Object.entries(timeSeriesSummary.data).map(
        ([dateColumn, dateData]: [string, any]) => {

          const metrics = Object.keys(dateData.trends || {});

          const activeMetric =
            metrics.includes(selectedMetric)
              ? selectedMetric
              : metrics[0] || "";

          const activeTrend =
            dateData.trends?.[activeMetric] || [];

          const filteredTrend = activeTrend.filter(
            (item: any) => {
              const itemDate = item.date;

              if (startDate && itemDate < startDate) {
                return false;
              }

              if (endDate && itemDate > endDate) {
                return false;
              }

              return true;
            }
          );

          return (
            <div
              key={dateColumn}
              className="rounded-xl border border-white/5 bg-white/[0.03] p-5"
            >

              {/* Date column information */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                <div>
                  <h3 className="text-base font-semibold text-white">
                    {dateColumn}
                  </h3>

                  <p className="mt-1 text-sm text-white/40">
                    {dateData.min_date} → {dateData.max_date}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.04] px-4 py-2">
                  <p className="text-xs text-white/35">
                    Unique Dates
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {dateData.unique_dates}
                  </p>
                </div>

              </div>

              {/* Controls */}
              <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">

                <div>
                  <label className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    Metric
                  </label>

                  <select
                    value={activeMetric}
                    onChange={(event) =>
                      setSelectedMetric(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#0d1220] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/50 md:w-72"
                  >
                    {metrics.map((metric) => (
                      <option
                        key={metric}
                        value={metric}
                      >
                        {metric}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    From
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#0d1220] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                    To
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) =>
                      setEndDate(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#0d1220] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/50"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Reset
                </button>

              </div>

              {/* Chart */}
              {activeMetric ? (
                <div className="mt-6">

                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-white/80">
                      {activeMetric}
                    </h4>

                    <p className="mt-1 text-xs text-white/30">
                      Showing {filteredTrend.length} of{" "}
                      {activeTrend.length} data points
                    </p>
                  </div>

                  <TimeSeriesChart
                    data={filteredTrend}
                    metric={activeMetric}
                  />

                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">

                  <p className="text-sm text-white/40">
                    No numeric metrics available for this time series.
                  </p>

                </div>
              )}

            </div>
          );
        }
      )}

    </div>
  ) : (
    <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">

      <p className="text-sm font-medium text-white/60">
        No date or time columns detected
      </p>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/30">
        Time-series analysis will automatically appear when your
        dataset contains a date or time column together with numeric
        values.
      </p>

    </div>
  )}

</section>

        {/* =====================================================
    AUTOMATIC VISUALIZATIONS
====================================================== */}

{chartRecommendations &&
  chartRecommendations.data?.length > 0 && (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400/80">
          Visualization Engine
        </p>

        <h2 className="mt-2 text-lg font-semibold">
          Automatic Visualizations
        </h2>

        <p className="mt-1 text-sm text-white/40">
          Charts automatically selected based on your dataset structure.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {chartRecommendations.data
          .slice(0, 8)
          .map((recommendation: any, index: number) => {

            return (
              <div
                key={`${recommendation.chart_type}-${recommendation.x}-${recommendation.y}-${index}`}
                className="rounded-xl border border-white/5 bg-white/[0.03] p-5"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {recommendation.y
                        ? `${recommendation.y} by ${recommendation.x}`
                        : `${recommendation.x} Distribution`}
                    </h3>

                    <p className="mt-1 text-xs uppercase tracking-wider text-white/30">
                      {recommendation.chart_type} chart
                    </p>
                  </div>

                </div>

                <AutoChart
                  chartType={recommendation.chart_type}
                  data={chartData}
                  x={recommendation.x}
                  y={recommendation.y}
                />

              </div>
            );
          })}

      </div>

    </section>
  )}

        {/* =====================================================
    OUTLIER ANALYSIS
====================================================== */}

{outlierAnalysis &&
  Object.keys(outlierAnalysis.data || {}).length > 0 && (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400/80">
          Statistical Analysis
        </p>

        <h2 className="mt-2 text-lg font-semibold">
          Outlier Analysis
        </h2>

        <p className="mt-1 text-sm text-white/40">
          Potential outliers detected using the 1.5 × IQR statistical rule.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        {Object.entries(outlierAnalysis.data).map(
          ([columnName, stats]: [string, any]) => (
            <div
              key={columnName}
              className="rounded-xl border border-white/5 bg-white/[0.03] p-5"
            >

              <div className="flex items-center justify-between">

                <h3 className="text-sm font-semibold text-white">
                  {columnName}
                </h3>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    stats.outlier_count > 0
                      ? "bg-amber-400/10 text-amber-300"
                      : "bg-emerald-400/10 text-emerald-300"
                  }`}
                >
                  {stats.outlier_count} outliers
                </span>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-xs text-white/35">
                    Outlier %
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {stats.outlier_percentage}%
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-xs text-white/35">
                    IQR
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {stats.iqr}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-xs text-white/35">
                    Lower Bound
                  </p>

                  <p className="mt-1 text-sm font-medium text-white/80">
                    {stats.lower_bound}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-xs text-white/35">
                    Upper Bound
                  </p>

                  <p className="mt-1 text-sm font-medium text-white/80">
                    {stats.upper_bound}
                  </p>
                </div>

              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">

                <div>
                  <p className="text-xs text-white/30">
                    Q1
                  </p>

                  <p className="mt-1 text-sm text-white/60">
                    {stats.q1}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/30">
                    Q3
                  </p>

                  <p className="mt-1 text-sm text-white/60">
                    {stats.q3}
                  </p>
                </div>

              </div>

            </div>
          )
        )}

      </div>

    </section>
  )}

        {/* =====================================================
            CATEGORICAL ANALYSIS
        ====================================================== */}

        {categoricalSummary &&
          Object.keys(categoricalSummary.data || {}).length > 0 && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400/80">
                  Category Analysis
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  Categorical Distribution
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Most common values detected across categorical columns.
                </p>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                {Object.entries(categoricalSummary.data).map(
                  ([columnName, values]: [string, any]) => (
                    <div
                      key={columnName}
                      className="rounded-xl border border-white/5 bg-white/[0.03] p-5"
                    >

                      <h3 className="text-sm font-semibold text-white">
                        {columnName}
                      </h3>

                      <div className="mt-4 space-y-3">

                        {values.map(
                          (item: any, index: number) => {

                            const maxCount = Math.max(
                              ...values.map(
                                (value: any) => value.count
                              )
                            );

                            const percentage =
                              maxCount > 0
                                ? (item.count / maxCount) * 100
                                : 0;

                            return (
                              <div key={index}>

                                <div className="flex items-center justify-between">

                                  <span className="text-sm text-white/70">
                                    {String(item.value)}
                                  </span>

                                  <span className="text-xs text-white/40">
                                    {item.count}
                                  </span>

                                </div>

                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                                  <div
                                    className="h-full rounded-full bg-blue-400 transition-all duration-700"
                                    style={{
                                      width: `${percentage}%`,
                                    }}
                                  />

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

        {/* =====================================================
            NUMERIC ANALYSIS
        ====================================================== */}

        {numericSummary &&
          Object.keys(numericSummary.data || {}).length > 0 && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400/80">
                  Numeric Analysis
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  Numeric Statistics
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Statistical summaries automatically generated for numeric columns.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                {Object.entries(numericSummary.data).map(
                  ([columnName, stats]: [string, any]) => (
                    <div
                      key={columnName}
                      className="rounded-xl border border-white/5 bg-white/[0.03] p-5"
                    >

                      <h3 className="text-sm font-semibold text-white">
                        {columnName}
                      </h3>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="rounded-lg bg-white/[0.04] p-3">
                          <p className="text-xs text-white/35">
                            Minimum
                          </p>

                          <p className="mt-1 text-sm font-medium text-white/80">
                            {stats.min ?? "—"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white/[0.04] p-3">
                          <p className="text-xs text-white/35">
                            Maximum
                          </p>

                          <p className="mt-1 text-sm font-medium text-white/80">
                            {stats.max ?? "—"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white/[0.04] p-3">
                          <p className="text-xs text-white/35">
                            Mean
                          </p>

                          <p className="mt-1 text-sm font-medium text-blue-300">
                            {stats.mean ?? "—"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white/[0.04] p-3">
                          <p className="text-xs text-white/35">
                            Median
                          </p>

                          <p className="mt-1 text-sm font-medium text-blue-300">
                            {stats.median ?? "—"}
                          </p>
                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

        {/* =====================================================
            CORRELATION ANALYSIS
        ====================================================== */}

        {correlations &&
          Object.keys(correlations.data || {}).length > 0 && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400/80">
                  Relationship Analysis
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  Numeric Correlations
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Relationships automatically detected between numeric columns.
                </p>
              </div>

              <CorrelationHeatmap
                data={correlations.data}
              />

            </section>
          )}

        {/* =====================================================
            COLUMN TYPES
        ====================================================== */}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Numeric Columns */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <h2 className="text-lg font-semibold">
              Numeric Columns
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Columns available for numerical analysis.
            </p>

            <div className="mt-5 space-y-2">

              {numericColumns.map(
                (column: any) => (
                  <div
                    key={column.name}
                    className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3"
                  >

                    <span className="text-sm text-white/80">
                      {column.name}
                    </span>

                    <span className="text-xs text-white/30">
                      {column.data_type}
                    </span>

                  </div>
                )
              )}

            </div>

          </div>

          {/* Categorical Columns */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <h2 className="text-lg font-semibold">
              Categorical Columns
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Columns containing categorical values.
            </p>

            <div className="mt-5 space-y-2">

              {categoricalColumns.map(
                (column: any) => (
                  <div
                    key={column.name}
                    className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3"
                  >

                    <span className="text-sm text-white/80">
                      {column.name}
                    </span>

                    <span className="text-xs text-white/30">
                      {column.unique_values} unique
                    </span>

                  </div>
                )
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            DATA QUALITY
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <h2 className="text-lg font-semibold">
            Data Quality
          </h2>

          {profile.quality.status === "good" ? (

            <div className="mt-4 flex items-center gap-3 text-emerald-300">

              <CheckCircle2 size={20} />

              <span>
                No major data quality issues detected.
              </span>

            </div>

          ) : (

            <div className="mt-4 space-y-3">

              {profile.quality.warnings.map(
                (warning: any, index: number) => (

                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"
                  >

                    <AlertTriangle
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-400"
                    />

                    <div>

                      <p className="text-sm text-amber-200">
                        {warning.message}
                      </p>

                      {warning.count !== undefined && (
                        <p className="mt-1 text-xs text-white/40">
                          Count: {warning.count}
                        </p>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =====================================================
            NUMERIC STATISTICS
        ====================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

          <div>

            <h2 className="text-lg font-semibold">
              Numeric Statistics
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Summary statistics for numeric columns.
            </p>

          </div>

          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[700px] text-left">

              <thead>

                <tr className="border-b border-white/10">

                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/40">
                    Column
                  </th>

                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/40">
                    Min
                  </th>

                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/40">
                    Max
                  </th>

                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/40">
                    Mean
                  </th>

                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/40">
                    Median
                  </th>

                </tr>

              </thead>

              <tbody>

                {numericColumns.map(
                  (column: any) => (

                    <tr
                      key={column.name}
                      className="border-b border-white/5 transition hover:bg-white/[0.02]"
                    >

                      <td className="px-4 py-4 text-sm font-medium text-white">
                        {column.name}
                      </td>

                      <td className="px-4 py-4 text-sm text-white/60">
                        {column.statistics.min}
                      </td>

                      <td className="px-4 py-4 text-sm text-white/60">
                        {column.statistics.max}
                      </td>

                      <td className="px-4 py-4 text-sm text-white/60">
                        {column.statistics.mean}
                      </td>

                      <td className="px-4 py-4 text-sm text-white/60">
                        {column.statistics.median}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>
    </main>
  );
}