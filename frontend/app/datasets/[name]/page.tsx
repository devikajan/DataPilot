
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Database,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

type Tab = "Overview" | "Profile" | "Preview";

type QualityWarning = {
  message?: string;
  count?: number;
};

type ColumnProfile = {
  name: string;
  data_type?: string;
  missing_values?: number;
  unique_values?: number;
  statistics?: Record<string, unknown> | null;
};

type DatasetProfile = {
  rows?: number;
  columns?: number;
  duplicate_rows?: number;
  quality?: {
    status?: string;
    warnings?: QualityWarning[];
  };
  column_details?: ColumnProfile[];
};

type Dataset = {
  filename: string;
  profile?: DatasetProfile;
  preview?: Record<string, unknown>[];
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://datapilot-api-sgvj.onrender.com"
)
  .trim()
  .replace(/^http:\/\/https:\/\//i, "https://")
  .replace(/\/+$/, "");

const C = {
  cream: "#E7DCCE",
  oat: "#CDBBA9",
  taupe: "#A99A8C",
  espresso: "#291C0E",
  brown: "#6E473B",
  surface: "#F7F1E8",
};

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function getErrorMessage(data: unknown, status: number): string {
  const body = data as {
    detail?: unknown;
    message?: unknown;
  } | null;

  if (typeof body?.detail === "string") return body.detail;
  if (typeof body?.message === "string") return body.message;

  if (Array.isArray(body?.detail)) {
    return body.detail
      .map((item: { loc?: unknown[]; msg?: string }) => {
        const location = item.loc?.join(" → ");
        return location
          ? `${location}: ${item.msg || "Invalid input"}`
          : item.msg || "Invalid input";
      })
      .join("; ");
  }

  switch (status) {
    case 401:
      return "The API requires authentication. Check the backend route configuration.";
    case 403:
      return "The API denied access to this dataset.";
    case 404:
      return "Dataset not found. It may have been removed, or the backend route may be incorrect.";
    case 500:
      return "The backend encountered an error. Check the Render logs.";
    default:
      return `Could not load the dataset (HTTP ${status}).`;
  }
}

function formatNumber(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString();
  }

  return value == null ? "—" : String(value);
}

