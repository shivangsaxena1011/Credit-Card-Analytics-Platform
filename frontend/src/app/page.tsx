"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { GlobalFilterModal } from "../components/GlobalFilterModal";

import { DashboardView } from "../components/views/DashboardView";
import { DataOverviewView } from "../components/views/DataOverviewView";
import { DataQualityView } from "../components/views/DataQualityView";
import { CustomerAnalyticsView } from "../components/views/CustomerAnalyticsView";
import { CreditAnalyticsView } from "../components/views/CreditAnalyticsView";
import { TransactionAnalyticsView } from "../components/views/TransactionAnalyticsView";
import { SegmentationView } from "../components/views/SegmentationView";
import { TargetSegmentView } from "../components/views/TargetSegmentView";
import { CampaignExperimentView } from "../components/views/CampaignExperimentView";
import { PowerAnalysisView } from "../components/views/PowerAnalysisView";
import { HypothesisTestingView } from "../components/views/HypothesisTestingView";
import { InsightsView } from "../components/views/InsightsView";
import { DataExplorerView } from "../components/views/DataExplorerView";
import { ExportReportView } from "../components/views/ExportReportView";
import { SettingsView } from "../components/views/SettingsView";

import { api } from "../services/api";
import {
  FilterState,
  OverviewKPIs,
  DataQualityData,
  CleaningReport,
  CustomerAnalyticsData,
  CreditAnalyticsData,
  TransactionAnalyticsData,
  SegmentationData,
  TargetScoringData,
  ExperimentData,
  PowerAnalysisData,
  HypothesisTestData,
  InsightsData,
  PipelineStages,
  AgeGroupConfig
} from "../types/analytics";

const DEFAULT_FILTERS: FilterState = {
  gender: "All",
  location: "All",
  occupation: "All",
  marital_status: "All",
  product_category: "All",
  platform: "All",
  payment_type: "All",
  use_raw: false
};

