/**
 * CreditIQ Analytics - Synthetic Data Generator (TypeScript)
 * Generates realistic customers, credit profiles, transactions, and experiment datasets.
 */

export interface Customer {
  cust_id: string;
  name: string;
  gender: string;
  age: number;
  location: string;
  occupation: string;
  annual_income: number | null;
  marital_status: string | null;
}

export interface CreditProfile {
  cust_id: string;
  credit_score: number;
  credit_utilisation: number | null;
  outstanding_debt: number;
  credit_inquiries_last_6_months: number | null;
  credit_limit: number | null;
}

export interface Transaction {
  tran_id: string;
  cust_id: string;
  tran_date: string;
  tran_amount: number;
  platform: string | null;
  product_category: string | null;
  payment_type: string | null;
}

export interface ExperimentRecord {
  experiment_date: string;
  group: "Control" | "Test";
  customer_id: string;
  metric_value: number;
}

const FIRST_NAMES_MALE = [
  "Aarav", "Vihaan", "Aditya", "Rohan", "Kabir", "Arjun", "Rahul", "Dev", "Vikram",
  "Kunal", "Siddharth", "Amit", "Naveen", "Varun", "Manish", "Gaurav", "Karan",
  "Sanjay", "Anand", "Rishi", "Sameer", "Rajesh", "Prakash", "Nikhil", "Tarun"
];
const FIRST_NAMES_FEMALE = [
  "Ananya", "Diya", "Isha", "Rhea", "Pooja", "Sneha", "Kavya", "Tanvi", "Neha",
  "Priyanka", "Shruti", "Meera", "Deepika", "Shreya", "Aditi", "Simran", "Nandini",
  "Ritu", "Swati", "Preeti", "Komal", "Divya", "Sunita", "Megha", "Jyoti"
];
const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Mehta", "Iyer", "Nair", "Rao", "Reddy", "Singh",
  "Kapoor", "Chatterjee", "Banerjee", "Deshmukh", "Joshi", "Bhat", "Saxena",
  "Gupta", "Agarwal", "Bose", "Choudhury", "Menon", "Pillai", "Kulkarni", "Das"
];

const LOCATIONS = ["City", "Suburb", "Rural"];
const OCCUPATIONS = [
  "Freelancer", "Consultant", "Business Owner", "Data Scientist",
  "Fullstack Developer", "Accountant", "Artist"
];

const OCC_INCOME: Record<string, [number, number, number, number]> = {
  "Freelancer": [52000, 16000, 28000, 95000],
  "Consultant": [98000, 24000, 55000, 175000],
  "Business Owner": [125000, 38000, 60000, 240000],
  "Data Scientist": [115000, 22000, 68000, 190000],
  "Fullstack Developer": [105000, 20000, 62000, 175000],
  "Accountant": [72000, 14000, 42000, 115000],
  "Artist": [45000, 15000, 24000, 85000]
};

const PLATFORMS = ["Amazon", "Flipkart", "Shopify", "Alibaba", "Myntra", "Other"];
const PRODUCT_CATEGORIES = [
  "Electronics", "Fashion & Apparel", "Beauty & Personal Care", "Sports",
  "Home & Kitchen", "Groceries", "Travel", "Entertainment"
];
const PAYMENT_TYPES = ["Credit Card", "Debit Card", "UPI", "PhonePe", "Cash", "Net Banking"];

// Deterministic Pseudo-Random Number Generator (PRNG)
class PRNG {
  private s: number;
  constructor(seed: number = 42) {
    this.s = seed % 2147483647;
    if (this.s <= 0) this.s += 2147483646;
  }
  next(): number {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  normal(mean: number, std: number): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * std;
  }
  choice<T>(arr: T[], weights?: number[]): T {
    if (!weights) {
      return arr[Math.floor(this.next() * arr.length)];
    }
    const r = this.next();
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += weights[i];
      if (r <= sum) return arr[i];
    }
    return arr[arr.length - 1];
  }
}

