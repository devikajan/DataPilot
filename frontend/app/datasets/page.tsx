"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Upload,
  Database,
  ArrowRight,
} from "lucide-react";

type Dataset = {
  filename: string;
  file_type: string;
  size_bytes: number;
};

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/datasets/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch datasets");
      }

      const data = await response.json();

      setDatasets(data.datasets ?? []);
    } catch (err) {
      console.error(err);
      setError("Could not load datasets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedExtensions = [
      ".csv",
      ".xlsx",
      ".xls",
    ];

    const extension =
      "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError(
        "Unsupported file type. Please upload a CSV or Excel file."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/datasets/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Dataset upload failed."
        );
      }

      await fetchDatasets();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Dataset upload failed."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  const filteredDatasets = useMemo(() => {
    return datasets.filter((dataset) =>
      dataset.filename
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [datasets, search]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload Button */}
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={17} />

            {uploading
              ? "Uploading..."
              : "Upload Dataset"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mt-8">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
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
              {datasets.length}{" "}
              {datasets.length === 1
                ? "dataset"
                : "datasets"}{" "}
              available
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-sm text-white/40">
                Loading datasets...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            filteredDatasets.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

                <Database
                  size={32}
                  className="mx-auto text-white/20"
                />

                <h3 className="mt-4 font-medium text-white">
                  {search
                    ? "No datasets found"
                    : "No datasets yet"}
                </h3>

                <p className="mt-2 text-sm text-white/30">
                  {search
                    ? "Try a different search term."
                    : "Upload your first dataset to get started."}
                </p>

              </div>
            )}

          {/* Dataset Cards */}
          {!loading &&
            filteredDatasets.length > 0 && (
              <div className="grid gap-4">

                {filteredDatasets.map((dataset) => (
                  <div
                    key={dataset.filename}
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
                            {dataset.filename}
                          </h3>

                          <p className="mt-1 text-sm text-white/40">
                            {dataset.file_type
                              .replace(".", "")
                              .toUpperCase()}
                            {" · "}
                            {formatSize(
                              dataset.size_bytes
                            )}
                          </p>
                        </div>

                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4">

                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                          Stored
                        </span>

                        <Link
                          href={`/datasets/${encodeURIComponent(
                            dataset.filename
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
            )}

        </div>
      </div>
    </main>
  );
}