const DEFAULT_STAGES: PipelineStages = {
  RAW_DATA: "Completed",
  VALIDATED: "Completed",
  CLEANED: "Completed",
  ANALYZED: "Completed",
  SEGMENTED: "Completed",
  EXPERIMENT_READY: "Completed",
  TESTED: "Completed"
};

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "info" | "warning"; text: string } | null>(null);
  const [engine, setEngine] = useState<string>("typescript-standalone");

  // Analytics states
  const [pipelineStages, setPipelineStages] = useState<PipelineStages>(DEFAULT_STAGES);
  const [isCleaned, setIsCleaned] = useState<boolean>(true);
  const [overviewData, setOverviewData] = useState<{
    kpis: OverviewKPIs | null;
    customer_distributions: any;
    credit_distributions: any;
    transaction_distributions: any;
  }>({
    kpis: null,
    customer_distributions: null,
    credit_distributions: null,
    transaction_distributions: null
  });

  const [qualityData, setQualityData] = useState<DataQualityData | null>(null);
  const [cleaningReport, setCleaningReport] = useState<CleaningReport | null>(null);
  const [customerData, setCustomerData] = useState<CustomerAnalyticsData | null>(null);
  const [creditData, setCreditData] = useState<CreditAnalyticsData | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionAnalyticsData | null>(null);
  const [segmentationData, setSegmentationData] = useState<SegmentationData | null>(null);
  const [targetData, setTargetData] = useState<TargetScoringData | null>(null);
  const [experimentData, setExperimentData] = useState<ExperimentData | null>(null);
  const [powerData, setPowerData] = useState<PowerAnalysisData | null>(null);
  const [hypothesisData, setHypothesisData] = useState<HypothesisTestData | null>(null);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);

  // Page title mapping
  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Executive Intelligence Dashboard",
      subtitle: "Unified banking analytics, customer segmentation & campaign A/B testing overview"
    },
    overview: {
      title: "Portfolio & Data Overview",
      subtitle: "High-level demographic distributions, credit metrics, and transaction volume trends"
    },
    quality: {
      title: "Data Quality & Cleaning Pipeline",
      subtitle: "Dynamic quality score, anomaly detection, and before-vs-after remediation audit"
    },
    customers: {
      title: "Customer Demographic Analytics",
      subtitle: "Granular breakdown of customer age, income distribution, location, and employment"
    },
    credit: {
      title: "Credit Risk & Exposure Analytics",
      subtitle: "Underwriting limits, utilization rates, revolving debt, and Pearson correlation matrix"
    },
    transactions: {
      title: "Transaction & Merchant Dynamics",
      subtitle: "Purchase volume, platform market shares, payment rails, and category cross-tabs"
    },
    segmentation: {
      title: "Customer Age Segmentation",
      subtitle: "Configurable cohort clustering with 11-dimension comparative financial benchmarking"
    },
    target: {
      title: "Target Segment Recommendation Engine",
      subtitle: "Multi-criteria weighted optimization model scoring candidate segments for campaign acquisition"
    },
    experiment: {
      title: "Campaign Experiment Workspace",
      subtitle: "A/B testing descriptive statistics, distribution comparisons, and spend lift metrics"
    },
    power: {
      title: "Statistical Power & Sample Sizing",
      subtitle: "Power calculation, sensitivity grids, and Cohen's d effect size sample curves"
    },
    testing: {
      title: "Statistical Hypothesis Testing",
      subtitle: "Rigorous two-sample Z/t-tests with critical regions, p-values, and decision rules"
    },
    insights: {
      title: "Automated Insights & Business Directives",
      subtitle: "Synthesized portfolio findings, empirical evidence, and staged rollout directives"
    },
    explorer: {
      title: "Interactive Data Explorer",
      subtitle: "Full-text record inspection, search, sorting, and CSV downloads across raw & cleaned datasets"
    },
    report: {
      title: "Executive Report & Export",
      subtitle: "Publication-ready intelligence document with browser printing and CSV exports"
    },
    settings: {
      title: "Simulation Settings & Seed Control",
      subtitle: "Configure random seeds, reset synthetic datasets, and verify environmental status"
    }
  };

  // Fetch all analytics data
  // Fetch all analytics data concurrently and resiliently
  const loadData = useCallback(async (currentFilters: FilterState) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Execute all requests in parallel so pipeline-status failure never blocks initialization
      const [
        pipeRes,
        ovRes,
        qualRes,
        custRes,
        credRes,
        txnRes,
        segRes,
        tarRes,
        expRes,
        powRes,
        hypRes,
        insRes
      ] = await Promise.all([
        api.getPipelineStatus().catch((err) => {
          console.warn("Pipeline status fallback:", err);
          return { stages: DEFAULT_STAGES, is_cleaned: true, engine: "typescript-standalone" };
        }),
        api.getOverview(currentFilters).catch((err) => {
          console.error("Overview fetch error:", err);
          return null;
        }),
        api.getDataQuality().catch((err) => {
          console.error("Data quality fetch error:", err);
          return null;
        }),
        api.getCustomerAnalytics(currentFilters).catch((err) => {
          console.error("Customer analytics fetch error:", err);
          return null;
        }),
        api.getCreditAnalytics(currentFilters).catch((err) => {
          console.error("Credit analytics fetch error:", err);
          return null;
        }),
        api.getTransactionAnalytics(currentFilters).catch((err) => {
          console.error("Transaction analytics fetch error:", err);
          return null;
        }),
        api.getSegments(undefined, currentFilters).catch((err) => {
          console.error("Segments fetch error:", err);
          return null;
        }),
        api.getTargetSegmentAnalysis(undefined, undefined, currentFilters).catch((err) => {
          console.error("Target segment analysis fetch error:", err);
          return null;
        }),
        api.getExperimentSummary().catch((err) => {
          console.error("Experiment summary fetch error:", err);
          return null;
        }),
        api.getPowerAnalysis().catch((err) => {
          console.error("Power analysis fetch error:", err);
          return null;
        }),
        api.runHypothesisTest("z_test", "larger", 0.05).catch((err) => {
          console.error("Hypothesis test fetch error:", err);
          return null;
        }),
        api.getInsights(currentFilters).catch((err) => {
          console.error("Insights fetch error:", err);
          return null;
        })
      ]);

      if (pipeRes) {
        setPipelineStages(pipeRes.stages || DEFAULT_STAGES);
        setIsCleaned(pipeRes.is_cleaned ?? true);
        if (pipeRes.engine) {
          setEngine(pipeRes.engine);
        }
      }

      if (ovRes) {
        setOverviewData({
          kpis: ovRes.kpis,
          customer_distributions: ovRes.customer_distributions,
          credit_distributions: ovRes.credit_distributions,
          transaction_distributions: ovRes.transaction_distributions
        });
      }
      if (qualRes) setQualityData(qualRes);
      if (custRes) setCustomerData(custRes);
      if (credRes) setCreditData(credRes);
      if (txnRes) setTransactionData(txnRes);
      if (segRes) setSegmentationData(segRes);
      if (tarRes) setTargetData(tarRes);
      if (expRes) setExperimentData(expRes);
      if (powRes) setPowerData(powRes);
      if (hypRes) setHypothesisData(hypRes);
      if (insRes) setInsightsData(insRes);
    } catch (err: any) {
      console.error("Failed to load analytics data", err);
      setErrorMsg(err.message || "Failed to communicate with analytics backend");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(filters);
  }, [loadData]);

  // Actions
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    loadData(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    loadData(DEFAULT_FILTERS);
  };

  const handleApplyClean = async () => {
    setIsCleaning(true);
    setErrorMsg(null);
    try {
      const rep = await api.cleanData();
      setCleaningReport(rep);
      setIsCleaned(true);
      if ((rep as any).engine) {
        setEngine((rep as any).engine);
      }
      setStatusMsg({
        type: "success",
        text: `Data cleaning pipeline applied successfully. Dynamic quality score verified at ${rep.before_quality_score.toFixed(1)}% → ${rep.after_quality_score.toFixed(1)}%.`
      });
      await loadData(filters);
    } catch (err: any) {
      console.error("Clean failed", err);
      setErrorMsg(err.message || "Failed to run cleaning pipeline");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleLoadDemo = async (seed: number = 42) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.resetData(seed);
      if (res?.engine) setEngine(res.engine);
      setStatusMsg({
        type: "info",
        text: `Demo dataset successfully re-initialized with seed ${seed}.`
      });
      await loadData(filters);
    } catch (err: any) {
      console.error("Reset failed", err);
      setErrorMsg(err.message || "Failed to reset demo dataset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAgeGroups = async (groups: AgeGroupConfig[]) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const segRes = await api.getSegments(groups, filters);
      const tarRes = await api.getTargetSegmentAnalysis(undefined, groups, filters);
      setSegmentationData(segRes);
      setTargetData(tarRes);
      setStatusMsg({ type: "info", text: "Customer age cohort segmentation re-clustered." });
    } catch (err: any) {
      console.error("Age group update failed", err);
      setErrorMsg(err.message || "Failed to update age cohorts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWeights = async (weights: Record<string, number>) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const tarRes = await api.getTargetSegmentAnalysis(weights, undefined, filters);
      setTargetData(tarRes);
      setStatusMsg({ type: "info", text: "Target scoring weights recalculated successfully." });
    } catch (err: any) {
      console.error("Weights update failed", err);
      setErrorMsg(err.message || "Failed to recalculate target segment weights");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunHypothesisTest = async (testType: string, alt: string, alpha: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const hypRes = await api.runHypothesisTest(testType, alt, alpha);
      setHypothesisData(hypRes);
      setStatusMsg({ type: "info", text: `Statistical hypothesis test (${testType}) executed successfully.` });
    } catch (err: any) {
      console.error("Hypothesis test failed", err);
      setErrorMsg(err.message || "Failed to execute statistical hypothesis test");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePower = async (alpha: number, power: number, effectSize: number, alt: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const powRes = await api.getPowerAnalysis(alpha, power, effectSize, alt);
      setPowerData(powRes);
      setStatusMsg({ type: "info", text: "Statistical power analysis recalculated." });
    } catch (err: any) {
      console.error("Power update failed", err);
      setErrorMsg(err.message || "Failed to update power analysis parameters");
    } finally {
      setIsLoading(false);
    }
  };

  const currentTitle = titles[currentTab] || {
    title: "CreditIQ Analytics",
    subtitle: "Enterprise Banking Analytics Platform"
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isCleaned={isCleaned}
        onApplyClean={handleApplyClean}
        isCleaning={isCleaning}
        engine={engine}
      />

      {/* Main Workspace Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          pageTitle={currentTitle.title}
          pageSubtitle={currentTitle.subtitle}
          pipelineStages={pipelineStages}
          filters={filters}
          onOpenFilters={() => setIsFilterModalOpen(true)}
          onLoadDemo={() => handleLoadDemo(42)}
          onRefresh={() => loadData(filters)}
          isLoading={isLoading}
          engine={engine}
        />

        {/* Status Confirmation Banner if any */}
        {statusMsg && (
          <div className={`border-b px-6 py-2.5 flex items-center justify-between text-xs ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : statusMsg.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-indigo-50 border-indigo-200 text-indigo-800"
          }`}>
            <span>{statusMsg.text}</span>
            <button onClick={() => setStatusMsg(null)} className="font-bold underline ml-3 cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Error Notification Banner if any */}
        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-800">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold underline ml-3 cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content Router */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70">
          {currentTab === "dashboard" && (
            <DashboardView
              overviewKPIs={overviewData.kpis}
              targetData={targetData}
              experimentData={experimentData}
              hypothesisData={hypothesisData}
              insightsData={insightsData}
              onNavigate={setCurrentTab}
              monthlyTrend={transactionData?.monthly_trend || []}
            />
          )}

          {currentTab === "overview" && (
            <DataOverviewView
              kpis={overviewData.kpis}
              customerDistributions={overviewData.customer_distributions}
              creditDistributions={overviewData.credit_distributions}
              transactionDistributions={overviewData.transaction_distributions}
              onOpenFilters={() => setIsFilterModalOpen(true)}
            />
          )}

          {currentTab === "quality" && (
            <DataQualityView
              qualityData={qualityData}
              cleaningReport={cleaningReport}
              isCleaned={isCleaned}
              onApplyClean={handleApplyClean}
              isCleaning={isCleaning}
            />
          )}

          {currentTab === "customers" && (
            <CustomerAnalyticsView data={customerData} />
          )}

          {currentTab === "credit" && (
            <CreditAnalyticsView data={creditData} />
          )}

          {currentTab === "transactions" && (
            <TransactionAnalyticsView data={transactionData} />
          )}

          {currentTab === "segmentation" && (
            <SegmentationView
              data={segmentationData}
              onUpdateAgeGroups={handleUpdateAgeGroups}
              isLoading={isLoading}
            />
          )}

          {currentTab === "target" && (
            <TargetSegmentView
              data={targetData}
              onUpdateWeights={handleUpdateWeights}
              isLoading={isLoading}
            />
          )}

          {currentTab === "experiment" && (
            <CampaignExperimentView
              data={experimentData}
              onNavigateToTesting={() => setCurrentTab("testing")}
            />
          )}

          {currentTab === "power" && (
            <PowerAnalysisView
              data={powerData}
              onUpdateParams={handleUpdatePower}
              isLoading={isLoading}
            />
          )}

          {currentTab === "testing" && (
            <HypothesisTestingView
              data={hypothesisData}
              onRunTest={handleRunHypothesisTest}
              isLoading={isLoading}
            />
          )}

          {currentTab === "insights" && (
            <InsightsView
              data={insightsData}
              onNavigateToReport={() => setCurrentTab("report")}
            />
          )}

          {currentTab === "explorer" && (
            <DataExplorerView />
          )}

          {currentTab === "report" && (
            <ExportReportView />
          )}

          {currentTab === "settings" && (
            <SettingsView
              pipelineStages={pipelineStages}
              onResetData={handleLoadDemo}
              onApplyClean={handleApplyClean}
              isLoading={isLoading}
              isCleaned={isCleaned}
              engine={engine}
            />
          )}
        </main>
      </div>

      {/* Global Filter Slide-Over / Modal */}
      <GlobalFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        totalFilteredRecords={overviewData.kpis?.total_customers}
      />
    </div>
  );
}
