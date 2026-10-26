
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import {
  Search,
  Upload,
  Database,
  ArrowRight,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";

type Dataset = {
  filename: string;
  file_type?: string;
  size_bytes?: number;
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

  if (typeof body?.detail === "string") return body.detail;
  if (typeof body?.message === "string") return body.message;

  switch (status) {
    case 401:
      return "Authentication is required by the API. Check the backend route configuration.";
    case 403:
      return "The API denied this request. Check backend permissions.";
    case 404:
      return "The requested dataset endpoint was not found. Check the backend route.";
    case 422:
      return "The API rejected the request because some input is missing or invalid.";
    case 500:
      return "The backend encountered an internal error. Check the Render logs.";
    default:
      return `Request failed with HTTP ${status}.`;
  }
}

function normalizeDataset(value: unknown): Dataset | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Record<string, unknown>;

  if (
    typeof item.filename !== "string" ||
    !item.filename.trim()
  ) {
    return null;
  }

  return {
    filename: item.filename,
    file_type:
      typeof item.file_type === "string"
        ? item.file_type
        : undefined,
    size_bytes:
      typeof item.size_bytes === "number"
        ? item.size_bytes
        : undefined,
  };
}

function formatSize(bytes?: number): string {
  if (
    typeof bytes !== "number" ||
    !Number.isFinite(bytes) ||
    bytes < 0
  ) {
    return "Unknown size";
  }

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDatasets = useCallback(
    async (options?: { background?: boolean }) => {
      const background = options?.background ?? false;

      try {
        if (background) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(`${API_URL}/datasets/`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            `Could not load datasets (HTTP ${response.status}): ${getErrorMessage(
              data,
              response.status
            )}`
          );
        }

        const body = data as {
          datasets?: unknown;
        } | null;

        const rawList = Array.isArray(data)
          ? data
          : Array.isArray(body?.datasets)
            ? body.datasets
            : null;

        if (!rawList) {
          throw new Error(
            "The API response did not contain a dataset list. Check the GET /datasets/ response format."
          );
        }

        const normalized = rawList
          .map(normalizeDataset)
          .filter((item): item is Dataset => item !== null);

        setDatasets(normalized);
      } catch (err) {
        console.error("Dataset loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading datasets."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchDatasets();

    // The initial dataset list is loaded when the page mounts.
  }, [fetchDatasets]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  async function handleFileUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const allowedExtensions = [".csv", ".xlsx", ".xls"];

    setError("");
    setSuccess("");

    if (!allowedExtensions.includes(extension)) {
      setError(
        "Unsupported file type. Please select a CSV or Excel file."
      );
      input.value = "";
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      input.value = "";
      return;
    }

    if (uploading) {
      input.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/datasets/upload`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          `Upload failed (HTTP ${response.status}): ${getErrorMessage(
            data,
            response.status
          )}`
        );
      }

      setSuccess(`${file.name} uploaded successfully.`);

      // Refresh the list without clearing the success message.
      await fetchDatasets({ background: true });
    } catch (err) {
      console.error("Dataset upload error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during upload."
      );
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  const filteredDatasets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return datasets.filter((dataset) =>
      dataset.filename.toLowerCase().includes(term)
    );
  }, [datasets, search]);

  return (
    <main
      className="min-h-screen px-5 py-8 md:px-10 md:py-10"
      style={{
        backgroundColor: C.cream,
        color: C.espresso,
      }}
    >
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: C.brown }}
            >
              Data workspace
            </p>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Datasets
            </h1>

            <p
              className="mt-2 text-sm md:text-base"
              style={{ color: C.brown }}
            >
              Manage, explore, and analyze your datasets.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: C.espresso,
              color: C.cream,
            }}
          >
            <Upload size={17} />
            {uploading ? "Uploading..." : "Upload Dataset"}
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-xl border p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderColor: C.brown,
              backgroundColor: "#F0E3D8",
              color: C.espresso,
            }}
          >
            <p className="break-words">{error}</p>

            <button
              type="button"
              onClick={() => void fetchDatasets()}
              disabled={loading || refreshing}
              className="inline-flex shrink-0 items-center gap-2 font-semibold underline underline-offset-4 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Retry
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 rounded-xl border px-4 py-3 text-sm"
            style={{
              borderColor: C.taupe,
              backgroundColor: "#EEE7DA",
              color: C.espresso,
            }}
          >
            {success}
          </div>
        )}

        <section className="mt-8">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: C.brown }}
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search datasets..."
              aria-label="Search datasets"
              className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-2"
              style={{
                backgroundColor: C.surface,
                borderColor: C.taupe,
                color: C.espresso,
              }}
            />
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your datasets</h2>

              <p className="mt-1 text-sm" style={{ color: C.brown }}>
                {loading
                  ? "Retrieving your datasets..."
                  : `${filteredDatasets.length} ${
                      filteredDatasets.length === 1
                        ? "dataset"
                        : "datasets"
                    } shown`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchDatasets({ background: true })}
              disabled={loading || refreshing}
              aria-label="Refresh datasets"
              className="flex h-11 w-11 items-center justify-center rounded-xl transition hover:opacity-75 disabled:opacity-50"
              style={{
                backgroundColor: C.oat,
                color: C.espresso,
              }}
            >
              <RefreshCw
                size={19}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>

          {loading && (
            <div
              className="rounded-2xl border p-10 text-center"
              style={{
                borderColor: C.taupe,
                backgroundColor: C.surface,
              }}
            >
              <RefreshCw
                size={24}
                className="mx-auto animate-spin"
                style={{ color: C.brown }}
              />
              <p className="mt-3 text-sm" style={{ color: C.brown }}>
                Loading datasets...
              </p>
            </div>
          )}

          {!loading && !error && filteredDatasets.length === 0 && (
            <div
              className="rounded-2xl border-2 border-dashed p-10 text-center md:p-14"
              style={{
                borderColor: C.taupe,
                backgroundColor: C.surface,
              }}
            >
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: C.oat,
                  color: C.espresso,
                }}
              >
                <FileSpreadsheet size={26} />
              </div>

              <h3 className="mt-4 font-semibold">
                {search ? "No datasets found" : "No datasets yet"}
              </h3>

              <p className="mt-2 text-sm" style={{ color: C.brown }}>
                {search
                  ? "Try a different search term."
                  : "Upload your first dataset to get started."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: C.brown,
                    color: C.cream,
                  }}
                >
                  <Upload size={16} />
                  Choose a dataset
                </button>
              )}
            </div>
          )}

          {!loading && filteredDatasets.length > 0 && (
            <div className="grid gap-4">
              {filteredDatasets.map((dataset) => (
                <article
                  key={dataset.filename}
                  className="group rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    borderColor: C.taupe,
                    backgroundColor: C.surface,
                  }}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: C.oat,
                          color: C.espresso,
                        }}
                      >
                        <Database size={21} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-all font-semibold">
                          {dataset.filename}
                        </h3>

                        <p
                          className="mt-1 text-sm"
                          style={{ color: C.brown }}
                        >
                          {(dataset.file_type || "file")
                            .replace(/^\./, "")
                            .toUpperCase()}
                          {" · "}
                          {formatSize(dataset.size_bytes)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                      <span
                        className="rounded-full border px-3 py-1 text-xs font-medium"
                        style={{
                          borderColor: C.taupe,
                          backgroundColor: C.cream,
                          color: C.brown,
                        }}
                      >
                        Stored
                      </span>

                      <Link
                        href={`/datasets/${encodeURIComponent(dataset.filename)}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:underline"
                        style={{ color: C.brown }}
                      >
                        Open
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
