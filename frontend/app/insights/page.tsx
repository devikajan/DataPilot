"use client";

import { useDataset } from "@/components/DatasetContext";
import {
  Database,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function InsightsPage() {
  const { dataset } = useDataset();

  if (!dataset) {
    return (
      <main className="min-h-screen bg-[#070a13] p-10 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">
            Insights
          </h1>

          <p className="mt-2 text-white/50">
            Discover insights from your datasets.
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <Database
              size={28}
              className="text-blue-400"
            />

            <h2 className="mt-4 text-xl font-semibold">
              No dataset available
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Upload a dataset from the Overview page to
              generate insights.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { profile } = dataset;

  const numericColumns =
    profile.column_details.filter(
      (column: any) => column.statistics
    );

  const categoricalColumns =
    profile.column_details.filter(
      (column: any) => !column.statistics
    );

  return (
    <main className="min-h-screen bg-[#070a13] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div>
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
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/40">
              Rows
            </p>

            <p className="mt-2 text-3xl font-bold">
              {profile.rows.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/40">
              Columns
            </p>

            <p className="mt-2 text-3xl font-bold">
              {profile.columns}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-white/40">
              Duplicate Rows
            </p>

            <p className="mt-2 text-3xl font-bold">
              {profile.duplicate_rows}
            </p>
          </div>

        </div>

        {/* Dataset Summary */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

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

        </div>

        {/* Column Types */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Numeric */}
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

          {/* Categorical */}
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

        </div>

        {/* Data Quality */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

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
                      className="mt-0.5 text-amber-400"
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

        {/* Numeric Statistics */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

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
                      className="border-b border-white/5"
                    >
                      <td className="px-4 py-4 text-sm font-medium">
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
        </div>

      </div>
    </main>
  );
}