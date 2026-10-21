
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";

type User = {
  id: number;
  name: string;
  email: string;
};

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
  const [user, setUser] = useState<User | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          window.location.href = "/login";
          return;
        }

        if (cancelled) return;
        setUser(currentUser);

        const token = localStorage.getItem("access_token");

        const response = await fetch(
          "http://127.0.0.1:8000/datasets/",
          {
            headers: {
              Authorization: `Bearer ${token ?? ""}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          window.location.href = "/login";
          return;
        }

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
      <main className="flex min-h-screen items-center justify-center bg-[#070a13] text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-blue-400/20 border-t-blue-400" />
          <p className="mt-4 text-sm text-slate-400">
            Preparing your workspace...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070a13] px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-xl font-bold text-blue-300">
              D
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">
                DataPilot
              </p>
              <p className="text-xs text-slate-500">
                Business intelligence workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/datasets")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10"
            >
              My datasets
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
              }}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 transition hover:border-red-400/30 hover:text-red-300"
            >
              Log out
            </button>
          </div>
        </header>

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-600/20 via-indigo-500/[0.08] to-[#101525] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300">
              Your analytics overview
            </span>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {greeting}
              {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Your data, insights, and analysis tools in one workspace.
              Pick up where you left off or start a new analysis.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/ai-analyst")}
                className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                Open AI Analyst →
              </button>
              <button
                onClick={() => navigate("/datasets")}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Browse datasets
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-500/[0.06] p-4 text-sm text-red-300">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-red-400/20 px-3 py-2 hover:bg-red-500/10"
            >
              Retry
            </button>
          </div>
        )}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Workspace overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Live statistics from your uploaded datasets.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Datasets",
                value: datasets.length.toLocaleString(),
                detail: "Uploaded files",
                accent: "text-blue-300",
                icon: "▤",
              },
              {
                label: "Total records",
                value: totalRows.toLocaleString(),
                detail: "Across available datasets",
                accent: "text-violet-300",
                icon: "▦",
              },
              {
                label: "Total columns",
                value: totalColumns.toLocaleString(),
                detail: "Across available datasets",
                accent: "text-cyan-300",
                icon: "▥",
              },
              {
                label: "Storage used",
                value: formatSize(totalSize),
                detail: "Size of stored dataset files",
                accent: "text-emerald-300",
                icon: "▣",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <span className={`text-xl ${stat.accent}`}>
                    {stat.icon}
                  </span>
                </div>
                <p className="mt-5 break-words text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs text-slate-600">
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
              <p className="mt-1 text-sm text-slate-500">
                Open a dataset or start exploring your data.
              </p>
            </div>
            <button
              onClick={() => navigate("/datasets")}
              className="text-sm font-medium text-blue-300 transition hover:text-blue-200"
            >
              View all datasets →
            </button>
          </div>

          {datasets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-xl text-blue-300">
                +
              </div>
              <h3 className="mt-4 font-medium">Your workspace is ready</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Upload a CSV or Excel file to start exploring your data
                with DataPilot.
              </p>
              <button
                onClick={() => navigate("/ai-analyst")}
                className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold transition hover:bg-blue-400"
              >
                Upload a dataset →
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="border-b border-white/[0.08] bg-white/[0.025]">
                    <tr>
                      <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Dataset
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Rows
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Columns
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        File size
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/[0.05] transition last:border-b-0 hover:bg-blue-500/[0.035]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.08] text-xs font-semibold text-blue-300">
                              {item.file_type || "FILE"}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate text-sm font-medium text-slate-200">
                                {item.filename}
                              </p>
                              <p className="mt-1 text-xs text-slate-600">
                                {formatDate(item.uploaded_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right text-sm tabular-nums text-slate-300">
                          {(Number(item.row_count) || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-right text-sm tabular-nums text-slate-300">
                          {(Number(item.column_count) || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-slate-400">
                          {formatSize(Number(item.size_bytes) || 0)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => navigate("/ai-analyst")}
                            className="whitespace-nowrap rounded-lg border border-blue-400/15 bg-blue-500/[0.07] px-3 py-2 text-xs font-medium text-blue-300 transition hover:bg-blue-500/15"
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
            <p className="mt-1 text-sm text-slate-500">
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
                color: "border-blue-400/15 hover:border-blue-400/35",
              },
              {
                title: "Chart Tool",
                description: "Create visualizations from dataset columns.",
                tag: "Visualization",
                path: "/chart-tool",
                color: "border-violet-400/15 hover:border-violet-400/35",
              },
              {
                title: "Insights",
                description: "Explore analytical summaries and findings.",
                tag: "Analytics",
                path: "/insights",
                color: "border-emerald-400/15 hover:border-emerald-400/35",
              },
            ].map((tool) => (
              <button
                key={tool.title}
                onClick={() => navigate(tool.path)}
                className={`rounded-2xl border bg-white/[0.02] p-5 text-left transition duration-300 hover:-translate-y-1 hover:bg-white/[0.04] ${tool.color}`}
              >
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {tool.tag}
                </span>
                <h3 className="mt-4 font-semibold">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {tool.description}
                </p>
                <p className="mt-4 text-xs font-medium text-blue-300">
                  Open tool →
                </p>
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-white/[0.06] py-5 text-center text-xs text-slate-600">
          DataPilot · Your AI-powered analytics workspace
        </footer>
      </div>
    </main>
  );
}
