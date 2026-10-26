
"use client";

import { useRef, useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type UploadResponse = {
  filename: string;
  message?: string;
  profile: {
    rows: number;
    columns: number;
    [key: string]: unknown;
  };
  preview?: Record<string, unknown>[];
  [key: string]: unknown;
};

type DatasetUploadProps = {
  onUploadSuccess: (data: UploadResponse) => void;
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://datapilot-api-sgvj.onrender.com"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/^http:\/\/https:\/\//i, "https://");

const MAX_FILE_SIZE_MB = 25;

export default function DatasetUpload({
  onUploadSuccess,
}: DatasetUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "">("");

  const handleFileChange = (selectedFile?: File) => {
    if (!selectedFile) return;

    setMessage("");
    setStatus("");

    const extension = selectedFile.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (!["csv", "xls", "xlsx"].includes(extension || "")) {
      setFile(null);
      setMessage("Please select a CSV, XLS, or XLSX file.");
      setStatus("error");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setMessage("The selected file is empty.");
      setStatus("error");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFile(null);
      setMessage(`File size must not exceed ${MAX_FILE_SIZE_MB} MB.`);
      setStatus("error");
      return;
    }

    setFile(selectedFile);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadDataset = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setMessage("Uploading and analyzing your dataset...");
    setStatus("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/datasets/upload`, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();
      let data: any = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `The server returned an invalid response (HTTP ${response.status}).`
          );
        }
      }

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : typeof data.message === "string"
              ? data.message
              : `Upload failed with status ${response.status}.`;

        throw new Error(detail);
      }

      if (!data.filename || !data.profile) {
        throw new Error(
          "The server response is missing the dataset filename or profile."
        );
      }

      setMessage(
        `Uploaded successfully: ${data.profile.rows ?? 0} rows × ${
          data.profile.columns ?? 0
        } columns`
      );
      setStatus("success");

      onUploadSuccess(data);
    } catch (error) {
      console.error("Dataset upload error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );
      setStatus("error");
    } finally {
      setUploading(false);
    }
  };

  const resetFile = () => {
    if (uploading) return;

    setFile(null);
    setMessage("");
    setStatus("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative w-full">
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
          disabled={uploading}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6E473B] px-7 py-3.5 text-sm font-semibold text-[#F7F1E8] shadow-sm transition hover:bg-[#57372E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={17} />
          Choose Dataset
        </button>
      ) : (
        <div className="mx-auto mt-6 w-full max-w-md rounded-2xl border border-[#A99A8C]/50 bg-[#F7F1E8] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#CDBBA9]/50">
                <FileSpreadsheet
                  size={22}
                  className="text-[#6E473B]"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#291C0E]">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-[#6E473B]/80">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetFile}
              disabled={uploading}
              aria-label="Remove selected file"
              className="shrink-0 rounded-lg p-2 text-[#6E473B]/70 transition hover:bg-[#CDBBA9]/40 hover:text-[#291C0E] disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={uploadDataset}
            disabled={uploading}
            className="mt-5 w-full rounded-xl bg-[#6E473B] px-5 py-3.5 text-sm font-bold text-[#F7F1E8] shadow-sm transition hover:bg-[#57372E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Uploading & Analyzing..." : "Upload & Analyze"}
          </button>
        </div>
      )}

      {message && (
        <div
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mx-auto mt-4 flex max-w-md items-start gap-2 rounded-xl border p-3 text-sm ${
            status === "success"
              ? "border-[#6E473B]/20 bg-[#CDBBA9]/30 text-[#57372E]"
              : status === "error"
                ? "border-red-800/20 bg-red-100/60 text-red-900"
                : "border-[#A99A8C]/30 bg-[#F7F1E8] text-[#6E473B]"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : status === "error" ? (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <Upload size={18} className="mt-0.5 shrink-0" />
          )}

          <p className="break-words">{message}</p>
        </div>
      )}
    </div>
  );
}
