"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Database,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

type Tab = "Overview" | "Profile" | "Preview";

type Dataset = {
  filename: string;
  profile: any;
  preview: any[];
};

export default function DatasetDetailsPage() {
  const params = useParams();

  const filename = decodeURIComponent(
    params.name as string
  );

  const [dataset, setDataset] = useState<Dataset | null>(
    null
  );

  const [activeTab, setActiveTab] =
    useState<Tab>("Overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:8000/datasets/${encodeURIComponent(
            filename
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Could not load dataset."
          );
        }

        setDataset(data);
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

    if (filename) {
      fetchDataset();
    }
  }, [filename]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070a13] px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-7xl">

          <Link
            href="/datasets"
            className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Datasets
          </Link>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-sm text-white/40">
              Loading dataset...
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

          <Link
            href="/datasets"
            className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Datasets
          </Link>

          <div className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/5 p-8">
            <h1 className="text-xl font-semibold">
              Dataset unavailable
            </h1>

            <p className="mt-2 text-sm text-red-300">
              {error || "The requested dataset could not be loaded."}
            </p>
          </div>

        </div>
      </main>
    );
  }

  const profile = dataset.profile;

  return (
    <main className="min-h-screen bg-[#070a13] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          href="/datasets"
          className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Datasets
        </Link>

        {/* Header */}
        <div className="mt-8 flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
            <Database
              size={22}
              className="text-blue-300"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              {dataset.filename}
            </h1>

            <p className="mt-1 text-sm text-white/40">
              Dataset details and analysis
            </p>
          </div>

        </div>

        {/* Tabs */}
        <div className="mt-10 flex gap-6 border-b border-white/10">

          {(["Overview", "Profile", "Preview"] as Tab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 pb-4 text-sm font-medium transition ${
                  activeTab === tab
                    ? "border-blue-400 text-white"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
              >
                {tab}
              </button>
            )
          )}

        </div>

        {/* OVERVIEW */}
        {activeTab === "Overview" && (
          <div className="mt-8 space-y-6">

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/40">
                  Rows
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {profile.rows.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/40">
                  Columns
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {profile.columns}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/40">
                  Duplicate Rows
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {profile.duplicate_rows}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-white/40">
                  Data Quality
                </p>

                <div className="mt-2 flex items-center gap-2">

                  {profile.quality.status === "good" ? (
                    <>
                      <CheckCircle2
                        size={20}
                        className="text-emerald-400"
                      />

                      <span className="font-semibold text-emerald-300">
                        Good
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle
                        size={20}
                        className="text-amber-400"
                      />

                      <span className="font-semibold text-amber-300">
                        Warning
                      </span>
                    </>
                  )}

                </div>
              </div>

            </div>

            {/* Quality */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <h2 className="text-lg font-semibold">
                Data Quality
              </h2>

              {profile.quality.warnings.length === 0 ? (
                <div className="mt-4 flex items-center gap-3 text-emerald-300">
                  <CheckCircle2 size={20} />

                  <span>
                    No data quality issues detected.
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

            </div>

          </div>
        )}

        {/* PROFILE */}
        {activeTab === "Profile" && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <h2 className="text-lg font-semibold">
              Column Profile
            </h2>

            <div className="mt-6 space-y-4">

              {profile.column_details.map(
                (column: any) => (
                  <div
                    key={column.name}
                    className="rounded-xl border border-white/10 bg-black/10 p-5"
                  >

                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                      <div>
                        <h3 className="font-medium">
                          {column.name}
                        </h3>

                        <p className="mt-1 text-xs text-white/40">
                          Type: {column.data_type}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-white/50">

                        <span>
                          Missing: {column.missing_values}
                        </span>

                        <span>
                          Unique: {column.unique_values}
                        </span>

                      </div>

                    </div>

                    {column.statistics && (
                      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">

                        {[
                          ["Min", column.statistics.min],
                          ["Max", column.statistics.max],
                          ["Mean", column.statistics.mean],
                          ["Median", column.statistics.median],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-lg bg-white/[0.04] p-3"
                          >
                            <p className="text-xs text-white/30">
                              {label}
                            </p>

                            <p className="mt-1 text-sm">
                              {String(value ?? "—")}
                            </p>
                          </div>
                        ))}

                      </div>
                    )}

                  </div>
                )
              )}

            </div>
          </div>
        )}

        {/* PREVIEW */}
        {activeTab === "Preview" && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

            <div className="border-b border-white/10 p-6">

              <h2 className="text-lg font-semibold">
                Dataset Preview
              </h2>

              <p className="mt-1 text-sm text-white/40">
                First {dataset.preview.length} rows
              </p>

            </div>

            {dataset.preview.length === 0 ? (
              <div className="p-8 text-center text-sm text-white/40">
                No preview data available.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="border-b border-white/10 bg-white/[0.03]">

                    <tr>
                      {Object.keys(
                        dataset.preview[0]
                      ).map((column) => (
                        <th
                          key={column}
                          className="px-5 py-4 font-medium text-white/60"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>

                  </thead>

                  <tbody>

                    {dataset.preview.map(
                      (row: any, rowIndex: number) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-white/5 last:border-0"
                        >

                          {Object.keys(row).map(
                            (column) => (
                              <td
                                key={column}
                                className="px-5 py-4 text-white/70"
                              >
                                {String(
                                  row[column] ?? ""
                                )}
                              </td>
                            )
                          )}

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}