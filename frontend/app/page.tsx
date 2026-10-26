"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import DatasetUpload from "@/components/DatasetUpload";
import { motion } from "framer-motion";
import { useDataset } from "@/components/DatasetContext";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bot,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  Upload,
} from "lucide-react";

const stats = [
  {
    label: "Datasets",
    value: "0",
    change: "Your uploaded datasets",
    icon: Database,
  },
  {
    label: "Analyses",
    value: "48",
    change: "+18% this month",
    icon: BarChart3,
  },
  {
    label: "AI Questions",
    value: "126",
    change: "+32 this month",
    icon: MessageSquare,
  },
];

const datasets = [
  {
    name: "Sales Analytics",
    type: "CSV",
    rows: "24.8K rows",
    columns: "18 columns",
    time: "2 hours ago",
  },
  {
    name: "Customer Data",
    type: "XLSX",
    rows: "12.4K rows",
    columns: "24 columns",
    time: "Yesterday",
  },
  {
    name: "Marketing Performance",
    type: "CSV",
    rows: "8.2K rows",
    columns: "16 columns",
    time: "2 days ago",
  },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Datasets", icon: Database },
  { label: "AI Analyst", icon: Bot },
  { label: "Insights", icon: BarChart3 },
];

export default function Home() {
  const { setDataset } = useDataset();
  const [datasetResult, setDatasetResult] = useState<any>(null);
  const [datasetCount, setDatasetCount] = useState(0);
  useEffect(() => {
    async function loadDatasetCount() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return;

        // Public homepage: no login token is required to render the page.
        const response = await fetch(`${apiUrl}/datasets/`);

        if (response.ok) {
          const data = await response.json();
          setDatasetCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        // The dashboard remains usable even when the API is unavailable.
        console.error("Failed to fetch dataset count:", error);
      }
    }

    loadDatasetCount();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#E7DCCE] text-[#291C0E]">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#A99A8C]/25 blur-[120px]" />
        <div className="absolute right-[-100px] top-40 h-96 w-96 rounded-full bg-[#CDBBA9]/30 blur-[120px]" />
        <div className="absolute bottom-[-150px] left-1/3 h-96 w-96 rounded-full bg-[#A99A8C]/20 blur-[120px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-[#A99A8C]/50 bg-[#CDBBA9] px-5 py-6 text-[#291C0E] lg:block shadow-[8px_0_30px_rgba(41,28,14,0.04)]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6E473B]/20 bg-[#A99A8C]/45 text-[#291C0E] shadow-sm">
              <Sparkles size={21} />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                DataPilot
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6E473B]">
                Intelligence
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6E473B]">
              Workspace
            </p>

           <nav className="mt-4 space-y-1">
  {navItems.map((item) => {
    const Icon = item.icon;

    const href =
      item.label === "Overview"
        ? "/"
        : item.label === "Datasets"
        ? "/datasets"
        : item.label === "AI Analyst"
        ? "/ai-analyst"
        : "/insights";

    return (
      <Link
        key={item.label}
        href={href}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
          item.active
            ? "bg-[#6E473B] text-[#E7DCCE] shadow-sm"
            : "text-[#291C0E] hover:bg-[#E7DCCE]/70 hover:text-[#291C0E]"
        }`}
      >
        <Icon
          size={18}
          className={
            item.active
              ? "text-[#E7DCCE]"
              : "text-[#6E473B] group-hover:text-[#291C0E]"
          }
        />
        {item.label}
      </Link>
    );
  })}
</nav>  
          </div>

          {/* Bottom */}
          <div className="absolute bottom-6 w-[214px]">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#291C0E] transition hover:bg-[#E7DCCE]/70 hover:text-[#291C0E]">
              <Settings size={18} />
              Settings
            </button>

</div>
</aside>

        {/* Main */}
        <section className="flex-1">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-[#A99A8C]/35 px-6 lg:px-10">
            <div>
              <p className="text-xs text-[#6E473B]/75">Workspace / Overview</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-[#A99A8C]/40 bg-[#E7DCCE]/70 px-4 py-2 text-sm text-[#6E473B]/75 md:flex">
                <span>⌘</span>
                <span>K</span>
                <span className="ml-2">Search</span>
              </div>

              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#A99A8C]/40 bg-[#A99A8C]/15">
                <Activity size={16} className="text-[#6E473B]" />
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
            >
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#A99A8C]/50 bg-[#CDBBA9]/50 px-3 py-1.5 text-xs text-[#6E473B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6E473B]" />
                  AI Analytics Workspace
                </div>

                <div>
  <p className="mb-3 text-sm font-medium text-[#6E473B]">
    YOUR ANALYTICS WORKSPACE
  </p>

  <h2 className="text-4xl font-semibold tracking-tight text-[#291C0E] md:text-5xl">
    Turn data into
    <span className="ml-2 text-[#6E473B]">
      decisions.
    </span>
  </h2>
</div>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#6E473B]">
                  Upload your datasets, explore patterns, and ask your AI
                  analyst complex business questions in natural language.
                </p>
              </div>

              <button className="group flex items-center justify-center gap-2 rounded-xl bg-[#6E473B] px-5 py-3 text-sm font-medium text-[#E7DCCE] shadow-lg shadow-[#291C0E]/10 transition hover:scale-[1.02] hover:shadow-[#291C0E]/15">
                <Plus size={17} />
                New Analysis
                <ArrowUpRight
                  size={15}
                  className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </motion.div>

            {/* Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative mt-10 overflow-hidden rounded-2xl border border-[#A99A8C]/50 bg-[#CDBBA9]/60 p-[1px]"
            >
              <div className="relative rounded-2xl bg-[#E7DCCE] px-6 py-10 text-[#291C0E] md:px-10">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#A99A8C]/20 blur-3xl transition group-hover:bg-[#CDBBA9]/40" />

                <div className="relative flex flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#A99A8C]/60 bg-[#CDBBA9]/45"
                  >
                    <Upload className="text-[#6E473B]" size={26} />
                  </motion.div>

                  <h3 className="mt-5 text-xl font-semibold">
                    Analyze a new dataset
                  </h3>

                  <p className="mt-2 text-sm text-[#6E473B]/75">
                    Drop a CSV or Excel file here to get started
                  </p>

                 <div className="dataset-upload-theme">
                 <DatasetUpload
  onUploadSuccess={async (data) => {
    setDatasetResult(data);

    // UploadResponse.preview is optional, but Dataset.preview is required.
    const normalizedData = {
      ...data,
      preview: data.preview ?? [],
    };

    // Make the uploaded dataset available immediately.
    setDataset(normalizedData);

    try {
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement | null;
      const file = fileInput?.files?.[0];

      // The upload itself has already succeeded. If the selected file is
      // no longer available in the input, keep the uploaded dataset.
      if (!file) {
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/datasets/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Analysis request failed with HTTP ${response.status}.`
        );
      }

      const analysisData = await response.json();

      setDataset({
        ...normalizedData,
        analysis: analysisData.analysis,
        preview: normalizedData.preview,
      });
    } catch (error) {
      console.error("ANALYSIS ERROR:", error);

      // Keep the successful upload even if the extra analysis request fails.
      setDataset(normalizedData);
    }
  }}
