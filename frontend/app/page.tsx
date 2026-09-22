"use client";
import Link from "next/link";
import { useState } from "react";
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
    value: "12",
    change: "+3 this month",
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

  return (
    <main className="min-h-screen overflow-hidden bg-[#070A13] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute right-[-100px] top-40 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[-150px] left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.07] bg-white/[0.02] px-5 py-6 lg:block">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
              <Sparkles size={21} />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                DataPilot
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                Intelligence
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
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
            ? "bg-white/[0.08] text-white shadow-sm"
            : "text-white/45 hover:bg-white/[0.05] hover:text-white"
        }`}
      >
        <Icon
          size={18}
          className={
            item.active
              ? "text-blue-400"
              : "text-white/40 group-hover:text-white"
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
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white">
              <Settings size={18} />
              Settings
            </button>

            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-sm font-semibold">
                  D
                </div>

                <div>
                  <p className="text-sm font-medium">Data Analyst</p>
                  <p className="text-xs text-white/35">Workspace</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/[0.07] px-6 lg:px-10">
            <div>
              <p className="text-xs text-white/35">Workspace / Overview</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/40 md:flex">
                <span>⌘</span>
                <span>K</span>
                <span className="ml-2">Search</span>
              </div>

              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                <Activity size={16} className="text-white/60" />
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
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs text-blue-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                  AI Analytics Workspace
                </div>

                <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                  Turn data into
                  <span className="ml-2 bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                    decisions.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">
                  Upload your datasets, explore patterns, and ask your AI
                  analyst complex business questions in natural language.
                </p>
              </div>

              <button className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-3 text-sm font-medium shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:shadow-blue-500/30">
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
              className="group relative mt-10 overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.08] via-violet-500/[0.05] to-transparent p-[1px]"
            >
              <div className="relative rounded-2xl bg-[#0B0F1C]/90 px-6 py-10 md:px-10">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl transition group-hover:bg-blue-500/20" />

                <div className="relative flex flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10"
                  >
                    <Upload className="text-blue-400" size={26} />
                  </motion.div>

                  <h3 className="mt-5 text-xl font-semibold">
                    Analyze a new dataset
                  </h3>

                  <p className="mt-2 text-sm text-white/40">
                    Drop a CSV or Excel file here to get started
                  </p>

                  <DatasetUpload
  onUploadSuccess={(data) => {
    setDatasetResult(data);
    setDataset(data);
  }}
/>
                  {datasetResult && (
  <div className="mt-6 grid gap-4 md:grid-cols-4">
    {/* Rows */}
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-gray-400">Rows</p>
      <p className="mt-1 text-3xl font-bold">
        {datasetResult.profile.rows}
      </p>
    </div>

    {/* Columns */}
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-gray-400">Columns</p>
      <p className="mt-1 text-3xl font-bold">
        {datasetResult.profile.columns}
      </p>
    </div>

    {/* Duplicate Rows */}
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-gray-400">Duplicate Rows</p>
      <p className="mt-1 text-3xl font-bold">
        {datasetResult.profile.duplicate_rows}
      </p>
    </div>

    {/* Data Quality */}
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-gray-400">Data Quality</p>

      <p className="mt-1 text-3xl font-bold">
        {datasetResult.profile.quality?.status ?? "Unknown"}
      </p>
    </div>
  </div>
)}
{datasetResult?.profile?.quality?.warnings?.length > 0 && (
  <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
    <p className="text-sm font-semibold text-amber-300">
      Data Quality Warnings
    </p>

    <div className="mt-3 space-y-2">
      {datasetResult.profile.quality.warnings.map(
        (warning: any, index: number) => (
          <p key={index} className="text-sm text-white/60">
            {warning.message}
          </p>
        )
      )}
    </div>
  </div>
)}
{datasetResult?.profile?.column_details?.length > 0 && (
  <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
    <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
      <div>
        <h3 className="text-lg font-semibold text-white">
          Column Analysis
        </h3>

        <p className="mt-1 text-sm text-white/40">
          Overview of your dataset columns and data quality
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50">
        {datasetResult.profile.column_details.length} columns
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              Column
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              Data Type
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              Missing
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              Unique
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              Statistics
            </th>

            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/40">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {datasetResult.profile.column_details.map(
            (column: any, index: number) => (
              <tr
                key={index}
                className="group border-b border-white/5 transition-colors hover:bg-white/[0.04]"
              >
                {/* Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/10 text-xs font-semibold text-blue-300">
                      {column.name.charAt(0).toUpperCase()}
                    </div>

                    <span className="font-medium text-white">
                      {column.name}
                    </span>
                  </div>
                </td>

                {/* Data Type */}
                <td className="px-6 py-4">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">
                    {column.data_type}
                  </span>
                </td>

                {/* Missing */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-white">
                      {column.missing_values}
                    </p>

                    <p className="mt-0.5 text-xs text-white/30">
                      {column.missing_percentage}%
                    </p>
                  </div>
                </td>

                {/* Unique */}
                <td className="px-6 py-4">
                  <span className="text-sm text-white/70">
                    {column.unique_values}
                  </span>
                </td>

                {/* Statistics */}
                <td className="px-6 py-4">
                  {column.statistics ? (
                    <div className="space-y-1 text-xs text-white/50">
                      <p>
                        Min:{" "}
                        <span className="text-white/80">
                          {column.statistics.min}
                        </span>
                      </p>

                      <p>
                        Max:{" "}
                        <span className="text-white/80">
                          {column.statistics.max}
                        </span>
                      </p>

                      <p>
                        Mean:{" "}
                        <span className="text-white/80">
                          {column.statistics.mean}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-white/30">
                      Not applicable
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {column.missing_values === 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Clean
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
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
  <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
      <div>
        <h3 className="text-lg font-semibold text-white">
          Dataset Preview
        </h3>

        <p className="mt-1 text-sm text-white/40">
          Preview of the first rows from your uploaded dataset
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50">
        Preview · {datasetResult.preview.length} of {datasetResult.profile.rows} rows
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            {Object.keys(datasetResult.preview[0]).map(
              (column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/40"
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
                className="border-b border-white/5 transition-colors hover:bg-white/[0.04]"
              >
                {Object.values(row).map(
                  (value: any, columnIndex: number) => (
                    <td
                      key={columnIndex}
                      className="max-w-[250px] truncate whitespace-nowrap px-6 py-4 text-sm text-white/70"
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


                  <p className="mt-3 text-xs text-white/25">
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
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-white/[0.14] hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                        <Icon size={17} className="text-blue-400" />
                      </div>

                      <span className="text-[11px] text-emerald-400">
                        {stat.change}
                      </span>
                    </div>

                    <p className="mt-5 text-sm text-white/40">{stat.label}</p>
                    <p className="mt-1 text-3xl font-semibold">{stat.value}</p>
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
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Recent datasets</h3>
                    <p className="mt-1 text-xs text-white/35">
                      Your latest uploaded data
                    </p>
                  </div>

                  <button className="text-xs text-blue-400 hover:text-blue-300">
                    View all
                  </button>
                </div>

                <div className="mt-6 space-y-2">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.name}
                      className="flex items-center justify-between rounded-xl border border-transparent p-3 transition hover:border-white/[0.07] hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
                          <FileSpreadsheet
                            size={18}
                            className="text-emerald-400"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            {dataset.name}
                          </p>
                          <p className="mt-1 text-xs text-white/30">
                            {dataset.type} · {dataset.rows} ·{" "}
                            {dataset.columns}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-white/25">
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
                className="relative overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.08] to-blue-500/[0.04] p-6"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
                      <Bot size={20} className="text-violet-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold">AI Analyst</h3>
                      <p className="text-xs text-white/35">
                        Ask questions about your data
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-xl border border-white/[0.07] bg-black/20 p-4">
                    <p className="text-xs leading-5 text-white/40">
                      "Why did revenue decline last quarter?"
                    </p>
                  </div>

                  <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/15">
                    <Sparkles size={16} />
                    Open AI Analyst
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}