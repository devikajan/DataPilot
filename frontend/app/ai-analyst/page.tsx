"use client";
 
import { useEffect, useMemo, useRef, useState } from "react";
import { toCanvas } from "html-to-image";
import jsPDF from "jspdf";
import AutoChart from "@/components/AutoChart";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://datapilot-api-sgvj.onrender.com").replace(/\/$/, "");

type Message = {

  role: "user" | "assistant";

  content: string;

  tool?: string;

  result?: any;

  flowchart?: boolean;

};

function renderAIAnswer(content: string) {

  const rawLines = content.split(/\r?\n/);

  const lines = rawLines.map((line) => line.trim()).filter(Boolean);

  const cleanLine = (line: string) =>

    line.replace(/^[-•*]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();

  const formatText = (text: string) => {

    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {

      if (part.startsWith("**") && part.endsWith("**")) {

        return (

          <strong key={index} className="font-semibold text-[#291C0E]">

            {part.slice(2, -2)}

          </strong>

        );

      }

      return <span key={index}>{part}</span>;

    });

  };

  
const isTableSeparator = (line: string) => {
  const cells = line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|");

  return (
    cells.length >= 2 &&
    cells.every((cell) => /^\s*:?-{3,}:?\s*$/.test(cell))
  );
};


  const isTableRow = (line: string) => {

    const trimmed = line.trim();

    return trimmed.includes("|") && trimmed.split("|").length >= 3;

  };

  
const parseTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());


  const renderTable = (tableLines: string[], key: string) => {

    if (tableLines.length < 2) return null;

    const header = parseTableRow(tableLines[0]);

    const body = tableLines.slice(2).map(parseTableRow);

    return (

      <div

        key={key}

        className="my-5 overflow-hidden rounded-2xl border border-[#CDBBA9] bg-[#F5EEE5] shadow-lg shadow-black/10"

      >

        <div className="overflow-x-auto">

          <table className="w-full min-w-[620px] border-collapse text-left">

            <thead>

              <tr className="border-b border-[#CDBBA9] bg-amber-800/[0.06]">

                {header.map((cell, index) => (

                  <th

                    key={`${cell}-${index}`}

                    className={`px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-900 ${

                      index === 0 ? "text-left" : "text-right"

                    }`}

                  >

                    {formatText(cell)}

                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {body.map((row, rowIndex) => (

                <tr

                  key={`row-${rowIndex}`}

                  className="border-b border-[#D8C8B8] transition last:border-b-0 hover:bg-[#F1E7DB]"

                >

                  {header.map((_, columnIndex) => {

                    const cell = row[columnIndex] ?? "—";

                    const isPercentage = /%/.test(cell);

                    return (

                      <td

                        key={`cell-${rowIndex}-${columnIndex}`}

                        className={`px-5 py-3.5 text-sm ${

                          columnIndex === 0

                            ? "font-medium text-[#3E2B22]"

                            : isPercentage

                              ? "text-right font-semibold text-emerald-300"

                              : "text-right text-[#6E473B]"

                        }`}

                      >

                        {formatText(cell)}

                      </td>

                    );

                  })}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    );

  };

  const renderAnalysisBlocks = (analysis: string[]) => {

    const blocks: React.ReactNode[] = [];

    let index = 0;

    while (index < analysis.length) {

      if (

        isTableRow(analysis[index]) &&

        index + 1 < analysis.length &&

        isTableSeparator(analysis[index + 1])

      ) {

        const tableLines = [analysis[index], analysis[index + 1]];

        let cursor = index + 2;

        while (cursor < analysis.length && isTableRow(analysis[cursor])) {

          tableLines.push(analysis[cursor]);

          cursor += 1;

        }

        blocks.push(renderTable(tableLines, `table-${index}`));

        index = cursor;

        continue;

      }

      blocks.push(

        <p

          key={`paragraph-${index}`}

          className="text-sm leading-7 text-[#6E473B]"

        >

          {formatText(analysis[index])}

        </p>

      );

      index += 1;

    }

    return blocks;

  };

  const firstParagraphIndex = lines.findIndex(

    (line) =>

      !line.startsWith("- ") &&

      !line.startsWith("• ") &&

      !line.startsWith("* ") &&

      !/^\d+[.)]\s/.test(line) &&

      !isTableRow(line) &&

      !isTableSeparator(line)

  );

  const summary =

    firstParagraphIndex >= 0

      ? lines[firstParagraphIndex]

      : lines[0] ?? content;

  const findingLines = lines.filter(

    (line, index) =>

      index !== firstParagraphIndex &&

      (line.startsWith("- ") ||

        line.startsWith("• ") ||

        line.startsWith("* ") ||

        /^\d+[.)]\s/.test(line))

  );

  const analysisLines = lines.filter(

    (line, index) =>

      index !== firstParagraphIndex &&

      !line.startsWith("- ") &&

      !line.startsWith("• ") &&

      !line.startsWith("* ") &&

      !/^\d+[.)]\s/.test(line)

  );

  return (

    <div className="space-y-5">

      <div className="relative overflow-hidden rounded-2xl border border-amber-800/15 bg-gradient-to-br from-amber-800/[0.08] via-stone-700/[0.04] to-transparent p-5">

        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-800/10 blur-2xl" />

        <div className="relative mb-3 flex items-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-800/15 bg-amber-800/10 text-sm text-amber-900">

            ✦

          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">

            Executive Summary

          </span>

        </div>

        <p className="relative text-[15px] leading-7 text-[#3E2B22]">

          {formatText(summary)}

        </p>

      </div>

      {findingLines.length > 0 && (

        <div>

          <div className="mb-3 flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">

              Key Findings

            </span>

          </div>

          <div className="grid gap-3">

            {findingLines.map((line, index) => (

              <div

                key={`${line}-${index}`}

                className="group rounded-xl border border-[#CDBBA9] bg-[#F5EEE5] p-4 transition duration-300 hover:border-amber-800/20 hover:bg-amber-800/[0.035]"

              >

                <div className="flex gap-3">

                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-amber-800/15 bg-amber-800/10 text-[10px] font-semibold text-amber-900">

                    {index + 1}

                  </div>

                  <p className="text-sm leading-6 text-[#4D3B31]">

                    {formatText(cleanLine(line))}

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

      {analysisLines.length > 0 && (

        <div>

          <div className="mb-3 flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-amber-800 shadow-[0_0_8px_rgba(167,139,250,0.7)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">

              Analysis

            </span>

          </div>

          <div className="rounded-xl border border-[#D8C8B8] bg-[#E7DCCE] p-5">

            <div className="space-y-3">

              {renderAnalysisBlocks(analysisLines)}

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

function FlowchartView({ content }: { content: string }) {
  const steps = useMemo(() => {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    let candidates = lines
      .filter((line) => /^(?:\d+[.)]|[-*•])\s+/.test(line))
      .map((line) => line.replace(/^(?:\d+[.)]|[-*•])\s+/, ""));

    if (candidates.length < 2) {
      candidates = content
        .replace(/\*\*/g, "")
        .split(/(?<=[.!?])\s+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 12)
        .slice(0, 7);
    }

    candidates = candidates
      .map((step) => step.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim())
      .filter(Boolean)
      .slice(0, 8);

    return candidates.length ? candidates : [content.trim().slice(0, 180) || "Review the process"];
  }, [content]);

  const nodes = useMemo(
    () =>
      steps.map((step, index) => ({
        id: `step-${index}`,
        position: { x: 80, y: index * 105 },
        data: { label: `${index + 1}. ${step}` },
        style: {
          width: 270,
          minHeight: 62,
          padding: 12,
          borderRadius: 12,
          border: "1px solid #A99A8C",
          background: index === steps.length - 1 ? "#6E473B" : "#F5EEE5",
          color: index === steps.length - 1 ? "#FFFFFF" : "#291C0E",
          fontSize: 12,
          lineHeight: 1.5,
          boxShadow: "0 4px 14px rgba(41, 28, 14, 0.08)",
        },
      })),
    [steps]
  );

  const edges = useMemo(
    () =>
      steps.slice(0, -1).map((_, index) => ({
        id: `edge-${index}`,
        source: `step-${index}`,
        target: `step-${index + 1}`,
        type: "smoothstep",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6E473B" },
        style: { stroke: "#6E473B", strokeWidth: 1.7 },
      })),
    [steps]
  );

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[#CDBBA9] bg-[#E7DCCE]">
      <div className="border-b border-[#CDBBA9] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6E473B]">
          AI-generated process flowchart
        </p>
        <p className="mt-1 text-[11px] text-[#7F7165]">
          Use the controls to zoom or fit the diagram.
        </p>
      </div>
      <div className="h-[430px] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#CDBBA9" gap={20} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function AnalystPage() {

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const chatExportRef = useRef<HTMLDivElement | null>(null);

  const [dataset, setDataset] = useState("");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);

  const [thinkingStep, setThinkingStep] = useState(0);

  const [error, setError] = useState("");

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [exportingPdf, setExportingPdf] = useState(false);


  const thinkingSteps = [

    "Reading your dataset...",

    "Understanding your question...",

    "Analyzing relevant data...",

    "Finding meaningful patterns...",

    "Preparing your answer...",

  ];

  /* =========================================================

     THINKING ANIMATION

  \========================================================= */

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

  if (!file) {
    return;
  }

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
      `${API_URL}/datasets/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    console.log("DATASET UPLOAD RESPONSE:", result);

    if (
      !response.ok &&
      response.status === 409 &&
      typeof result.detail === "string" &&
      result.detail.toLowerCase().includes("already exists")
    ) {
      console.log(
        "Dataset already exists. Using existing dataset:",
        file.name
      );

      setDataset(file.name);
      setUploadSuccess(true);

      return;
    }

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
    console.error("Dataset upload error:", err);

    setUploadedFile(null);
    setDataset("");
    setUploadSuccess(false);

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
  \========================================================= */

async function askAI(customQuestion?: string) {
  const finalQuestion = customQuestion ?? question;
  if (!finalQuestion.trim() || !dataset || loading) {
    return;
  }
  setError("");

  setQuestion("");

  const wantsFlowchart = /flow\s*chart|workflow diagram|process diagram/i.test(finalQuestion);

  const questionForAI = wantsFlowchart
    ? `${finalQuestion}

Present the process as 4 to 8 concise, ordered steps. Make decision points explicit and keep each step short so it can be shown in a flowchart.`
    : finalQuestion;

  setThinkingStep(0);
  setLoading(true);

  // Add user message

  setMessages((previous) => [

    ...previous,

    {

      role: "user",

      content: finalQuestion,

    },

  ]);

  try {

    const response = await fetch(

      `${API_URL}/analyst/ask`,

      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",
},

        body: JSON.stringify({

          dataset,

          question: questionForAI,

        }),

      }

    );

    const result = await response.json();

    if (!response.ok) {

      throw new Error(

        result.detail || "AI Analyst request failed."

      );

    }

    // Store the complete AI agent response.

    setMessages((previous) => [

      ...previous,

      {

        role: "assistant",

        content: result.answer,

        tool: result.tool,

        result: result.result,

        flowchart: wantsFlowchart,

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

  \========================================================= */

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

  \========================================================= */

  function clearChat() {

    setMessages([]);

    setError("");

    setQuestion("");

  }

  /* =========================================================

     COPY ANSWER

  \========================================================= */
  async function exportChatPdf() {
    const exportElement = chatExportRef.current;
    if (!exportElement || messages.length === 0 || exportingPdf) return;

    setExportingPdf(true);
    setError("");

    try {
      const fullCanvas = await toCanvas(exportElement, {
        pixelRatio: 2,
        backgroundColor: "#E7DCCE",
        cacheBust: true,
        skipFonts: false,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 10;
      const pageWidth = 210 - margin * 2;
      const pageHeight = 297 - margin * 2;
      const sourceSliceHeight = Math.max(1, Math.floor((pageHeight / pageWidth) * fullCanvas.width));
      let sourceY = 0;
      let pageIndex = 0;

      while (sourceY < fullCanvas.height) {
        const sliceHeight = Math.min(sourceSliceHeight, fullCanvas.height - sourceY);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = sliceHeight;
        const context = pageCanvas.getContext("2d");
        if (!context) throw new Error("Could not prepare the PDF page image.");

        context.fillStyle = "#E7DCCE";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(
          fullCanvas,
          0, sourceY, fullCanvas.width, sliceHeight,
          0, 0, fullCanvas.width, sliceHeight
        );

        if (pageIndex > 0) pdf.addPage();
        const renderedHeight = (sliceHeight / fullCanvas.width) * pageWidth;
        pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", margin, margin, pageWidth, renderedHeight);

        sourceY += sliceHeight;
        pageIndex += 1;
      }

      const safeDatasetName = (dataset || "dataset").replace(/[^a-z0-9_-]+/gi, "_");
      pdf.save(`DataPilot_AI_Analysis_${safeDatasetName}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      setError(err instanceof Error ? `PDF export failed: ${err.message}` : "PDF export failed. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  }

  async function copyAnswer(content: string) {

    try {

      await navigator.clipboard.writeText(content);

    } catch (err) {

      console.error("Could not copy answer:", err);

    }

  }

return (

    <main className="min-h-screen bg-[#E7DCCE] text-[#291C0E]">

      {/* =====================================================

          BACKGROUND

      \===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-stone-800/10 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-stone-700/10 blur-[120px]" />

      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 md:px-8">

        {/* =====================================================

            HEADER

        \===================================================== */}

        <header className="mb-8 flex items-center justify-between border-b border-[#CDBBA9] pb-5">

          {/* BRAND */}

          <div className="flex items-center gap-3">

            {/* Robot logo */}

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-amber-800/20 bg-gradient-to-br from-amber-800/20 to-stone-700/10">

              <svg

                width="28"

                height="28"

                viewBox="0 0 72 72"

                fill="none"

                xmlns="http://www\.w3.org/2000/svg"

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

                <span className="rounded-full border border-amber-800/20 bg-amber-800/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-900">

                  AI Analyst

                </span>

              </div>

              <p className="text-xs text-[#7F7165]">

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
                  onClick={exportChatPdf}
                  disabled={exportingPdf}
                  className="rounded-xl border border-amber-800/25 bg-amber-800/10 px-3 py-2.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-800/15 disabled:cursor-wait disabled:opacity-60"
                >
                  {exportingPdf ? "Preparing PDF…" : "Export PDF"}
                </button>
              )}

              {messages.length > 0 && (

                <button

                  type="button"

                  onClick={clearChat}

                  className="rounded-xl border border-[#CDBBA9] px-3 py-2.5 text-xs text-[#6E473B] transition hover:border-white/20 hover:text-[#291C0E]"

                >

                  Clear

                </button>

              )}

              <button

                type="button"

                onClick={removeDataset}

                className="rounded-xl border border-[#CDBBA9] px-3 py-2.5 text-xs text-[#7F7165] transition hover:border-red-400/20 hover:text-red-300"

              >

                Remove

              </button>

            </div>

          )}

        </header>

        {/* =====================================================

            MAIN

        \===================================================== */}

        <section className="flex flex-1 flex-col">

          {/* ===================================================

              UPLOAD SCREEN

          \=================================================== */}

          {!dataset && !uploading && (

            <div className="flex flex-1 -translate-y-8 flex-col items-center justify-center py-10 text-center">

              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">

                Upload your data.

                <br />

                Ask anything.

              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[#7F7165] md:text-base">

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

                className="group mt-10 w-full max-w-xl rounded-2xl border border-dashed border-amber-800/30 bg-amber-800/[0.035] p-8 text-left transition duration-300 hover:-translate-y-1 hover:border-amber-800/60 hover:bg-amber-800/[0.06]"

              >

                <div className="flex flex-col items-center text-center">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-800/20 bg-amber-800/10">

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

                  <p className="text-base font-medium text-[#3E2B22]">

                    Upload your dataset

                  </p>

                  <p className="mt-2 text-sm text-[#7F7165]">

                    Drag & drop or click to browse

                  </p>

                  <p className="mt-4 text-[11px] text-[#8F8175]">

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

          \=================================================== */}

          {uploading && (

            <div className="flex flex-1 flex-col items-center justify-center">

              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-800/20 bg-amber-800/10">

                <div className="absolute h-10 w-10 animate-ping rounded-full bg-amber-800/20" />

                <span className="relative h-6 w-6 animate-spin rounded-full border-2 border-amber-800/20 border-t-amber-800" />

              </div>

              <h2 className="mt-6 text-xl font-semibold">

                Processing your dataset...

              </h2>

              <p className="mt-2 text-sm text-[#7F7165]">

                Uploading and preparing your data for analysis.

              </p>

              {uploadedFile && (

                <p className="mt-4 text-xs text-amber-800">

                  {uploadedFile.name}

                </p>

              )}

            </div>

          )}

          {/* ===================================================

              DATASET READY

          \=================================================== */}

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

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#7F7165]">

                  Ask DataPilot questions about{" "}

                  <span className="text-[#4D3B31]">

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

                      className="group rounded-2xl border border-[#CDBBA9] bg-[#F5EEE5] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-amber-800/30 hover:bg-amber-800/[0.06]"

                    >

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-xs font-medium text-amber-800">

                          ASK DATAPILOT

                        </span>

                        <span className="text-[#8F8175] transition group-hover:translate-x-1 group-hover:text-amber-800">

                          →

                        </span>

                      </div>

                      <p className="text-sm text-[#4D3B31]">

                        {suggestion}

                      </p>

                    </button>

                  ))}

                </div>

              </div>

            )}

          {/* ===================================================

              CHAT

          \=================================================== */}

          {messages.length > 0 && (

            <div ref={chatExportRef} className="mx-auto w-full max-w-4xl space-y-6 py-8">

{messages.map((message, index) => (

  <div

    key={`${message.role}-${index}`}

    className={

      message.role === "user"

        ? "flex justify-end"

        : "flex justify-start"

    }

  >

    {message.role === "user" ? (

      <div className="max-w-[85%] rounded-2xl rounded-br-md border border-amber-800/20 bg-amber-800/10 px-5 py-4">

        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-800">

          You

        </p>

        <p className="whitespace-pre-wrap text-sm leading-6 text-[#3E2B22]">

          {message.content}

        </p>

      </div>

    ) : (

      <div className="relative w-full overflow-hidden rounded-2xl border border-amber-800/15 bg-gradient-to-br from-amber-800/[0.07] via-white/[0.025] to-stone-700/[0.04] p-6 shadow-xl shadow-blue-950/10">

        {/* Glow */}

        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-800/10 blur-3xl" />

        {/* Header */}

        <div className="relative mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            {/* Robot avatar */}

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-800/20 bg-amber-800/10">

              <svg

                width="25"

                height="25"

                viewBox="0 0 72 72"

                fill="none"

                xmlns="http://www\.w3.org/2000/svg"

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

                <p className="text-sm font-semibold text-[#291C0E]">

                  DataPilot AI

                </p>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-400">

                  Complete

                </span>

              </div>

              <p className="mt-0.5 text-[10px] text-[#7F7165]">

                Dataset analysis

              </p>

            </div>

          </div>

          {/* Copy */}

          <button

            type="button"

            onClick={() => copyAnswer(message.content)}

            className="rounded-lg border border-[#CDBBA9] bg-[#F5EEE5] px-3 py-2 text-[10px] text-[#7F7165] transition hover:border-amber-800/20 hover:text-amber-800"

          >

            Copy

          </button>

        </div>

        {/* Divider */}

        <div className="relative mb-6 h-px bg-gradient-to-r from-amber-800/20 via-white/10 to-transparent" />

        {/* AI Insight */}

        <div className="relative">

          {renderAIAnswer(message.content)}

          {/* =================================================

             GENERATED CHART

          \================================================= */}

          {message.tool === "generate_chart" &&

            message.result?.chart_type &&

            message.result?.data &&

            message.result?.x &&

            message.result?.y && (

              <div className="mt-5 overflow-hidden rounded-xl border border-amber-800/10 bg-[#E7DCCE] p-4">

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">

                      Generated Visualization

                    </p>

                    <p className="mt-1 text-xs text-[#7F7165]">

                      Generated by DataPilot Chart Tool

                    </p>

                  </div>

                  <span className="rounded-full border border-amber-800/20 bg-amber-800/10 px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-amber-900">

                    {message.result.chart_type}

                  </span>

                </div>

                <AutoChart

                  chartType={message.result.chart_type}

                  data={message.result.data}

                  x={message.result.x}

                  y={message.result.y}

                />

              </div>

            )}

          {message.flowchart && <FlowchartView content={message.content} />}

        </div>

        {/* Footer */}

        <div className="relative mt-5 flex items-center justify-between">

          <div className="flex items-center gap-2 text-[10px] text-[#8F8175]">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />

            Analysis generated from selected dataset

          </div>

          <span className="text-[10px] text-[#9B8B7D]">

            DataPilot

          </span>

        </div>

      </div>

    )}

  </div>

))}

                    {/* =================================================

                  THINKING

              \================================================= */}

              {loading && (

                <div className="rounded-2xl border border-amber-800/10 bg-amber-800/[0.035] p-5">

                  <div className="flex items-center gap-3">

                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-amber-800/10">

                      <div className="absolute h-3 w-3 animate-ping rounded-full bg-amber-800/40" />

                      <div className="relative h-2.5 w-2.5 rounded-full bg-amber-800" />

                    </div>

                    <div>

                      <p className="text-xs font-semibold text-[#3E2B22]">

                        DataPilot AI is thinking

                      </p>

                      <p className="text-xs text-amber-800">

                        {thinkingSteps[thinkingStep]}

                      </p>

                    </div>

                  </div>

                  {/* Progress */}

                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">

                    <div

                      className="h-full rounded-full bg-gradient-to-r from-amber-800 to-stone-600 transition-all duration-700"

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

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-800 [animation-delay:-0.3s]" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-800 [animation-delay:-0.15s]" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-800" />

                  </div>

                </div>

              )}

            </div>

          )}

          {/* =====================================================

              ERROR

          \===================================================== */}

          {error && (

            <div className="mx-auto mb-5 w-full max-w-4xl rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">

              {error}

            </div>

          )}

          {/* =====================================================

              INPUT

          \===================================================== */}

          {dataset && !uploading && (

            <div className="mx-auto mt-auto w-full max-w-4xl pb-3">

              <div className="rounded-2xl border border-[#CDBBA9] bg-[#F1E7DB] p-2 shadow-2xl shadow-black/20 transition focus-within:border-amber-800/30 focus-within:bg-[#F1E7DB]">

                <textarea

                  value={question}

                  onChange={(e) =>

                    setQuestion(e.target.value)

                  }

                  onKeyDown={handleKeyDown}

                  disabled={loading}

                  placeholder="Ask DataPilot about your data..."

                  rows={2}

                  className="w-full resize-none bg-transparent px-4 py-3 text-sm text-[#291C0E] outline-none placeholder:text-[#8F8175] disabled:cursor-not-allowed"

                />

                <div className="flex items-center justify-between px-2 pb-1">

                  <p className="hidden text-[10px] text-[#8F8175] sm:block">

                    Press Enter to ask · Shift + Enter for a new line

                  </p>

                  <button

                    type="button"

                    onClick={() => askAI()}

                    disabled={

                      loading ||

                      !question.trim()

                    }

                    className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl bg-stone-800 text-lg transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-30"

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

              <p className="mt-3 text-center text-[10px] text-[#9B8B7D]">

                DataPilot AI can make mistakes. Verify important

                business decisions against the underlying data.

              </p>

            </div>

          )}

          {/* =====================================================

              UPLOAD DIFFERENT DATASET

          \===================================================== */}

          {dataset && !loading && (

            <div className="pb-5 text-center">

              <button

                type="button"

                onClick={() =>

                  fileInputRef.current?.click()

                }

                className="text-xs text-[#8F8175] transition hover:text-amber-800"

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

