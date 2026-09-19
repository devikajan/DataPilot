"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload, X } from "lucide-react";

export default function DatasetUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const extension = selectedFile.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !["csv", "xls", "xlsx"].includes(extension || "")
    ) {
      setMessage("Please select a CSV or Excel file.");
      return;
    }

    setFile(selectedFile);
    setMessage("");
  };

  const uploadDataset = async () => {
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/datasets/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed.");
      }

      setMessage(
        `Uploaded successfully: ${data.profile.rows} rows × ${data.profile.columns} columns`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        className="hidden"
        onChange={(event) =>
          handleFileChange(event.target.files?.[0])
        }
      />

      {!file ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-blue-50"
        >
          <Upload size={16} />
          Upload Dataset
        </button>
      ) : (
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet
                size={20}
                className="text-emerald-400"
              />

              <div className="text-left">
                <p className="max-w-[220px] truncate text-sm font-medium">
                  {file.name}
                </p>

                <p className="text-xs text-white/30">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setMessage("");
              }}
              className="text-white/30 transition hover:text-white"
            >
              <X size={17} />
            </button>
          </div>

          <button
            type="button"
            onClick={uploadDataset}
            disabled={uploading}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3 text-sm font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Analyzing dataset..." : "Upload & Analyze"}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-4 text-center text-sm text-white/50">
          {message}
        </p>
      )}
    </div>
  );
}