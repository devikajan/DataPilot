"use client";



import { Suspense, useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";




import CorrelationHeatmap from "@/components/CorrelationHeatmap";

import TimeSeriesChart from "@/components/TimeSeriesChart";

import ChartToolRenderer from "@/components/ChartToolRenderer";



import {

  Database,

  BarChart3,

  AlertTriangle,

  CheckCircle2,

} from "lucide-react";



function InsightsContent() { 

  const searchParams = useSearchParams();

  const filename = searchParams.get("dataset");



  const [dataset, setDataset] = useState<any>(null);

  const [loading, setLoading] = useState(true);


  const [error, setError] = useState("");

  const [chartData, setChartData] = useState<any[]>([]);

  const [selectedMetric, setSelectedMetric] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [selectedChartType, setSelectedChartType] = useState("all");



  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://datapilot-api-sgvj.onrender.com")
    .trim()
    .replace(/^http:\/\/https:\/\//i, "https://")
    .replace(/\/+$/, "");

  useEffect(() => {
    let cancelled = false;

    const readJson = async (response: Response, endpoint: string) => {
      const raw = await response.text();
      let payload: any = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = { detail: raw || `The server returned an invalid response for ${endpoint}.` };
      }

      if (!response.ok) {
        const detail = typeof payload.detail === "string"
          ? payload.detail
          : JSON.stringify(payload.detail ?? payload);
        throw new Error(`${response.status} ${response.statusText} — ${detail || `Request failed: ${endpoint}`}`);
      }
      return payload;
    };

    const loadDataset = async () => {
      if (!filename?.trim()) {
        setError("No dataset was selected. Return to Datasets and open Insights for a dataset.");
        setLoading(false);
        setDataset(null);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const safeFilename = encodeURIComponent(filename.trim());
        const profileEndpoint = `/datasets/${safeFilename}`;
        const analysisEndpoint = `/datasets/analyze/${safeFilename}`;
        const rowsEndpoint = `/datasets/${safeFilename}/data`;

        const profileResponse = await fetch(`${API_BASE}${profileEndpoint}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const datasetData = await readJson(profileResponse, profileEndpoint);

        if (!datasetData || !datasetData.profile) {
          throw new Error("The API response did not include a dataset profile. Check the backend GET /datasets/{filename} response.");
        }

        const analysisResponse = await fetch(`${API_BASE}${analysisEndpoint}`, {
          method: "POST",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const analysisData = await readJson(analysisResponse, analysisEndpoint);

        const rowsResponse = await fetch(`${API_BASE}${rowsEndpoint}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const rowsData = await readJson(rowsResponse, rowsEndpoint);

        if (cancelled) return;
        setDataset({
          ...datasetData,
          filename: datasetData.filename || filename,
          analysis: analysisData.analysis ?? analysisData,
        });
        setChartData(Array.isArray(rowsData.data) ? rowsData.data : []);
      } catch (err) {
        if (cancelled) return;
        console.error("Insights page failed to load:", err);
        setDataset(null);
        setChartData([]);
        setError(err instanceof Error ? err.message : "Could not load dataset insights.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadDataset();
    return () => {
      cancelled = true;
    };
  }, [filename, API_BASE]);

  if (loading) {

    return (

      <main className="insights-theme min-h-screen bg-[#E7DCCE] px-6 py-10 text-[#291C0E] md:px-10">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-8 text-center">

            <p className="text-sm text-[#6E473B]">

              Loading dataset insights...

            </p>

          </div>

        </div>

      </main>

    );

  }



  if (error || !dataset) {

    return (

      <main className="insights-theme min-h-screen bg-[#E7DCCE] px-6 py-10 text-[#291C0E] md:px-10">

        <div className="mx-auto max-w-7xl">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#6E473B]/20 bg-[#6E473B]/10">

              <BarChart3 size={21} className="text-[#6E473B]" />

            </div>



            <div>

              <h1 className="text-3xl font-bold">

                Insights

              </h1>



              <p className="mt-1 text-sm text-[#6E473B]">

                Discover insights from your datasets.

              </p>

            </div>

          </div>



          <div className="mt-10 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-8">

            <Database size={28} className="text-[#6E473B]" />



            <h2 className="mt-4 text-xl font-semibold">

              No dataset available

            </h2>



            <p className="mt-2 text-sm text-[#6E473B]">

              Upload a dataset from the Overview page to generate insights.

            </p>

          </div>

        </div>

      </main>

    );

  }



  const profile = dataset?.profile;

  if (!profile) {
    return (
      <main className="insights-theme min-h-screen bg-[#E7DCCE] px-6 py-10 text-[#291C0E] md:px-10">
        <div className="mx-auto max-w-7xl rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-8">
          <h1 className="text-2xl font-bold">Insights unavailable</h1>
          <p className="mt-3 text-sm text-[#6E473B]">The dataset profile was empty or returned in an unexpected format. {error}</p>
        </div>
      </main>
    );
  }



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



const businessKpis = analysisInsights.find(

  (insight: any) => insight.type === "business_kpis"

);



const keyFindings = analysisInsights.find(

  (insight: any) => insight.type === "key_findings"

);



const executiveSummary = analysisInsights.find(

  (insight: any) => insight.type === "executive_summary"

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

    <main className="insights-theme min-h-screen bg-[#E7DCCE] px-6 py-10 text-[#291C0E] md:px-10">

      <div className="mx-auto max-w-7xl">



        {/* =====================================================

            HEADER

        ====================================================== */}



        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#6E473B]/20 bg-[#6E473B]/10">

            <BarChart3

              size={21}

              className="text-[#6E473B]"

            />

          </div>



          <div>

            <h1 className="text-3xl font-bold">

              Insights

            </h1>



            <p className="mt-1 text-sm text-[#6E473B]">

              Automated analysis of {dataset.filename}

            </p>

          </div>

        </div>



        {/* =====================================================

    EXECUTIVE SUMMARY

====================================================== */}



{executiveSummary?.data && (

  <section className="mt-6 rounded-2xl border border-[#6E473B]/10 bg-[#6E473B]/[0.03] p-6">



    <div>

      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

        Executive Summary

      </p>



      <h2 className="mt-2 text-lg font-semibold">

        Dataset Performance Overview

      </h2>



      <p className="mt-1 text-sm text-[#6E473B]">

        A concise summary of the most important information detected in your dataset.

      </p>

    </div>



    {/* Dataset Statistics */}



    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">



      <div className="rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-4">

        <p className="text-xs text-[#6E473B]">

          Records

        </p>



        <p className="mt-2 text-2xl font-bold">

          {executiveSummary.data.dataset.rows.toLocaleString()}

        </p>

      </div>



      <div className="rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-4">

        <p className="text-xs text-[#6E473B]">

          Columns

        </p>



        <p className="mt-2 text-2xl font-bold">

          {executiveSummary.data.dataset.columns}

        </p>

      </div>



      <div className="rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-4">

        <p className="text-xs text-[#6E473B]">

          Missing Values

        </p>



        <p className="mt-2 text-2xl font-bold">

          {executiveSummary.data.dataset.missing_values.toLocaleString()}

        </p>

      </div>



      <div className="rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-4">

        <p className="text-xs text-[#6E473B]">

          Duplicate Rows

        </p>



        <p className="mt-2 text-2xl font-bold">

          {executiveSummary.data.dataset.duplicate_rows.toLocaleString()}

        </p>

      </div>



    </div>



    {/* Key Findings */}



    {executiveSummary.data.findings?.length > 0 && (

      <div className="mt-6">



        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#6E473B]">

          Key Findings

        </p>



        <div className="mt-3 space-y-2">



          {executiveSummary.data.findings

  .slice(0, 4)

  .map((finding: any, index: number) => {



    const isOutlier = finding.type === "outlier";

    const isNegative =

      finding.type === "trend" &&

      finding.change_percentage < 0;



    const icon = isOutlier

      ? "!"

      : isNegative

        ? "↘"

        : "↗";



    const iconClass = isOutlier

      ? "bg-[#6E473B]/10 text-[#6E473B] border-[#6E473B]/20"

      : isNegative

        ? "bg-[#6E473B]/10 text-[#6E473B] border-[#6E473B]/20"

        : "bg-[#6E473B]/10 text-[#6E473B] border-[#6E473B]/20";



    return (

      <div

        key={`${finding.column}-${index}`}

        className="flex items-center gap-4 rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] px-4 py-3 transition hover:bg-[#CDBBA9]/40"

      >



        <div

          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${iconClass}`}

        >

          {icon}

        </div>



        <div className="min-w-0">

          <p className="text-sm font-medium text-[#291C0E]">

            {finding.column}

          </p>



          <p className="mt-0.5 text-sm text-[#6E473B]">

            {finding.message}

          </p>

        </div>



      </div>

    );

  })}



        </div>



      </div>

    )}



  </section>

)}





        {/* =====================================================

            DATASET SUMMARY

        ====================================================== */}



        <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



          <div className="flex items-center gap-3">

            <Database

              size={20}

              className="text-[#6E473B]"

            />



            <h2 className="text-lg font-semibold">

              Dataset Summary

            </h2>

          </div>



          <p className="mt-4 text-sm leading-6 text-[#6E473B]">

            {dataset.filename} contains{" "}

            <span className="font-medium text-[#291C0E]">

              {profile.rows.toLocaleString()}

            </span>{" "}

            rows across{" "}

            <span className="font-medium text-[#291C0E]">

              {profile.columns}

            </span>{" "}

            columns.

          </p>



        </section>



        {/* =====================================================

    KEY BUSINESS METRICS

====================================================== */}



{businessKpis &&

  businessKpis.data?.length > 0 && (

    <section className="mt-6">



      <div>

        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

          Key Metrics

        </p>



        <h2 className="mt-2 text-lg font-semibold">

          Business Summary

        </h2>



        <p className="mt-1 text-sm text-[#6E473B]">

          Key performance indicators automatically identified from your dataset.

        </p>

      </div>



      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">



        {businessKpis.data

          .slice(0, 4)

          .map((kpi: any) => (

            <div

              key={kpi.column}

              className="rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-5 transition hover:border-white/15 hover:bg-[#CDBBA9]/35"

            >



              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6E473B]">

                {kpi.label}

              </p>



              <p className="mt-3 text-2xl font-bold tracking-tight text-[#291C0E]">

                {typeof kpi.value === "number"

                  ? kpi.value.toLocaleString(undefined, {

                      maximumFractionDigits: 2,

                    })

                  : kpi.value ?? "—"}

              </p>



              <p className="mt-1 text-xs text-[#6E473B]/70">

                {kpi.aggregation === "total"

                  ? "Total"

                  : "Average"}

              </p>



              <div className="mt-4 flex items-center justify-between border-t border-[#A99A8C]/35 pt-3">



                <div>

                  <p className="text-[11px] text-[#6E473B]">

                    Min

                  </p>



                  <p className="mt-1 text-xs text-[#6E473B]">

                    {typeof kpi.min === "number"

                      ? kpi.min.toLocaleString(undefined, {

                          maximumFractionDigits: 2,

                        })

                      : kpi.min ?? "—"}

                  </p>

                </div>



                <div>

                  <p className="text-[11px] text-[#6E473B]">

                    Max

                  </p>



                  <p className="mt-1 text-xs text-[#6E473B]">

                    {typeof kpi.max === "number"

                      ? kpi.max.toLocaleString(undefined, {

                          maximumFractionDigits: 2,

                        })

                      : kpi.max ?? "—"}

                  </p>

                </div>



              </div>



            </div>

          ))}



      </div>



    </section>

  )}



  {/* =====================================================

    KEY FINDINGS

====================================================== */}



{keyFindings &&

  keyFindings.data?.length > 0 && (

    <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



      <div>

        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

          Automated Insights

        </p>



        <h2 className="mt-2 text-lg font-semibold">

          Key Findings

        </h2>



        <p className="mt-1 text-sm text-[#6E473B]">

          Important trends and potential anomalies detected automatically.

        </p>

      </div>



      <div className="mt-6 space-y-3">



        {keyFindings.data.map(

          (finding: any, index: number) => (

            <div

              key={`${finding.column}-${finding.type}-${index}`}

              className="flex items-start gap-4 rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-4 transition hover:bg-[#CDBBA9]/40"

            >



              <div

                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${

                  finding.type === "outlier"

                    ? "bg-[#6E473B]/10 text-[#6E473B]"

                    : finding.change_percentage < 0

                      ? "bg-[#6E473B]/10 text-[#6E473B]"

                      : "bg-[#6E473B]/10 text-[#6E473B]"

                }`}

              >

                {finding.type === "outlier" ? "!" : "↗"}

              </div>



              <div className="min-w-0">



                <p className="text-sm font-medium text-[#291C0E]">

                  {finding.column}

                </p>



                <p className="mt-1 text-sm leading-6 text-[#6E473B]">

                  {finding.message}

                </p>



              </div>



            </div>

          )

        )}



      </div>



    </section>

  )}







        {/* =====================================================

            AUTOMATIC DATASET INSIGHTS

        ====================================================== */}



        {datasetOverview && (

          <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



            <div>

              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

                Automated Analysis

              </p>



              <h2 className="mt-2 text-lg font-semibold">

                Dataset Overview

              </h2>



              <p className="mt-1 text-sm text-[#6E473B]">

                Automatically detected characteristics of your dataset.

              </p>

            </div>



            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">



              <div className="rounded-xl border border-[#A99A8C]/35 bg-[#CDBBA9]/35 p-5">

                <p className="text-sm text-[#6E473B]">

                  Numeric Columns

                </p>



                <p className="mt-3 text-3xl font-bold">

                  {datasetOverview.numeric_column_count}

                </p>

              </div>



              <div className="rounded-xl border border-[#A99A8C]/35 bg-[#CDBBA9]/35 p-5">

                <p className="text-sm text-[#6E473B]">

                  Categorical Columns

                </p>



                <p className="mt-3 text-3xl font-bold">

                  {datasetOverview.categorical_column_count}

                </p>

              </div>



              <div className="rounded-xl border border-[#A99A8C]/35 bg-[#CDBBA9]/35 p-5">

                <p className="text-sm text-[#6E473B]">

                  Date Columns

                </p>



                <p className="mt-3 text-3xl font-bold">

                  {datasetOverview.datetime_column_count}

                </p>

              </div>



              <div className="rounded-xl border border-[#A99A8C]/35 bg-[#CDBBA9]/35 p-5">

                <p className="text-sm text-[#6E473B]">

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



        <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



  <div>

    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

      Trend Analysis

    </p>



    <h2 className="mt-2 text-lg font-semibold">

      Time Analysis

    </h2>



    <p className="mt-1 text-sm text-[#6E473B]">

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

              className="rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-5"

            >



              {/* Date column information */}

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">



                <div>

                  <h3 className="text-base font-semibold text-[#291C0E]">

                    {dateColumn}

                  </h3>



                  <p className="mt-1 text-sm text-[#6E473B]">

                    {dateData.min_date} → {dateData.max_date}

                  </p>

                </div>



                <div className="rounded-lg bg-[#CDBBA9]/35 px-4 py-2">

                  <p className="text-xs text-[#6E473B]">

                    Unique Dates

                  </p>



                  <p className="mt-1 text-sm font-medium text-[#291C0E]">

                    {dateData.unique_dates}

                  </p>

                </div>



              </div>



              {/* Controls */}

              <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">



                <div>

                  <label className="text-xs font-medium uppercase tracking-[0.15em] text-[#6E473B]">

                    Metric

                  </label>



                  <select

                    value={activeMetric}

                    onChange={(event) =>

                      setSelectedMetric(event.target.value)

                    }

                    className="mt-2 w-full rounded-lg border border-[#A99A8C]/50 bg-[#F7F1E8] px-4 py-3 text-sm text-[#291C0E] outline-none transition focus:border-[#6E473B]/50 md:w-72"

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

                  <label className="text-xs font-medium uppercase tracking-[0.15em] text-[#6E473B]">

                    From

                  </label>



                  <input

                    type="date"

                    value={startDate}

                    onChange={(event) =>

                      setStartDate(event.target.value)

                    }

                    className="mt-2 w-full rounded-lg border border-[#A99A8C]/50 bg-[#F7F1E8] px-4 py-3 text-sm text-[#291C0E] outline-none transition focus:border-[#6E473B]/50"

                  />

                </div>



                <div>

                  <label className="text-xs font-medium uppercase tracking-[0.15em] text-[#6E473B]">

                    To

                  </label>



                  <input

                    type="date"

                    value={endDate}

                    onChange={(event) =>

                      setEndDate(event.target.value)

                    }

                    className="mt-2 w-full rounded-lg border border-[#A99A8C]/50 bg-[#F7F1E8] px-4 py-3 text-sm text-[#291C0E] outline-none transition focus:border-[#6E473B]/50"

                  />

                </div>



                <button

                  type="button"

                  onClick={() => {

                    setStartDate("");

                    setEndDate("");

                  }}

                  className="rounded-lg border border-[#A99A8C]/50 bg-[#CDBBA9]/35 px-4 py-3 text-sm text-[#6E473B] transition hover:bg-white/[0.08] hover:text-[#291C0E]"

                >

                  Reset

                </button>



              </div>



              {/* Chart */}

              {activeMetric ? (

                <div className="mt-6">



                  <div className="mb-2">

                    <h4 className="text-sm font-medium text-[#291C0E]">

                      {activeMetric}

                    </h4>



                    <p className="mt-1 text-xs text-[#6E473B]">

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

                <div className="mt-6 rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-6 text-center">



                  <p className="text-sm text-[#6E473B]">

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

    <div className="mt-6 rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-8 text-center">



      <p className="text-sm font-medium text-[#6E473B]">

        No date or time columns detected

      </p>



      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6E473B]">

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

    <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



      <div>

        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

          Visualization Engine

        </p>



        <h2 className="mt-2 text-lg font-semibold">

          Automatic Visualizations

        </h2>



        <p className="mt-1 text-sm text-[#6E473B]">

          Charts automatically selected based on your dataset structure.

        </p>

      </div>



      {/* Chart Type Filter */}

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">

  <label className="text-xs font-medium uppercase tracking-[0.15em] text-[#6E473B]">

    Chart Type

  </label>



  <select

    value={selectedChartType}

    onChange={(event) =>

      setSelectedChartType(event.target.value)

    }

    className="w-full rounded-lg border border-[#A99A8C]/50 bg-[#F7F1E8] px-4 py-3 text-sm text-[#291C0E] outline-none transition focus:border-[#6E473B]/50 md:w-64"

  >

          <option value="all">All Charts</option>

          <option value="line">Line</option>

          <option value="bar">Bar</option>

          <option value="scatter">Scatter</option>

          <option value="histogram">Histogram</option>

        </select>

      </div>



      {/* Recommended Charts */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">



        {chartRecommendations.data

          .filter(

            (recommendation: any) =>

              selectedChartType === "all" ||

              recommendation.chart_type === selectedChartType

          )

          .slice(0, 8)

          .map(

            (

              recommendation: any,

              index: number

            ) => {

              return (

                <div

                  key={`${recommendation.chart_type}-${recommendation.x}-${recommendation.y}-${index}`}

                  className="rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-5"

                >



                  {/* Chart Header */}

                  <div className="flex items-start justify-between">



                    <div>

                      <h3 className="text-sm font-semibold text-[#291C0E]">

                        {recommendation.y

                          ? `${recommendation.y} by ${recommendation.x}`

                          : `${recommendation.x} Distribution`}

                      </h3>



                      <p className="mt-1 text-xs uppercase tracking-wider text-[#6E473B]">

                        {recommendation.chart_type} chart

                      </p>



                      <p className="mt-2 text-xs leading-5 text-[#6E473B]">

                        {recommendation.reason}

                      </p>

                    </div>



                  </div>



                  {/* Chart */}

                  <ChartToolRenderer

  dataset={dataset.filename}

  recommendation={recommendation}

/>



                </div>

              );

            }

          )}



      </div>



      {/* No Matching Charts */}

      {chartRecommendations.data.filter(

        (recommendation: any) =>

          selectedChartType === "all" ||

          recommendation.chart_type === selectedChartType

      ).length === 0 && (

        <div className="mt-6 rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-8 text-center">

          <p className="text-sm font-medium text-[#6E473B]">

            No charts available

          </p>



          <p className="mt-2 text-sm text-[#6E473B]">

            No recommendations match the selected chart type.

          </p>

        </div>

      )}



    </section>

  )}



        {/* =====================================================

    OUTLIER ANALYSIS

====================================================== */}



{outlierAnalysis &&

  Object.keys(outlierAnalysis.data || {}).length > 0 && (

    <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



      <div>

        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

          Statistical Analysis

        </p>



        <h2 className="mt-2 text-lg font-semibold">

          Outlier Analysis

        </h2>



        <p className="mt-1 text-sm text-[#6E473B]">

          Potential outliers detected using the 1.5 × IQR statistical rule.

        </p>

      </div>



      <div className="mt-6 grid gap-4 md:grid-cols-2">



        {Object.entries(outlierAnalysis.data).map(

          ([columnName, stats]: [string, any]) => (

            <div

              key={columnName}

              className="rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-5"

            >



              <div className="flex items-center justify-between">



                <h3 className="text-sm font-semibold text-[#291C0E]">

                  {columnName}

                </h3>



                <span

                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${

                    stats.outlier_count > 0

                      ? "bg-[#6E473B]/10 text-[#6E473B]"

                      : "bg-[#6E473B]/10 text-[#6E473B]"

                  }`}

                >

                  {stats.outlier_count} outliers

                </span>



              </div>



              <div className="mt-5 grid grid-cols-2 gap-3">



                <div className="rounded-lg bg-[#CDBBA9]/35 p-3">

                  <p className="text-xs text-[#6E473B]">

                    Outlier %

                  </p>



                  <p className="mt-1 text-sm font-medium text-[#291C0E]">

                    {stats.outlier_percentage}%

                  </p>

                </div>



                <div className="rounded-lg bg-[#CDBBA9]/35 p-3">

                  <p className="text-xs text-[#6E473B]">

                    IQR

                  </p>



                  <p className="mt-1 text-sm font-medium text-[#291C0E]">

                    {stats.iqr}

                  </p>

                </div>



                <div className="rounded-lg bg-[#CDBBA9]/35 p-3">

                  <p className="text-xs text-[#6E473B]">

                    Lower Bound

                  </p>



                  <p className="mt-1 text-sm font-medium text-[#291C0E]">

                    {stats.lower_bound}

                  </p>

                </div>



                <div className="rounded-lg bg-[#CDBBA9]/35 p-3">

                  <p className="text-xs text-[#6E473B]">

                    Upper Bound

                  </p>



                  <p className="mt-1 text-sm font-medium text-[#291C0E]">

                    {stats.upper_bound}

                  </p>

                </div>



              </div>



              <div className="mt-4 grid grid-cols-2 gap-3">



                <div>

                  <p className="text-xs text-[#6E473B]">

                    Q1

                  </p>



                  <p className="mt-1 text-sm text-[#6E473B]">

                    {stats.q1}

                  </p>

                </div>



                <div>

                  <p className="text-xs text-[#6E473B]">

                    Q3

                  </p>



                  <p className="mt-1 text-sm text-[#6E473B]">

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

            <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



              <div>

                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

                  Category Analysis

                </p>



                <h2 className="mt-2 text-lg font-semibold">

                  Categorical Distribution

                </h2>



                <p className="mt-1 text-sm text-[#6E473B]">

                  Most common values detected across categorical columns.

                </p>

              </div>



              <div className="mt-6 grid gap-6 lg:grid-cols-2">



                {Object.entries(categoricalSummary.data).map(

                  ([columnName, values]: [string, any]) => (

                    <div

                      key={columnName}

                      className="rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-5"

                    >



                      <h3 className="text-sm font-semibold text-[#291C0E]">

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



                                  <span className="text-sm text-[#6E473B]">

                                    {String(item.value)}

                                  </span>



                                  <span className="text-xs text-[#6E473B]">

                                    {item.count}

                                  </span>



                                </div>



                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#CDBBA9]/50">



                                  <div

                                    className="h-full rounded-full bg-[#6E473B] transition-all duration-700"

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

            <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



              <div>

                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

                  Numeric Analysis

                </p>



                <h2 className="mt-2 text-lg font-semibold">

                  Numeric Statistics

                </h2>



                <p className="mt-1 text-sm text-[#6E473B]">

                  Statistical summaries automatically generated for numeric columns.

                </p>

              </div>



              <div className="mt-6 grid gap-4 md:grid-cols-2">



                {Object.entries(numericSummary.data).map(

                  ([columnName, stats]: [string, any]) => (

                    <div

                      key={columnName}

                      className="rounded-xl border border-[#A99A8C]/35 bg-[#F7F1E8] p-5"

                    >



                      <h3 className="text-sm font-semibold text-[#291C0E]">

                        {columnName}

                      </h3>



                      <div className="mt-4 grid grid-cols-2 gap-3">



                        <div className="rounded-lg bg-[#CDBBA9]/35 p-3">

                          <p className="text-xs text-[#6E473B]">

                            Minimum

                          </p>



                          <p className="mt-1 text-sm font-medium text-[#291C0E]">

                            {stats.min ?? "—"}

                          </p>

                        </div>



                        <div className="rounded-lg bg-[#CDBBA9]/35 p-3">

                          <p className="text-xs text-[#6E473B]">

                            Maximum

                          </p>



                          <p className="mt-1 text-sm font-medium text-[#291C0E]">

                            {stats.max ?? "—"}

                          </p>

                        </div>



                        <div className="rounded-lg bg-[#CDBBA9]/35 p-3">

                          <p className="text-xs text-[#6E473B]">

                            Mean

                          </p>



                          <p className="mt-1 text-sm font-medium text-[#6E473B]">

                            {stats.mean ?? "—"}

                          </p>

                        </div>



                        <div className="rounded-lg bg-[#CDBBA9]/35 p-3">

                          <p className="text-xs text-[#6E473B]">

                            Median

                          </p>



                          <p className="mt-1 text-sm font-medium text-[#6E473B]">

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

            <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



              <div>

                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6E473B]/80">

                  Relationship Analysis

                </p>



                <h2 className="mt-2 text-lg font-semibold">

                  Numeric Correlations

                </h2>



                <p className="mt-1 text-sm text-[#6E473B]">

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



          <div className="rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



            <h2 className="text-lg font-semibold">

              Numeric Columns

            </h2>



            <p className="mt-1 text-sm text-[#6E473B]">

              Columns available for numerical analysis.

            </p>



            <div className="mt-5 space-y-2">



              {numericColumns.map(

                (column: any) => (

                  <div

                    key={column.name}

                    className="flex items-center justify-between rounded-xl bg-[#CDBBA9]/35 px-4 py-3"

                  >



                    <span className="text-sm text-[#291C0E]">

                      {column.name}

                    </span>



                    <span className="text-xs text-[#6E473B]">

                      {column.data_type}

                    </span>



                  </div>

                )

              )}



            </div>



          </div>



          {/* Categorical Columns */}



          <div className="rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



            <h2 className="text-lg font-semibold">

              Categorical Columns

            </h2>



            <p className="mt-1 text-sm text-[#6E473B]">

              Columns containing categorical values.

            </p>



            <div className="mt-5 space-y-2">



              {categoricalColumns.map(

                (column: any) => (

                  <div

                    key={column.name}

                    className="flex items-center justify-between rounded-xl bg-[#CDBBA9]/35 px-4 py-3"

                  >



                    <span className="text-sm text-[#291C0E]">

                      {column.name}

                    </span>



                    <span className="text-xs text-[#6E473B]">

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



        <section className="mt-6 rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-6">



          <h2 className="text-lg font-semibold">

            Data Quality

          </h2>



          {(profile.quality?.status ?? "unknown") === "good" ? (



            <div className="mt-4 flex items-center gap-3 text-[#6E473B]">



              <CheckCircle2 size={20} />



              <span>

                No major data quality issues detected.

              </span>



            </div>



          ) : (



            <div className="mt-4 space-y-3">



              {(Array.isArray(profile.quality?.warnings) ? profile.quality.warnings : []).map(

                (warning: any, index: number) => (



                  <div

                    key={index}

                    className="flex items-start gap-3 rounded-xl border border-[#6E473B]/20 bg-[#6E473B]/5 p-4"

                  >



                    <AlertTriangle

                      size={19}

                      className="mt-0.5 shrink-0 text-[#6E473B]"

                    />



                    <div>



                      <p className="text-sm text-amber-200">

                        {warning.message}

                      </p>



                      {warning.count !== undefined && (

                        <p className="mt-1 text-xs text-[#6E473B]">

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





      </div>

      <style jsx global>{`
        .insights-theme [class*="text-white"], .insights-theme [class*="text-blue-"], .insights-theme [class*="text-emerald-"], .insights-theme [class*="text-amber-"], .insights-theme [class*="text-red-"] { color: #6E473B !important; }
        .insights-theme [class*="bg-white/"], .insights-theme [class*="bg-blue-"], .insights-theme [class*="bg-emerald-"], .insights-theme [class*="bg-amber-"], .insights-theme [class*="bg-red-"] { background-color: #CDBBA9 !important; }
        .insights-theme [class*="border-white/"], .insights-theme [class*="border-blue-"], .insights-theme [class*="border-emerald-"], .insights-theme [class*="border-amber-"], .insights-theme [class*="border-red-"] { border-color: #A99A8C !important; }
        .insights-theme select, .insights-theme input { background-color: #F7F1E8 !important; color: #291C0E !important; border-color: #A99A8C !important; }
        .insights-theme section, .insights-theme article { border-radius: 1rem; }
      `}</style>
    </main>

  );

}

export default function InsightsPage() {

  return (

    <Suspense fallback={<div>Loading insights...</div>}>

      <InsightsContent />

    </Suspense>

  );

}