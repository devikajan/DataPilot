"use client";

import Link from "next/link";
import { useDataset } from "@/components/DatasetContext";
import {
  Search,
  Upload,
  Database,
  ArrowRight,
} from "lucide-react";

const mockDatasets = [
  {
    name: "Ground Water",
    rows: 33,
    columns: 1,
    quality: "Warning",
    updated: "Just now",
  },
  {
    name: "Sales Analytics",
    rows: 10240,
    columns: 12,
    quality: "Good",
    updated: "2 days ago",
  },
  {
    name: "Customer Data",
    rows: 5820,
    columns: 9,
    quality: "Good",
    updated: "5 days ago",
  },
];

export default function DatasetsPage() {
  const { dataset } = useDataset();
  const datasets = dataset
  ? [
      {
        name: dataset.filename,
        rows: dataset.profile.rows,
        columns: dataset.profile.columns,
        quality:
          dataset.profile.quality.status === "good"
            ? "Good"
            : "Warning",
        updated: "Just now",
      },
      ...mockDatasets,
    ]
  : mockDatasets;

  return (
    <main className="min-h-screen bg-[#070a13] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Datasets
            </h1>

            <p className="mt-2 text-sm text-white/40">
              Manage, explore, and analyze your datasets.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-400">
            <Upload size={17} />
            Upload Dataset
          </button>
        </div>

        {/* Search */}
        <div className="mt-8">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              type="text"
              placeholder="Search datasets..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400/40"
            />
          </div>
        </div>

        {/* Dataset Section */}
        <div className="mt-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Your datasets
            </h2>

            <p className="mt-1 text-sm text-white/30">
              {datasets.length} datasets available
            </p>
          </div>

          {/* Dataset Cards */}
          <div className="grid gap-4">
            {datasets.map((dataset) => (
              <div
                key={dataset.name}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  {/* Dataset Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
                      <Database
                        size={20}
                        className="text-blue-300"
                      />
                    </div>

                    <div>
                      <h3 className="font-medium text-white">
                        {dataset.name}
                      </h3>

                      <p className="mt-1 text-sm text-white/40">
                        {dataset.rows.toLocaleString()} rows
                        {" · "}
                        {dataset.columns}{" "}
                        {dataset.columns === 1
                          ? "column"
                          : "columns"}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4">

                    {/* Quality */}
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        dataset.quality === "Good"
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {dataset.quality}
                    </span>

                    {/* Updated */}
                    <span className="text-xs text-white/30">
                      {dataset.updated}
                    </span>

                    {/* Open */}
                    <Link
                      href={`/datasets/${encodeURIComponent(
                        dataset.name
                      )}`}
                      className="inline-flex items-center gap-1.5 text-sm text-white/50 transition group-hover:text-white"
                    >
                      Open
                      <ArrowRight size={15} />
                    </Link>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}