/>
                 </div>
                  {datasetResult && (
  <div className="mt-6 grid gap-4 md:grid-cols-4">
    {/* Rows */}
    <div className="rounded-2xl border border-[#A99A8C]/40 bg-[#A99A8C]/20 p-6">
      <p className="text-sm text-[#6E473B]/75">Rows</p>
      <p className="mt-1 text-3xl font-bold">
        {datasetResult.profile.rows}
      </p>
    </div>

    {/* Columns */}
    <div className="rounded-2xl border border-[#A99A8C]/40 bg-[#A99A8C]/20 p-6">
      <p className="text-sm text-[#6E473B]/75">Columns</p>
      <p className="mt-1 text-3xl font-bold">
        {datasetResult.profile.columns}
      </p>
    </div>

    {/* Duplicate Rows */}
    <div className="rounded-2xl border border-[#A99A8C]/40 bg-[#A99A8C]/20 p-6">
      <p className="text-sm text-[#6E473B]/75">Duplicate Rows</p>
      <p className="mt-1 text-3xl font-bold">
        {datasetResult.profile.duplicate_rows}
      </p>
    </div>

    {/* Data Quality */}
    <div className="rounded-2xl border border-[#A99A8C]/40 bg-[#A99A8C]/20 p-6">
      <p className="text-sm text-[#6E473B]/75">Data Quality</p>

      <p className="mt-1 text-3xl font-bold">
        {datasetResult.profile.quality?.status ?? "Unknown"}
      </p>
    </div>
  </div>
)}
{datasetResult?.profile?.quality?.warnings?.length > 0 && (
  <div className="mt-4 rounded-2xl border border-[#A99A8C]/50 bg-[#CDBBA9]/30 p-6">
    <p className="text-sm font-semibold text-[#6E473B]">
      Data Quality Warnings
    </p>

    <div className="mt-3 space-y-2">
      {datasetResult.profile.quality.warnings.map(
        (warning: any, index: number) => (
          <p key={index} className="text-sm text-[#6E473B]">
            {warning.message}
          </p>
        )
      )}
    </div>
  </div>
)}
{datasetResult?.profile?.column_details?.length > 0 && (
  <div className="mt-6 overflow-hidden rounded-2xl border border-[#A99A8C]/40 bg-[#E7DCCE]/70">
    <div className="flex items-center justify-between border-b border-[#A99A8C]/40 px-6 py-5">
      <div>
        <h3 className="text-lg font-semibold text-[#291C0E]">
          Column Analysis
        </h3>

        <p className="mt-1 text-sm text-[#6E473B]/75">
          Overview of your dataset columns and data quality
        </p>
      </div>

      <div className="rounded-lg border border-[#A99A8C]/40 bg-[#A99A8C]/20 px-3 py-1.5 text-xs text-[#6E473B]">
        {datasetResult.profile.column_details.length} columns
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px]">
        <thead>
          <tr className="border-b border-[#A99A8C]/40 bg-[#E7DCCE]">
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6E473B]/75">
              Column
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6E473B]/75">
              Data Type
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6E473B]/75">
              Missing
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6E473B]/75">
              Unique
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6E473B]/75">
              Statistics
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6E473B]/75">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {datasetResult.profile.column_details.map(
            (column: any, index: number) => (
              <tr
                key={index}
                className="group border-b border-[#A99A8C]/30 transition-colors hover:bg-[#A99A8C]/15"
              >
                {/* Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#A99A8C]/50 bg-[#CDBBA9]/50 text-xs font-semibold text-[#6E473B]">
                      {column.name.charAt(0).toUpperCase()}
                    </div>

                    <span className="font-medium text-[#291C0E]">
                      {column.name}
                    </span>
                  </div>
                </td>

                {/* Data Type */}
                <td className="px-6 py-4">
                  <span className="rounded-md border border-[#A99A8C]/40 bg-[#A99A8C]/20 px-2.5 py-1 text-xs text-[#6E473B]">
                    {column.data_type}
                  </span>
                </td>

                {/* Missing */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-[#291C0E]">
                      {column.missing_values}
                    </p>

                    <p className="mt-0.5 text-xs text-[#6E473B]/70">
                      {column.missing_percentage}%
                    </p>
                  </div>
                </td>

                {/* Unique */}
                <td className="px-6 py-4">
                  <span className="text-sm text-[#291C0E]/80">
                    {column.unique_values}
                  </span>
                </td>

                {/* Statistics */}
                <td className="px-6 py-4">
                  {column.statistics ? (
                    <div className="space-y-1 text-xs text-[#6E473B]">
                      <p>
                        Min:{" "}
                        <span className="text-[#291C0E]">
                          {column.statistics.min}
                        </span>
                      </p>

                      <p>
                        Max:{" "}
                        <span className="text-[#291C0E]">
                          {column.statistics.max}
                        </span>
                      </p>

                      <p>
                        Mean:{" "}
                        <span className="text-[#291C0E]">
                          {column.statistics.mean}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-[#6E473B]/70">
                      Not applicable
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {column.missing_values === 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-[#CDBBA9]/50 px-3 py-1 text-xs font-medium text-[#6E473B]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Clean
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A99A8C]/50 bg-[#CDBBA9]/50 px-3 py-1 text-xs font-medium text-[#6E473B]">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Missing Data
                    </span>
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
{datasetResult?.preview?.length > 0 && (
  <div className="mt-6 overflow-hidden rounded-2xl border border-[#A99A8C]/40 bg-[#E7DCCE]/70">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-[#A99A8C]/40 px-6 py-5">
      <div>
        <h3 className="text-lg font-semibold text-[#291C0E]">
          Dataset Preview
        </h3>

        <p className="mt-1 text-sm text-[#6E473B]/75">
          Preview of the first rows from your uploaded dataset
        </p>
      </div>

      <div className="rounded-lg border border-[#A99A8C]/40 bg-[#A99A8C]/20 px-3 py-1.5 text-xs text-[#6E473B]">
        Preview · {datasetResult.preview.length} of {datasetResult.profile.rows} rows
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-[#A99A8C]/40 bg-[#E7DCCE]">
            {Object.keys(datasetResult.preview[0]).map(
              (column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[#6E473B]/75"
                >
                  {column}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {datasetResult.preview.map(
            (row: any, rowIndex: number) => (
              <tr
                key={rowIndex}
                className="border-b border-[#A99A8C]/30 transition-colors hover:bg-[#A99A8C]/15"
              >
                {Object.values(row).map(
                  (value: any, columnIndex: number) => (
                    <td
                      key={columnIndex}
                      className="max-w-[250px] truncate whitespace-nowrap px-6 py-4 text-sm text-[#291C0E]/80"
                      title={String(value)}
                    >
                      {String(value)}
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  </div>
)}


                  <p className="mt-3 text-xs font-medium text-[#6E473B]">
                    CSV · XLSX · XLS
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.15 + index * 0.08,
                    }}
                    className="rounded-2xl border border-[#A99A8C]/35 bg-[#F4EEE5] p-5 backdrop-blur-xl transition hover:border-[#6E473B]/40 hover:bg-[#A99A8C]/15"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CDBBA9]/60">
                        <Icon size={17} className="text-[#6E473B]" />
                      </div>

                      <span className="text-[11px] text-[#6E473B]">
                        {stat.change}
                      </span>
                    </div>

                    <p className="mt-5 text-sm text-[#6E473B]/75">{stat.label}</p>
                    <p className="mt-1 text-3xl font-semibold">
  {stat.label === "Datasets" ? datasetCount : stat.value}
</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Lower section */}
            <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              {/* Recent datasets */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="rounded-2xl border border-[#A99A8C]/35 bg-[#F4EEE5] p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Recent datasets</h3>
                    <p className="mt-1 text-xs text-[#6E473B]/75">
                      Your latest uploaded data
                    </p>
                  </div>

                  <button className="text-xs text-[#6E473B] hover:text-[#6E473B]">
                    View all
                  </button>
                </div>

                <div className="mt-6 space-y-2">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.name}
                      className="flex items-center justify-between rounded-xl border border-transparent p-3 transition hover:border-[#A99A8C]/35 hover:bg-[#E7DCCE]/70"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CDBBA9]/50">
                          <FileSpreadsheet
                            size={18}
                            className="text-[#6E473B]"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            {dataset.name}
                          </p>
                          <p className="mt-1 text-xs text-[#6E473B]/70">
                            {dataset.type} · {dataset.rows} ·{" "}
                            {dataset.columns}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-[#6E473B]/65">
                        {dataset.time}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* AI Analyst */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative overflow-hidden rounded-2xl border border-[#A99A8C]/45 bg-[#CDBBA9]/60 p-6"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#A99A8C]/30 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A99A8C]/30">
                      <Bot size={20} className="text-[#6E473B]" />
                    </div>

                    <div>
                      <h3 className="font-semibold">AI Analyst</h3>
                      <p className="text-xs text-[#6E473B]/75">
                        Ask questions about your data
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl border border-[#A99A8C]/35 bg-[#291C0E]/10 p-4">
                    <p className="text-xs leading-5 text-[#6E473B]/75">
                      "Why did revenue decline last quarter?"
                    </p>
                  </div>

                  <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#A99A8C]/50 bg-[#CDBBA9]/50 py-3 text-sm font-medium text-[#6E473B] transition hover:bg-[#A99A8C]/30">
                    <Sparkles size={16} />
                    Open AI Analyst
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <style jsx global>{`
        .dataset-upload-theme {
          width: 100%;
          max-width: 760px;
          margin: 1.5rem auto 0;
          text-align: center;
        }

        /* Selected-file card: a clear, subtle taupe surface. */
        .dataset-upload-theme [class*="bg-slate-50"],
        .dataset-upload-theme [class*="bg-slate-100"],
        .dataset-upload-theme [class*="bg-gray-50"],
        .dataset-upload-theme [class*="bg-gray-100"],
        .dataset-upload-theme [class*="bg-zinc-50"],
        .dataset-upload-theme [class*="bg-zinc-100"],
        .dataset-upload-theme [class*="bg-white"] {
          background-color: #CDBBA9 !important;
          border-color: #A99A8C !important;
        }

        /* Improve readability of selected-file details and validation messages */
        .dataset-upload-theme [class*="text-slate-300"],
        .dataset-upload-theme [class*="text-slate-400"],
        .dataset-upload-theme [class*="text-gray-300"],
        .dataset-upload-theme [class*="text-gray-400"],
        .dataset-upload-theme [class*="text-zinc-300"],
        .dataset-upload-theme [class*="text-zinc-400"],
        .dataset-upload-theme [class*="text-white/"] {
          color: #4D3B31 !important;
          opacity: 1 !important;
        }

        /* Preserve compact icon buttons such as the remove (×) control. */
        .dataset-upload-theme button {
          background-image: none;
        }

        .dataset-upload-theme button:has(svg),
        .dataset-upload-theme button:has([class*="lucide-x"]) {
          width: auto !important;
          min-width: 0 !important;
          padding: 0.5rem !important;
          flex: 0 0 auto !important;
        }

        /* Style common utility classes used by the primary upload action. */
        .dataset-upload-theme button[class*="bg-blue"],
        .dataset-upload-theme button[class*="bg-indigo"],
        .dataset-upload-theme button[class*="bg-purple"],
        .dataset-upload-theme button[class*="gradient"],
        .dataset-upload-theme button[class*="from-blue"],
        .dataset-upload-theme button[class*="from-indigo"],
        .dataset-upload-theme button[class*="from-purple"] {
          background-color: #6E473B !important;
          background-image: none !important;
          color: #FFFFFF !important;
          font-weight: 700 !important;
          border: 1px solid #6E473B !important;
          border-radius: 14px !important;
          width: min(100%, 240px) !important;
          min-width: 200px !important;
          max-width: 100% !important;
          padding: 0.65rem 1.4rem !important;
          margin: 1.25rem auto 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex: none !important;
          font-size: 0.875rem !important;
          box-shadow: 0 3px 8px rgba(41, 28, 14, 0.09) !important;
          transition: background-color 200ms ease, border-color 200ms ease, transform 200ms ease;
        }

        .dataset-upload-theme button[class*="bg-blue"]:hover,
        .dataset-upload-theme button[class*="bg-indigo"]:hover,
        .dataset-upload-theme button[class*="bg-purple"]:hover,
        .dataset-upload-theme button[class*="gradient"]:hover,
        .dataset-upload-theme button[class*="from-blue"]:hover,
        .dataset-upload-theme button[class*="from-indigo"]:hover,
        .dataset-upload-theme button[class*="from-purple"]:hover {
          background-color: #54352C !important;
          border-color: #54352C !important;
        }

        @media (max-width: 480px) {
          .dataset-upload-theme button[class*="bg-blue"],
          .dataset-upload-theme button[class*="bg-indigo"],
          .dataset-upload-theme button[class*="bg-purple"],
          .dataset-upload-theme button[class*="gradient"],
          .dataset-upload-theme button[class*="from-blue"],
          .dataset-upload-theme button[class*="from-indigo"],
          .dataset-upload-theme button[class*="from-purple"] {
            min-width: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </main>
  );
}