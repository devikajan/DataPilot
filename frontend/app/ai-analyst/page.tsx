"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AnalystPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dataset, setDataset] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [thinkingStep, setThinkingStep] = useState(0);

  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const thinkingSteps = [
    "Reading your dataset...",
    "Understanding your question...",
    "Analyzing relevant data...",
    "Finding meaningful patterns...",
    "Preparing your answer...",
  ];

  /* =========================================================
     THINKING ANIMATION
  ========================================================= */

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setThinkingStep((current) => {
        if (current >= thinkingSteps.length - 1) {
          return current;
        }

        return current + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [loading]);

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setUploadSuccess(false);
    setUploadedFile(file);
    setUploading(true);
    setMessages([]);
    setQuestion("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/datasets/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Dataset upload failed."
        );
      }

      const uploadedFilename =
        result.filename ||
        result.dataset ||
        file.name;

      setDataset(uploadedFilename);
      setUploadSuccess(true);
    } catch (err) {
      console.error(err);

      setUploadedFile(null);
      setDataset("");

      setError(
        err instanceof Error
          ? err.message
          : "Could not upload the dataset."
      );
    } finally {
      setUploading(false);
    }
  }

  /* =========================================================
     REMOVE DATASET
  ========================================================= */

  function removeDataset() {
    setDataset("");
    setUploadedFile(null);
    setUploadSuccess(false);
    setMessages([]);
    setQuestion("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /* =========================================================
     ASK AI
  ========================================================= */

  async function askAI(customQuestion?: string) {
    const finalQuestion = customQuestion ?? question;

    if (!finalQuestion.trim() || !dataset || loading) {
      return;
    }

    setError("");
    setQuestion("");
    setLoading(true);
    setThinkingStep(0);

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: finalQuestion,
      },
    ]);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyst/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataset,
            question: finalQuestion,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "AI Analyst request failed."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.answer,
        },
      ]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     KEYBOARD
  ========================================================= */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askAI();
    }
  }

  /* =========================================================
     CLEAR CHAT
  ========================================================= */

  function clearChat() {
    setMessages([]);
    setError("");
    setQuestion("");
  }

  /* =========================================================
     COPY ANSWER
  ========================================================= */

  async function copyAnswer(content: string) {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("Could not copy answer:", err);
    }
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 md:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">

          {/* BRAND */}

          <div className="flex items-center gap-3">

            {/* Robot logo */}

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/10">

              <svg
                width="28"
                height="28"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M36 9V16"
                  stroke="#93C5FD"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <circle
                  cx="36"
                  cy="7"
                  r="3.5"
                  fill="#60A5FA"
                />

                <rect
                  x="15"
                  y="17"
                  width="42"
                  height="35"
                  rx="13"
                  fill="url(#robotGradient)"
                  stroke="#93C5FD"
                  strokeWidth="1.5"
                />

                <rect
                  x="10"
                  y="28"
                  width="6"
                  height="13"
                  rx="3"
                  fill="#60A5FA"
                />

                <rect
                  x="56"
                  y="28"
                  width="6"
                  height="13"
                  rx="3"
                  fill="#60A5FA"
                />

                <rect
                  x="22"
                  y="24"
                  width="28"
                  height="21"
                  rx="8"
                  fill="#111827"
                />

                <circle
                  cx="31"
                  cy="33"
                  r="2"
                  fill="#93C5FD"
                />

                <circle
                  cx="41"
                  cy="33"
                  r="2"
                  fill="#93C5FD"
                />

                <path
                  d="M31 38C33.5 40.5 38.5 40.5 41 38"
                  stroke="#60A5FA"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <defs>
                  <linearGradient
                    id="robotGradient"
                    x1="15"
                    y1="17"
                    x2="57"
                    y2="52"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#E0F2FE" />
                    <stop
                      offset="0.5"
                      stopColor="#93C5FD"
                    />
                    <stop
                      offset="1"
                      stopColor="#6366F1"
                    />
                  </linearGradient>
                </defs>
              </svg>

            </div>

            <div>
              <div className="flex items-center gap-2">

                <h1 className="text-lg font-semibold">
                  DataPilot
                </h1>

                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-300">
                  AI Analyst
                </span>

              </div>

              <p className="text-xs text-slate-500">
                Autonomous data intelligence
              </p>
            </div>

          </div>

          {/* DATASET STATUS */}

          {dataset && (
            <div className="hidden items-center gap-3 sm:flex">

              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-2.5">

                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />

                <span className="max-w-[240px] truncate text-xs text-emerald-300">
                  {dataset}
                </span>

              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={removeDataset}
                className="rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-500 transition hover:border-red-400/20 hover:text-red-300"
              >
                Remove
              </button>

            </div>
          )}

        </header>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <section className="flex flex-1 flex-col">

          {/* ===================================================
              UPLOAD SCREEN
          =================================================== */}

          {!dataset && !uploading && (
            <div className="flex flex-1 -translate-y-8 flex-col items-center justify-center py-10 text-center">

              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                Upload your data.
                <br />
                Ask anything.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 md:text-base">
                Upload a CSV or Excel dataset and let DataPilot
                analyze it, discover patterns, and answer your
                questions in natural language.
              </p>

              {/* Upload card */}

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="group mt-10 w-full max-w-xl rounded-2xl border border-dashed border-blue-400/30 bg-blue-500/[0.035] p-8 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-blue-500/[0.06]"
              >

                <div className="flex flex-col items-center text-center">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">

                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 16V4"
                        stroke="#60A5FA"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M7 9L12 4L17 9"
                        stroke="#60A5FA"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M5 15V18C5 19.1 5.9 20 7 20H17C18.1 20 19 19.1 19 18V15"
                        stroke="#93C5FD"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>

                  </div>

                  <p className="text-base font-medium text-slate-200">
                    Upload your dataset
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Drag & drop or click to browse
                  </p>

                  <p className="mt-4 text-[11px] text-slate-600">
                    CSV, XLSX, XLS
                  </p>

                </div>

              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />

            </div>
          )}

          {/* ===================================================
              UPLOADING
          =================================================== */}

          {uploading && (
            <div className="flex flex-1 flex-col items-center justify-center">

              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">

                <div className="absolute h-10 w-10 animate-ping rounded-full bg-blue-400/20" />

                <span className="relative h-6 w-6 animate-spin rounded-full border-2 border-blue-400/20 border-t-blue-400" />

              </div>

              <h2 className="mt-6 text-xl font-semibold">
                Processing your dataset...
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Uploading and preparing your data for analysis.
              </p>

              {uploadedFile && (
                <p className="mt-4 text-xs text-blue-400">
                  {uploadedFile.name}
                </p>
              )}

            </div>
          )}

          {/* ===================================================
              DATASET READY
          =================================================== */}

          {dataset &&
            !uploading &&
            messages.length === 0 && (
              <div className="flex flex-1 -translate-y-8 flex-col items-center justify-center py-10 text-center">

                {uploadSuccess && (
                  <div className="mb-6 flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-2">

                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400">
                      ✓
                    </span>

                    <span className="text-xs font-medium text-emerald-300">
                      Dataset ready for analysis
                    </span>

                  </div>
                )}

                <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                  What would you like to know?
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
                  Ask DataPilot questions about{" "}
                  <span className="text-slate-300">
                    {dataset}
                  </span>
                  .
                </p>

                {/* Suggested questions */}

                <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-2">

                  {[
                    "What are the key insights in this dataset?",
                    "What are the most important patterns?",
                    "What unusual patterns can you find?",
                    "Give me a summary of this dataset.",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        askAI(suggestion)
                      }
                      className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-blue-500/[0.06]"
                    >

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-xs font-medium text-blue-400">
                          ASK DATAPILOT
                        </span>

                        <span className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400">
                          →
                        </span>

                      </div>

                      <p className="text-sm text-slate-300">
                        {suggestion}
                      </p>

                    </button>
                  ))}

                </div>

              </div>
            )}

          {/* ===================================================
              CHAT
          =================================================== */}

          {messages.length > 0 && (
            <div className="mx-auto w-full max-w-4xl space-y-6 py-8">

              {messages.map((message, index) => (

                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >

                  {/* USER MESSAGE */}

                  {message.role === "user" ? (

                    <div className="max-w-[85%] rounded-2xl rounded-br-md border border-blue-400/20 bg-blue-500/10 px-5 py-4">

                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                        You
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
                        {message.content}
                      </p>

                    </div>

                  ) : (

                    /* =================================================
                       AI ANSWER CARD
                    ================================================= */

                    <div className="relative w-full overflow-hidden rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.07] via-white/[0.025] to-indigo-500/[0.04] p-6 shadow-xl shadow-blue-950/10">

                      {/* Glow */}

                      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                      {/* Header */}

                      <div className="relative mb-6 flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          {/* Robot avatar */}

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">

                            <svg
                              width="25"
                              height="25"
                              viewBox="0 0 72 72"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >

                              <path
                                d="M36 9V16"
                                stroke="#93C5FD"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />

                              <circle
                                cx="36"
                                cy="7"
                                r="3.5"
                                fill="#60A5FA"
                              />

                              <rect
                                x="15"
                                y="17"
                                width="42"
                                height="35"
                                rx="13"
                                fill="#93C5FD"
                              />

                              <rect
                                x="22"
                                y="24"
                                width="28"
                                height="21"
                                rx="8"
                                fill="#111827"
                              />

                              <circle
                                cx="31"
                                cy="33"
                                r="2"
                                fill="#60A5FA"
                              />

                              <circle
                                cx="41"
                                cy="33"
                                r="2"
                                fill="#60A5FA"
                              />

                              <path
                                d="M31 38C33.5 40.5 38.5 40.5 41 38"
                                stroke="#60A5FA"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />

                            </svg>

                          </div>

                          <div>

                            <div className="flex items-center gap-2">

                              <p className="text-sm font-semibold text-white">
                                DataPilot AI
                              </p>

                              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-400">
                                Complete
                              </span>

                            </div>

                            <p className="mt-0.5 text-[10px] text-slate-500">
                              Dataset analysis
                            </p>

                          </div>

                        </div>

                        {/* Copy */}

                        <button
                          type="button"
                          onClick={() =>
                            copyAnswer(
                              message.content
                            )
                          }
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-slate-500 transition hover:border-blue-400/20 hover:text-blue-400"
                        >
                          Copy
                        </button>

                      </div>

                      {/* Divider */}

                      <div className="relative mb-6 h-px bg-gradient-to-r from-blue-400/20 via-white/10 to-transparent" />

                      {/* Insight */}

                      <div className="relative">

                        <div className="mb-3 flex items-center gap-2">

                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />

                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                            AI Insight
                          </span>

                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-black/10 p-5">

                          <p className="whitespace-pre-wrap text-[15px] leading-8 text-slate-200">
                            {message.content}
                          </p>

                        </div>

                      </div>

                      {/* Footer */}

                      <div className="relative mt-5 flex items-center justify-between">

                        <div className="flex items-center gap-2 text-[10px] text-slate-600">

                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />

                          Analysis generated from selected dataset

                        </div>

                        <span className="text-[10px] text-slate-700">
                          DataPilot
                        </span>

                      </div>

                    </div>
                  )}

                </div>
              ))}

              {/* =================================================
                  THINKING
              ================================================= */}

              {loading && (
                <div className="rounded-2xl border border-blue-400/10 bg-blue-500/[0.035] p-5">

                  <div className="flex items-center gap-3">

                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">

                      <div className="absolute h-3 w-3 animate-ping rounded-full bg-blue-400/40" />

                      <div className="relative h-2.5 w-2.5 rounded-full bg-blue-400" />

                    </div>

                    <div>

                      <p className="text-xs font-semibold text-slate-200">
                        DataPilot AI is thinking
                      </p>

                      <p className="text-xs text-blue-400">
                        {thinkingSteps[thinkingStep]}
                      </p>

                    </div>

                  </div>

                  {/* Progress */}

                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-700"
                      style={{
                        width: `${
                          ((thinkingStep + 1) /
                            thinkingSteps.length) *
                          100
                        }%`,
                      }}
                    />

                  </div>

                  {/* Dots */}

                  <div className="mt-4 flex gap-1.5">

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" />

                  </div>

                </div>
              )}

            </div>
          )}

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="mx-auto mb-5 w-full max-w-4xl rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* =====================================================
              INPUT
          ===================================================== */}

          {dataset && !uploading && (
            <div className="mx-auto mt-auto w-full max-w-4xl pb-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-2 shadow-2xl shadow-black/20 transition focus-within:border-blue-400/30 focus-within:bg-white/[0.045]">

                <textarea
                  value={question}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder="Ask DataPilot about your data..."
                  rows={2}
                  className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
                />

                <div className="flex items-center justify-between px-2 pb-1">

                  <p className="hidden text-[10px] text-slate-600 sm:block">
                    Press Enter to ask · Shift + Enter for a new line
                  </p>

                  <button
                    type="button"
                    onClick={() => askAI()}
                    disabled={
                      loading ||
                      !question.trim()
                    }
                    className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Ask DataPilot"
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      "↑"
                    )}
                  </button>

                </div>

              </div>

              <p className="mt-3 text-center text-[10px] text-slate-700">
                DataPilot AI can make mistakes. Verify important
                business decisions against the underlying data.
              </p>

            </div>
          )}

          {/* =====================================================
              UPLOAD DIFFERENT DATASET
          ===================================================== */}

          {dataset && !loading && (
            <div className="pb-5 text-center">

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="text-xs text-slate-600 transition hover:text-blue-400"
              >
                Upload a different dataset
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />

            </div>
          )}

        </section>
      </div>
    </main>
  );
}