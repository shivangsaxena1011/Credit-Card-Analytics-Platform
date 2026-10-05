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
  const loadData = useCallback(async (currentFilters: FilterState) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Pipeline status
      const pipeRes = await api.getPipelineStatus();
      setPipelineStages(pipeRes.stages);
      setIsCleaned(pipeRes.is_cleaned);

      // 2. Fetch parallel analytics endpoints
      const [
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
        api.getOverview(currentFilters),
        api.getDataQuality(),
        api.getCustomerAnalytics(currentFilters),
        api.getCreditAnalytics(currentFilters),
        api.getTransactionAnalytics(currentFilters),
        api.getSegments(undefined, currentFilters),
        api.getTargetSegmentAnalysis(undefined, undefined, currentFilters),
        api.getExperimentSummary(),
        api.getPowerAnalysis(),
        api.runHypothesisTest("z_test", "larger", 0.05),
        api.getInsights(currentFilters)
      ]);

      setOverviewData({
        kpis: ovRes.kpis,
        customer_distributions: ovRes.customer_distributions,
        credit_distributions: ovRes.credit_distributions,
        transaction_distributions: ovRes.transaction_distributions
      });
      setQualityData(qualRes);
      setCustomerData(custRes);
      setCreditData(credRes);
      setTransactionData(txnRes);
      setSegmentationData(segRes);
      setTargetData(tarRes);
      setExperimentData(expRes);
      setPowerData(powRes);
      setHypothesisData(hypRes);
      setInsightsData(insRes);
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
    try {
      const rep = await api.cleanData();
      setCleaningReport(rep);
      setIsCleaned(true);
      await loadData(filters);
    } catch (err: any) {
      console.error("Clean failed", err);
      setErrorMsg("Failed to run cleaning pipeline");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleLoadDemo = async (seed: number = 42) => {
    setIsLoading(true);
    try {
      await api.resetData(seed);
      await loadData(filters);
    } catch (err: any) {
      console.error("Reset failed", err);
      setErrorMsg("Failed to reset demo dataset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAgeGroups = async (groups: AgeGroupConfig[]) => {
    setIsLoading(true);
    try {
      const segRes = await api.getSegments(groups, filters);
      const tarRes = await api.getTargetSegmentAnalysis(undefined, groups, filters);
      setSegmentationData(segRes);
      setTargetData(tarRes);
    } catch (err: any) {
      console.error("Age group update failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWeights = async (weights: Record<string, number>) => {
    setIsLoading(true);
    try {
      const tarRes = await api.getTargetSegmentAnalysis(weights, undefined, filters);
      setTargetData(tarRes);
    } catch (err: any) {
      console.error("Weights update failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunHypothesisTest = async (testType: string, alt: string, alpha: number) => {
    setIsLoading(true);
    try {
      const hypRes = await api.runHypothesisTest(testType, alt, alpha);
      setHypothesisData(hypRes);
    } catch (err: any) {
      console.error("Hypothesis test failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePower = async (alpha: number, power: number, effectSize: number, alt: string) => {
    setIsLoading(true);
    try {
      const powRes = await api.getPowerAnalysis(alpha, power, effectSize, alt);
      setPowerData(powRes);
    } catch (err: any) {
      console.error("Power update failed", err);
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
        />

        {/* Error Notification Banner if any */}
        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-800">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold underline ml-3">
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