function formatBytes(value: unknown): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "Unknown";
  }

  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DatasetDetailsPage() {
  const params = useParams<{ name: string | string[] }>();

  const rawName = Array.isArray(params.name)
    ? params.name[0]
    : params.name;

  const filename = rawName ? decodeURIComponent(rawName) : "";

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!filename) {
      setError("No dataset filename was provided.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchDataset() {
      try {
        setLoading(true);
        setError("");
        setDataset(null);

        const response = await fetch(
          `${API_URL}/datasets/${encodeURIComponent(filename)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, response.status)
          );
        }

        const result = data as Partial<Dataset> | null;

        if (!result || typeof result !== "object") {
          throw new Error("The server returned an invalid dataset response.");
        }

        if (
          result.filename &&
          typeof result.filename !== "string"
        ) {
          throw new Error("The server returned an invalid filename.");
        }

        setDataset({
          filename:
            typeof result.filename === "string"
              ? result.filename
              : filename,
          profile: result.profile ?? {},
          preview: Array.isArray(result.preview)
            ? result.preview.filter(
                (row): row is Record<string, unknown> =>
                  !!row && typeof row === "object" && !Array.isArray(row)
              )
            : [],
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Dataset details error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not load dataset details."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchDataset();

    return () => controller.abort();
  }, [filename]);

  const profile = dataset?.profile ?? {};
  const quality = profile.quality ?? {};
  const warnings = Array.isArray(quality.warnings)
    ? quality.warnings
    : [];
  const columns = Array.isArray(profile.column_details)
    ? profile.column_details
    : [];
  const preview = dataset?.preview ?? [];

  const isQualityGood =
    quality.status === "good" && warnings.length === 0;

  const panelStyle = {
    borderColor: C.taupe,
    backgroundColor: C.surface,
  };

  const mutedStyle = { color: C.brown };

  if (loading) {
    return (
      <main
        className="min-h-screen px-5 py-8 md:px-10 md:py-10"
        style={{ backgroundColor: C.cream, color: C.espresso }}
      >
        <div className="mx-auto max-w-7xl">
          <Link
            href="/datasets"
            className="inline-flex items-center gap-2 text-sm transition hover:opacity-70"
            style={mutedStyle}
          >
            <ArrowLeft size={16} />
            Back to Datasets
          </Link>

          <div
            className="mt-10 rounded-2xl border p-10 text-center"
            style={panelStyle}
          >
            <RefreshCw
              size={25}
              className="mx-auto animate-spin"
              style={mutedStyle}
            />
            <p className="mt-4 text-sm" style={mutedStyle}>
              Loading dataset...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !dataset) {
    return (
      <main
        className="min-h-screen px-5 py-8 md:px-10 md:py-10"
        style={{ backgroundColor: C.cream, color: C.espresso }}
      >
        <div className="mx-auto max-w-7xl">
          <Link
            href="/datasets"
            className="inline-flex items-center gap-2 text-sm transition hover:opacity-70"
            style={mutedStyle}
          >
            <ArrowLeft size={16} />
            Back to Datasets
          </Link>

          <div
            role="alert"
            className="mt-10 rounded-2xl border p-8"
            style={{
              borderColor: "#C98A78",
              backgroundColor: "#F0E3D8",
            }}
          >
            <AlertTriangle size={26} style={{ color: C.brown }} />

            <h1 className="mt-4 text-xl font-bold">
              Dataset unavailable
            </h1>

            <p className="mt-2 break-words text-sm" style={mutedStyle}>
              {error || "The requested dataset could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: C.brown, color: C.cream }}
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-5 py-8 md:px-10 md:py-10"
      style={{ backgroundColor: C.cream, color: C.espresso }}
    >
      <div className="mx-auto max-w-7xl">
        <Link
          href="/datasets"
          className="inline-flex items-center gap-2 text-sm transition hover:opacity-70"
          style={mutedStyle}
        >
          <ArrowLeft size={16} />
          Back to Datasets
        </Link>

        <header className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: C.oat, color: C.espresso }}
            >
              <Database size={23} />
            </div>

            <div className="min-w-0">
              <h1 className="break-all text-2xl font-bold md:text-3xl">
                {dataset.filename}
              </h1>
              <p className="mt-1 text-sm" style={mutedStyle}>
                Dataset details and data quality analysis
              </p>
            </div>
          </div>

          <Link
            href={`/insights?dataset=${encodeURIComponent(filename)}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-85"
            style={{ backgroundColor: C.brown, color: C.cream }}
          >
            <BarChart3 size={18} />
            Open Insights
            <ArrowRight size={16} />
          </Link>
        </header>

        <nav
          aria-label="Dataset detail sections"
          className="mt-10 flex gap-6 overflow-x-auto border-b"
          style={{ borderColor: C.taupe }}
        >
          {(["Overview", "Profile", "Preview"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? "page" : undefined}
              className="shrink-0 border-b-2 px-1 pb-4 text-sm font-semibold transition"
              style={{
                borderColor:
                  activeTab === tab ? C.brown : "transparent",
                color: activeTab === tab ? C.espresso : C.brown,
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === "Overview" && (
          <section className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Rows",
                  value: formatNumber(profile.rows),
                },
                {
                  label: "Columns",
                  value: formatNumber(profile.columns),
                },
                {
                  label: "Duplicate rows",
                  value: formatNumber(profile.duplicate_rows),
                },
                {
                  label: "File size",
                  value: formatBytes(
                    (dataset as Dataset & { size_bytes?: number }).size_bytes
                  ),
                },
              ].map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border p-6"
                  style={panelStyle}
                >
                  <p className="text-sm" style={mutedStyle}>
                    {item.label}
                  </p>
                  <p className="mt-2 break-words text-2xl font-bold">
                    {item.value}
                  </p>
                </article>
              ))}
            </div>

            <section className="rounded-2xl border p-6" style={panelStyle}>
              <h2 className="text-lg font-bold">Data quality</h2>

              <div className="mt-4 flex items-center gap-2">
                {isQualityGood ? (
                  <CheckCircle2 size={20} style={{ color: "#387653" }} />
                ) : (
                  <AlertTriangle size={20} style={{ color: "#A66A24" }} />
                )}

                <span className="font-semibold">
                  {isQualityGood ? "Good" : "Review recommended"}
                </span>
              </div>

              {warnings.length === 0 ? (
                <p className="mt-3 text-sm" style={mutedStyle}>
                  No data quality warnings were returned by the API.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {warnings.map((warning, index) => (
                    <div
                      key={`${warning.message ?? "warning"}-${index}`}
                      className="rounded-xl border p-4"
                      style={{
                        borderColor: C.taupe,
                        backgroundColor: C.cream,
                      }}
                    >
                      <p className="text-sm font-medium">
                        {warning.message || "Data quality warning"}
                      </p>

                      {warning.count !== undefined && (
                        <p className="mt-1 text-xs" style={mutedStyle}>
                          Count: {formatNumber(warning.count)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        )}

        {activeTab === "Profile" && (
          <section className="mt-8 rounded-2xl border p-6" style={panelStyle}>
            <h2 className="text-lg font-bold">Column profile</h2>

            {columns.length === 0 ? (
              <div className="py-10 text-center">
                <FileSpreadsheet
                  size={28}
                  className="mx-auto"
                  style={mutedStyle}
                />
                <p className="mt-3 text-sm" style={mutedStyle}>
                  No column profile information is available.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {columns.map((column, index) => (
                  <article
                    key={`${column.name}-${index}`}
                    className="rounded-xl border p-5"
                    style={{
                      borderColor: C.taupe,
                      backgroundColor: C.cream,
                    }}
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold">
                          {column.name}
                        </h3>
                        <p className="mt-1 text-xs" style={mutedStyle}>
                          Type: {column.data_type || "Unknown"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs" style={mutedStyle}>
                        <span>
                          Missing: {formatNumber(column.missing_values)}
                        </span>
                        <span>
                          Unique: {formatNumber(column.unique_values)}
                        </span>
                      </div>
                    </div>

                    {column.statistics &&
                      Object.keys(column.statistics).length > 0 && (
                        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                          {["min", "max", "mean", "median"].map((key) => (
                            <div
                              key={key}
                              className="rounded-lg border p-3"
                              style={{
                                borderColor: C.taupe,
                                backgroundColor: C.surface,
                              }}
                            >
                              <p
                                className="text-xs capitalize"
                                style={mutedStyle}
                              >
                                {key}
                              </p>
                              <p className="mt-1 break-words text-sm font-medium">
                                {formatNumber(column.statistics?.[key])}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Preview" && (
          <section
            className="mt-8 overflow-hidden rounded-2xl border"
            style={panelStyle}
          >
            <div className="border-b p-6" style={{ borderColor: C.taupe }}>
              <h2 className="text-lg font-bold">Dataset preview</h2>
              <p className="mt-1 text-sm" style={mutedStyle}>
                Showing {preview.length} preview rows
              </p>
            </div>

            {preview.length === 0 ? (
              <div className="p-10 text-center">
                <FileSpreadsheet
                  size={28}
                  className="mx-auto"
                  style={mutedStyle}
                />
                <p className="mt-3 text-sm" style={mutedStyle}>
                  No preview data is available.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ backgroundColor: C.cream }}>
                      {Object.keys(preview[0]).map((column) => (
                        <th
                          key={column}
                          className="whitespace-nowrap border-b px-5 py-4 font-semibold"
                          style={{
                            borderColor: C.taupe,
                            color: C.brown,
                          }}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {preview.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b last:border-0"
                        style={{ borderColor: `${C.taupe}80` }}
                      >
                        {Object.keys(preview[0]).map((column) => (
                          <td
                            key={column}
                            className="max-w-xs break-words px-5 py-4"
                          >
                            {row[column] == null
                              ? "—"
                              : String(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
