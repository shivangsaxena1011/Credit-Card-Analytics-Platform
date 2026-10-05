import {
  Customer,
  CreditProfile,
  Transaction,
  ExperimentRecord,
  generateSyntheticData
} from "./dataGenerator";
import { runCleaningPipeline } from "./preprocessing";
import { CleaningReport } from "../../types/analytics";

export interface GlobalFilterParams {
  age_min?: number;
  age_max?: number;
  gender?: string;
  location?: string;
  occupation?: string;
  marital_status?: string;
  income_min?: number;
  income_max?: number;
  credit_score_min?: number;
  credit_score_max?: number;
  product_category?: string;
  platform?: string;
  payment_type?: string;
  date_start?: string;
  date_end?: string;
  use_raw?: boolean;
}

export interface DatasetBundle {
  customers: Customer[];
  credit_profiles: CreditProfile[];
  transactions: Transaction[];
  experiment: ExperimentRecord[];
}

export class DataStore {
  private static instance: DataStore | null = null;

  public seed: number = 42;
  public rawData!: DatasetBundle;
  public cleanedData!: DatasetBundle;
  public cleaningReport!: CleaningReport;
  public isCleaned: boolean = false;
  public pipelineStages: Record<string, string> = {
    RAW_DATA: "Completed",
    VALIDATED: "Completed",
    CLEANED: "Completed",
    ANALYZED: "Completed",
    SEGMENTED: "Completed",
    EXPERIMENT_READY: "Completed",
    TESTED: "Completed"
  };

  private constructor(seed: number = 42) {
    this.reset(seed);
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore(42);
    }
    return DataStore.instance;
  }

  public reset(seed: number = 42): void {
    this.seed = seed;
    const raw = generateSyntheticData(seed);
    this.rawData = {
      customers: raw.customers,
      credit_profiles: raw.creditProfiles,
      transactions: raw.transactions,
      experiment: raw.experiment
    };

    const { cleaned, report } = runCleaningPipeline(
      this.rawData.customers,
      this.rawData.credit_profiles,
      this.rawData.transactions,
      this.rawData.experiment
    );

    this.cleanedData = {
      customers: cleaned.customers,
      credit_profiles: cleaned.creditProfiles,
      transactions: cleaned.transactions,
      experiment: cleaned.experiment
    };
    this.cleaningReport = report;
    this.isCleaned = true;
    this.pipelineStages = {
      RAW_DATA: "Completed",
      VALIDATED: "Completed",
      CLEANED: "Completed",
      ANALYZED: "Completed",
      SEGMENTED: "Completed",
      EXPERIMENT_READY: "Completed",
      TESTED: "Completed"
    };
  }

  public applyCleaning(): CleaningReport {
    const { cleaned, report } = runCleaningPipeline(
      this.rawData.customers,
      this.rawData.credit_profiles,
      this.rawData.transactions,
      this.rawData.experiment
    );
    this.cleanedData = {
      customers: cleaned.customers,
      credit_profiles: cleaned.creditProfiles,
      transactions: cleaned.transactions,
      experiment: cleaned.experiment
    };
    this.cleaningReport = report;
    this.isCleaned = true;
    this.pipelineStages.CLEANED = "Completed";
    this.pipelineStages.ANALYZED = "Completed";
    this.pipelineStages.SEGMENTED = "Completed";
    this.pipelineStages.EXPERIMENT_READY = "Completed";
    return report;
  }

  public getActiveData(useRaw: boolean = false): DatasetBundle {
    return useRaw || !this.isCleaned ? this.rawData : this.cleanedData;
  }

  public filterData(filters: GlobalFilterParams = {}, useRaw: boolean = false): DatasetBundle {
    const base = this.getActiveData(useRaw);
    let cust = [...base.customers];
    let credit = [...base.credit_profiles];
    let txn = [...base.transactions];

    if (filters.age_min !== undefined && filters.age_min !== null) {
      cust = cust.filter(c => c.age !== null && c.age >= Number(filters.age_min));
    }
    if (filters.age_max !== undefined && filters.age_max !== null) {
      cust = cust.filter(c => c.age !== null && c.age <= Number(filters.age_max));
    }
    if (filters.gender && filters.gender !== "All") {
      cust = cust.filter(c => c.gender === filters.gender);
    }
    if (filters.location && filters.location !== "All") {
      cust = cust.filter(c => c.location === filters.location);
    }
    if (filters.occupation && filters.occupation !== "All") {
      cust = cust.filter(c => c.occupation === filters.occupation);
    }
    if (filters.marital_status && filters.marital_status !== "All") {
      cust = cust.filter(c => c.marital_status === filters.marital_status);
    }
    if (filters.income_min !== undefined && filters.income_min !== null) {
      cust = cust.filter(c => c.annual_income !== null && c.annual_income >= Number(filters.income_min));
    }
    if (filters.income_max !== undefined && filters.income_max !== null) {
      cust = cust.filter(c => c.annual_income !== null && c.annual_income <= Number(filters.income_max));
    }

    const validCustIds = new Set(cust.map(c => c.cust_id));

    credit = credit.filter(cp => validCustIds.has(cp.cust_id));
    if (filters.credit_score_min !== undefined && filters.credit_score_min !== null) {
      credit = credit.filter(cp => cp.credit_score !== null && cp.credit_score >= Number(filters.credit_score_min));
    }
    if (filters.credit_score_max !== undefined && filters.credit_score_max !== null) {
      credit = credit.filter(cp => cp.credit_score !== null && cp.credit_score <= Number(filters.credit_score_max));
    }

    const validCreditCustIds = new Set(credit.map(cp => cp.cust_id));
    cust = cust.filter(c => validCreditCustIds.has(c.cust_id));

    txn = txn.filter(t => validCreditCustIds.has(t.cust_id));

    if (filters.product_category && filters.product_category !== "All") {
      txn = txn.filter(t => t.product_category === filters.product_category);
    }
    if (filters.platform && filters.platform !== "All") {
      txn = txn.filter(t => t.platform === filters.platform);
    }
    if (filters.payment_type && filters.payment_type !== "All") {
      txn = txn.filter(t => t.payment_type === filters.payment_type);
    }
    if (filters.date_start) {
      txn = txn.filter(t => t.tran_date >= filters.date_start!);
    }
    if (filters.date_end) {
      txn = txn.filter(t => t.tran_date <= filters.date_end!);
    }

    return {
      customers: cust,
      credit_profiles: credit,
      transactions: txn,
      experiment: base.experiment
    };
  }

  public toCsv(tableName: "customers" | "credit_profiles" | "transactions" | "experiment", useRaw: boolean = false): string {
    const data = this.getActiveData(useRaw);
    const rows: any[] = data[tableName] || [];
    if (!rows.length) return "";

    const headers = Object.keys(rows[0]);
    const lines = [headers.join(",")];

    for (const r of rows) {
      const vals = headers.map(h => {
        const v = r[h];
        if (v === null || v === undefined) return "";
        if (typeof v === "string" && (v.includes(",") || v.includes("\"") || v.includes("\n"))) {
          return `"${v.replace(/"/g, '""')}"`;
        }
        return String(v);
      });
      lines.push(vals.join(","));
    }

    return lines.join("\n");
  }
}

export function getDataStore(): DataStore {
  return DataStore.getInstance();
}
