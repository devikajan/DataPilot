
"use client";

import { useEffect, useState } from "react";

type Dataset = {
  id: number;
  filename: string;
  file_type: string;
  row_count: number;
  column_count: number;
  uploaded_at?: string;
  size_bytes?: number;
};

export default function DashboardPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {

        const apiBase = (process.env.NEXT_PUBLIC_API_URL || "https://datapilot-api-sgvj.onrender.com").replace(/\/$/, "");
        const response = await fetch(`${apiBase}/datasets/`);

        if (!response.ok) {
          throw new Error("Unable to load your datasets.");
        }

        const data = await response.json();
        const datasetList: Dataset[] = Array.isArray(data.datasets)
          ? data.datasets
          : Array.isArray(data)
            ? data
            : [];

        if (!cancelled) {
          setDatasets(datasetList);
        }
      } catch (err) {
        console.error("Dashboard loading failed:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading the dashboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
        ? "Good afternoon"
        : "Good evening";

  const totalRows = datasets.reduce(
    (sum, dataset) => sum + (Number(dataset.row_count) || 0),
    0
  );

  const totalColumns = datasets.reduce(
    (sum, dataset) => sum + (Number(dataset.column_count) || 0),
    0
  );

  const totalSize = datasets.reduce(
    (sum, dataset) => sum + (Number(dataset.size_bytes) || 0),
    0
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3ED] text-[#291C0E]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#A99A8C]/45 border-t-[#6E473B]" />
          <p className="mt-4 text-sm text-[#76695D]">
            Preparing your workspace...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F3ED] px-4 py-6 text-[#291C0E] sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#A99A8C]/45 bg-[#E7DCCE] text-xl font-bold text-[#6E473B]">
              D
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">
                DataPilot
              </p>
              <p className="text-xs text-[#76695D]">
                Business intelligence workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/datasets")}
              className="rounded-xl border border-[#D9CCBE] bg-white/70 px-4 py-2.5 text-sm text-[#5C4A3D] transition hover:border-[#6E473B]/60 hover:bg-[#E7DCCE]"
            >
              My datasets
            </button>
          </div>
        </header>

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-[#A99A8C]/50 bg-gradient-to-br from-[#E7DCCE] via-[#F1E8DD] to-[#CDBBA9] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#A99A8C]/25 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full border border-[#A99A8C]/50 bg-[#E7DCCE] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6E473B]">
              Your analytics overview
            </span>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {greeting}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#76695D] sm:text-base">
              Your data, insights, and analysis tools in one workspace.
              Pick up where you left off or start a new analysis.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/ai-analyst")}
                className="rounded-xl bg-[#6E473B] px-5 py-3 text-sm font-semibold text-[#291C0E] shadow-lg shadow-[#6E473B]/15 transition hover:-translate-y-0.5 hover:bg-[#543629]"
              >
                Open AI Analyst →
              </button>
              <button
                onClick={() => navigate("/datasets")}
                className="rounded-xl border border-[#D9CCBE] bg-white/60 px-5 py-3 text-sm font-medium text-[#291C0E] transition hover:bg-[#E7DCCE]"
              >
                Browse datasets
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-red-300 px-3 py-2 hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Workspace overview</h2>
            <p className="mt-1 text-sm text-[#76695D]">
              Live statistics from your uploaded datasets.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Datasets",
                value: datasets.length.toLocaleString(),
                detail: "Uploaded files",
                accent: "text-[#6E473B]",
                icon: "▤",
              },
              {
                label: "Total records",
                value: totalRows.toLocaleString(),
                detail: "Across available datasets",
                accent: "text-[#8B7460]",
                icon: "▦",
              },
              {
                label: "Total columns",
                value: totalColumns.toLocaleString(),
                detail: "Across available datasets",
                accent: "text-[#8B7460]",
                icon: "▥",
              },
              {
                label: "Storage used",
                value: formatSize(totalSize),
                detail: "Size of stored dataset files",
                accent: "text-[#6E473B]",
                icon: "▣",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group rounded-2xl border border-[#D9CCBE] bg-white/65 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#A99A8C]/45 hover:bg-white/70"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#76695D]">{stat.label}</p>
                  <span className={`text-xl ${stat.accent}`}>
                    {stat.icon}
                  </span>
                </div>
                <p className="mt-5 break-words text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs text-[#8A7B6C]">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Your datasets</h2>
              <p className="mt-1 text-sm text-[#76695D]">
                Open a dataset or start exploring your data.
              </p>
            </div>
            <button
              onClick={() => navigate("/datasets")}
              className="text-sm font-medium text-[#6E473B] transition hover:text-[#291C0E]"
            >
              View all datasets →
            </button>
          </div>

          {datasets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D9CCBE] bg-white/55 px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#A99A8C]/50 bg-[#E7DCCE] text-xl text-[#6E473B]">
                +
              </div>
              <h3 className="mt-4 font-medium">Your workspace is ready</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#76695D]">
                Upload a CSV or Excel file to start exploring your data
                with DataPilot.
              </p>
              <button
                onClick={() => navigate("/ai-analyst")}
                className="mt-5 rounded-xl bg-[#6E473B] px-5 py-3 text-sm font-semibold transition hover:bg-[#543629]"
              >
                Upload a dataset →
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#D9CCBE] bg-white/55">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="border-b border-[#D9CCBE] bg-white/65">
                    <tr>
                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-[#76695D]">
                        Dataset
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-[#76695D]">
                        Rows
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-[#76695D]">
                        Columns
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-[#76695D]">
                        File size
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-[#76695D]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#E7DCCE] transition last:border-b-0 hover:bg-[#F5EEE6]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D9CCBE] bg-[#E7DCCE] text-xs font-semibold text-[#6E473B]">
                              {item.file_type || "FILE"}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate text-sm font-medium text-[#291C0E]">
                                {item.filename}
                              </p>
                              <p className="mt-1 text-xs text-[#8A7B6C]">
                                {formatDate(item.uploaded_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right text-sm tabular-nums text-[#5C4A3D]">
                          {(Number(item.row_count) || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-right text-sm tabular-nums text-[#5C4A3D]">
                          {(Number(item.column_count) || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-[#76695D]">
                          {formatSize(Number(item.size_bytes) || 0)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => navigate("/ai-analyst")}
                            className="whitespace-nowrap rounded-lg border border-[#A99A8C]/50 bg-[#E7DCCE] px-3 py-2 text-xs font-medium text-[#6E473B] transition hover:bg-[#A99A8C]/25"
                          >
                            Analyze →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Quick access</h2>
            <p className="mt-1 text-sm text-[#76695D]">
              Choose a tool for your next task.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI Analyst",
                description: "Ask questions and discover patterns in your data.",
                tag: "AI-powered",
                path: "/ai-analyst",
                color: "border-[#A99A8C]/50 hover:border-blue-400/35",
              },
              {
                title: "Chart Tool",
                description: "Create visualizations from dataset columns.",
                tag: "Visualization",
                path: "/chart-tool",
                color: "border-[#CDBBA9] hover:border-[#6E473B]/60",
              },
              {
                title: "Insights",
                description: "Explore analytical summaries and findings.",
                tag: "Analytics",
                path: "/insights",
                color: "border-[#CDBBA9] hover:border-[#6E473B]/60",
              },
            ].map((tool) => (
              <button
                key={tool.title}
                onClick={() => navigate(tool.path)}
                className={`rounded-2xl border bg-white/55 p-5 text-left transition duration-300 hover:-translate-y-1 hover:bg-white/70 ${tool.color}`}
              >
                <span className="rounded-full border border-[#D9CCBE] bg-white/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#76695D]">
                  {tool.tag}
                </span>
                <h3 className="mt-4 font-semibold">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#76695D]">
                  {tool.description}
                </p>
                <p className="mt-4 text-xs font-medium text-[#6E473B]">
                  Open tool →
                </p>
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-[#D9CCBE] py-5 text-center text-xs text-[#8A7B6C]">
          DataPilot · Your AI-powered analytics workspace
        </footer>
      </div>
    </main>
  );
}