export function generateSyntheticData(seed: number = 42, nCustomers = 1000, nTransactions = 65000) {
  const rng = new PRNG(seed);

  // 1. Customers
  const customers: Customer[] = [];
  const custAgeMap = new Map<string, number>();

  for (let i = 0; i < nCustomers; i++) {
    const custId = `CUST${String(i + 1).padStart(4, "0")}`;
    const gender = rng.next() < 0.52 ? "Male" : "Female";
    const firstName = rng.choice(gender === "Male" ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
    const lastName = rng.choice(LAST_NAMES);

    let age: number;
    const r = rng.next();
    if (r < 0.35) {
      age = Math.max(18, Math.min(32, Math.round(rng.normal(24, 3.5))));
    } else if (r < 0.70) {
      age = Math.max(26, Math.min(52, Math.round(rng.normal(38, 6.0))));
    } else {
      age = Math.max(45, Math.min(75, Math.round(rng.normal(56, 5.0))));
    }

    const location = rng.choice(LOCATIONS, [0.55, 0.30, 0.15]);
    const occupation = rng.choice(OCCUPATIONS, [0.15, 0.18, 0.14, 0.16, 0.17, 0.12, 0.08]);

    const [meanInc, stdInc, minInc, maxInc] = OCC_INCOME[occupation];
    const expMult = Math.max(0.65, Math.min(1.35, 0.75 + 0.35 * (1 - Math.abs(age - 45) / 35)));
    let income = Math.round(Math.max(minInc, Math.min(maxInc * 1.2, rng.normal(meanInc * expMult, stdInc))) / 100) * 100;

    const pMarried = age < 26 ? 0.15 : age < 45 ? 0.65 : 0.82;
    let marital: string | null = rng.next() < pMarried ? "Married" : "Single";

    customers.push({
      cust_id: custId,
      name: `${firstName} ${lastName}`,
      gender,
      age,
      location,
      occupation,
      annual_income: income,
      marital_status: marital
    });
    custAgeMap.set(custId, age);
  }

  // Inject Dirty Customer Data
  const dirtyAges = [1, 2, 2, 110, 115, 120, 122, -4, 0, 118];
  for (let i = 0; i < 10; i++) {
    const idx = Math.floor(rng.next() * nCustomers);
    customers[idx].age = dirtyAges[i];
  }
  for (let i = 0; i < 48; i++) {
    const idx = Math.floor(rng.next() * nCustomers);
    customers[idx].annual_income = null;
  }
  for (let i = 0; i < 8; i++) {
    const idx = Math.floor(rng.next() * nCustomers);
    customers[idx].marital_status = null;
  }

  // 2. Credit Profiles
  const creditProfiles: CreditProfile[] = [];
  for (let i = 0; i < nCustomers; i++) {
    const c = customers[i];
    const effAge = (c.age < 15 || c.age > 85) ? 35 : c.age;
    const effInc = c.annual_income ?? 75000;

    const baseScore = effAge < 26 ? 640 : effAge < 49 ? 695 : 725;
    let score = Math.max(320, Math.min(850, Math.round(rng.normal(baseScore, 55))));

    const scoreFactor = (score - 300) / 550;
    let limit = Math.max(1500, Math.min(45000, Math.round(((effInc * 0.28) * scoreFactor + rng.normal(3000, 1200)) / 100) * 100));

    const baseUtil = effAge < 26 ? 0.48 : 0.32;
    let util = Math.max(0.02, Math.min(0.96, Math.round(rng.normal(baseUtil, 0.18) * 10000) / 10000));
    let debt = Math.round(limit * util * 100) / 100;

    let inq = Math.min(6, Math.max(0, Math.round(rng.normal(effAge < 30 ? 1.4 : 0.8, 1.0))));

    creditProfiles.push({
      cust_id: c.cust_id,
      credit_score: score,
      credit_utilisation: util,
      outstanding_debt: debt,
      credit_inquiries_last_6_months: inq,
      credit_limit: limit
    });
  }

  // Inject Dirty Credit Data
  for (let i = 0; i < 28; i++) {
    const idx = Math.floor(rng.next() * nCustomers);
    creditProfiles[idx].credit_limit = null;
  }
  for (let i = 0; i < 22; i++) {
    const idx = Math.floor(rng.next() * nCustomers);
    if (creditProfiles[idx].credit_limit !== null) {
      creditProfiles[idx].outstanding_debt = Math.round(creditProfiles[idx].credit_limit! * (1.15 + rng.next() * 0.5) * 100) / 100;
    }
  }
  for (let i = 0; i < 15; i++) {
    const idx = Math.floor(rng.next() * nCustomers);
    if (i < 8) creditProfiles[idx].credit_utilisation = null;
    else creditProfiles[idx].credit_inquiries_last_6_months = null;
  }

  // 6 Duplicate Credit Profiles
  for (let i = 0; i < 6; i++) {
    const orig = creditProfiles[i];
    creditProfiles.push({
      ...orig,
      credit_limit: orig.credit_limit ? orig.credit_limit * 1.05 : null
    });
  }

  // 3. Transactions (65k records)
  const transactions: Transaction[] = [];
  const startDate = new Date(2025, 0, 1).getTime();

  for (let i = 0; i < nTransactions; i++) {
    const tranId = `TXN${String(i + 1).padStart(6, "0")}`;
    const custId = `CUST${String(Math.floor(rng.next() * nCustomers) + 1).padStart(4, "0")}`;
    const cAge = custAgeMap.get(custId) ?? 35;
    const isYoung = (cAge >= 18 && cAge <= 25);

    const dayOffset = Math.floor(rng.next() * 365);
    const dateObj = new Date(startDate + dayOffset * 86400000 + Math.floor(rng.next() * 86400000));
    const tranDate = dateObj.toISOString().replace("T", " ").substring(0, 19);

    let platform: string | null = rng.choice(PLATFORMS, [0.38, 0.28, 0.12, 0.06, 0.11, 0.05]);
    let catWeights = isYoung
      ? [0.26, 0.24, 0.18, 0.08, 0.06, 0.06, 0.05, 0.07]
      : [0.18, 0.16, 0.11, 0.12, 0.15, 0.14, 0.09, 0.05];
    let payWeights = isYoung
      ? [0.24, 0.18, 0.32, 0.16, 0.06, 0.04]
      : [0.46, 0.16, 0.18, 0.08, 0.04, 0.08];

    let category: string | null = rng.choice(PRODUCT_CATEGORIES, catWeights);
    let payType: string | null = rng.choice(PAYMENT_TYPES, payWeights);

    // Amount: Log-normal distribution
    let amt = Math.exp(rng.normal(isYoung ? 4.75 : 5.10, 0.70));
    if (category === "Electronics") amt *= 1.45;
    else if (category === "Travel") amt *= 1.85;
    else if (category === "Groceries") amt *= 0.55;

    amt = Math.max(8.5, Math.min(3200.0, Math.round(amt * 100) / 100));

    // Controlled dirty data
    if (rng.next() < 0.015) platform = null;
    if (rng.next() < 0.005) amt = 0.0;
    if (rng.next() < 0.008) category = null;
    if (rng.next() < 0.008) payType = null;

    transactions.push({
      tran_id: tranId,
      cust_id: custId,
      tran_date: tranDate,
      tran_amount: amt,
      platform,
      product_category: category,
      payment_type: payType
    });
  }

  // 7 Extreme Transaction Outliers
  const extremeIdxs = [12, 1450, 8900, 24000, 39000, 52000, 61000];
  const extremeAmts = [42500, 58000, 72000, 39500, 84000, 65000, 49000];
  for (let j = 0; j < extremeIdxs.length; j++) {
    if (extremeIdxs[j] < transactions.length) {
      transactions[extremeIdxs[j]].tran_amount = extremeAmts[j];
    }
  }

  // 4. Experiment Dataset (A/B Test)
  const experiment: ExperimentRecord[] = [];
  const nExp = 1400;
  for (let i = 0; i < nExp; i++) {
    const day = (i % 30) + 1;
    const dateStr = `2025-09-${String(day).padStart(2, "0")}`;
    
    // Control
    const ctrlVal = Math.round(Math.max(15.0, Math.min(450.0, rng.normal(146.20, 38.50))) * 100) / 100;
    experiment.push({
      experiment_date: dateStr,
      group: "Control",
      customer_id: `EXP_CUST_${String(i + 1).padStart(4, "0")}`,
      metric_value: ctrlVal
    });

    // Test (Lift ~ +8.6%)
    const testVal = Math.round(Math.max(18.0, Math.min(480.0, rng.normal(158.80, 39.20))) * 100) / 100;
    experiment.push({
      experiment_date: dateStr,
      group: "Test",
      customer_id: `EXP_CUST_${String(nExp + i + 1).padStart(4, "0")}`,
      metric_value: testVal
    });
  }

  return { customers, creditProfiles, transactions, experiment };
}
