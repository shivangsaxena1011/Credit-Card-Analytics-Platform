"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  FileCheck2,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { api } from "../../services/api";

export const ExportReportView: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [printableHtml, setPrintableHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.exportReport();
      setReportData(res.report);
      setPrintableHtml(res.printable_html);
    } catch (err) {
      console.error("Failed to generate report", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printableHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([printableHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CreditIQ_Analytics_Executive_Report.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sec = reportData?.sections;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Print Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Report & Document Generator</h2>
          <p className="text-xs text-slate-500">Publication-ready banking intelligence report compiled across all 12 analytical modules</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadHtml}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download HTML Report</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs transition shadow-indigo-600/30"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* CSV Export Quick Access Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Quick CSV Exports for Primary Tables</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { id: "cleaned_customers", label: "Cleaned Customers CSV" },
            { id: "cleaned_credit", label: "Cleaned Credit Profiles CSV" },
            { id: "cleaned_transactions", label: "Cleaned Transactions CSV" },
            { id: "experiment", label: "A/B Experiment Data CSV" },
          ].map((item) => (
            <a
              key={item.id}
              href={api.getCsvExportUrl(item.id)}
              download
              className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition font-medium text-slate-700 hover:text-indigo-900"
            >
              <span>{item.label}</span>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </a>
          ))}
        </div>
      </div>

      {/* Live Report Preview Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            Compiling executive report across models...
          </div>
        ) : (
          <div className="space-y-8 text-slate-800 text-xs">
            {/* Report Header */}
            <div className="border-b border-slate-200 pb-5 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Confidential Bank Intelligence
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-2">
                  CreditIQ Analytics — Executive Strategy Report
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">
                  Portfolio Segmentation & Statistical Campaign Optimization
                </p>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-400">
                <div>Generated: {reportData?.generated_at}</div>
                <div>Status: Validated Prototype</div>
              </div>
            </div>

            {/* 1. Executive Summary */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                1. Executive Summary & Strategic Directive
              </h2>
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <div className="font-bold text-indigo-950 text-sm">
                  {sec?.executive_summary?.headline}
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {sec?.executive_summary?.narrative}
                </p>
                <div className="pt-2 border-t border-indigo-200/80 text-indigo-900 font-semibold">
                  <strong>Recommendation:</strong> {sec?.executive_summary?.recommendation}
                </div>
              </div>
            </div>

            {/* 2. Dataset Overview */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                2. Dataset & Exposure Metrics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-sans uppercase">Total Customers</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{sec?.dataset_overview?.total_customers?.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-sans uppercase">Total Transactions</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{sec?.dataset_overview?.total_transactions?.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-sans uppercase">Gross Volume</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">${(sec?.dataset_overview?.total_volume / 1000000)?.toFixed(2)}M</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-sans uppercase">Cleaned Quality Score</div>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">{sec?.data_quality_and_cleaning?.cleaned_quality_score}%</div>
                </div>
              </div>
            </div>

            {/* 3. A/B Testing & Hypothesis Testing */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                3. Experimental Outcome & Hypothesis Verification
              </h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Test Methodology:</span>
                    <div className="font-bold text-slate-900">{sec?.statistical_testing?.test_type}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Decision Rule:</span>
                    <div className="font-bold text-emerald-600">{sec?.statistical_testing?.decision}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Test Statistic:</span>
                    <div className="font-mono font-bold text-slate-900">{sec?.statistical_testing?.test_statistic}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Calculated P-Value:</span>
                    <div className="font-mono font-bold text-indigo-600">{sec?.statistical_testing?.p_value}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <p><strong>Statistical Evidence:</strong> {sec?.statistical_testing?.statistical_interpretation}</p>
                  <p><strong>Business Implication:</strong> {sec?.statistical_testing?.business_interpretation}</p>
                </div>
              </div>
            </div>

            {/* 4. Risk Governance */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                4. Risk Governance & Deployment Caveats
              </h2>
              <ul className="space-y-1.5 text-slate-700 pl-4 list-disc">
                {(sec?.business_recommendation?.risks_and_caveats || []).map((risk: string, i: number) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
