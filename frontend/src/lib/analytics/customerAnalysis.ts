/**
 * CreditIQ Analytics - Customer Analytics Engine (TypeScript)
 */

import { Customer } from "./dataGenerator";
import { CustomerAnalyticsData } from "../../types/analytics";

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function analyzeCustomers(customers: Customer[]): CustomerAnalyticsData {
  if (customers.length === 0) {
    return {
      summary: {
        total_customers: 0, avg_income: 0, median_income: 0,
        youngest_age: 0, oldest_age: 0, largest_occupation: "N/A"
      },
      age_distribution: [],
      income_distribution: [],
      income_by_occupation: [],
      location_distribution: [],
      gender_distribution: [],
      marital_distribution: [],
      income_vs_age: [],
      occupation_location_matrix: []
    };
  }

  const validAges = customers.filter(c => c.age >= 15 && c.age <= 85).map(c => c.age);
  const youngest = validAges.length > 0 ? Math.min(...validAges) : 18;
  const oldest = validAges.length > 0 ? Math.max(...validAges) : 75;

  const validIncomes = customers.filter(c => c.annual_income !== null && !isNaN(c.annual_income)).map(c => c.annual_income!);
  const avgIncome = validIncomes.length > 0 ? validIncomes.reduce((a, b) => a + b, 0) / validIncomes.length : 0;
  const medianIncome = median(validIncomes);

  // Largest occupation
  const occCounts: Record<string, number> = {};
  for (const c of customers) {
    occCounts[c.occupation] = (occCounts[c.occupation] || 0) + 1;
  }
  let largestOcc = "Consultant";
  let maxOccCount = 0;
  for (const [occ, cnt] of Object.entries(occCounts)) {
    if (cnt > maxOccCount) {
      maxOccCount = cnt;
      largestOcc = occ;
    }
  }

  // Age buckets
  const ageLabels = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"];
  const ageBins = [
    { label: "18-25", min: 18, max: 25 },
    { label: "26-35", min: 26, max: 35 },
    { label: "36-45", min: 36, max: 45 },
    { label: "46-55", min: 46, max: 55 },
    { label: "56-65", min: 56, max: 65 },
    { label: "65+", min: 66, max: 125 }
  ];
  const ageDist = ageBins.map(b => {
    const cnt = customers.filter(c => c.age >= b.min && c.age <= b.max).length;
    return {
      age_group: b.label,
      count: cnt,
      percentage: Math.round((cnt / customers.length) * 1000) / 10
    };
  });

  // Income distribution brackets
  const incBins = [
    { label: "<$40k", min: 0, max: 40000 },
    { label: "$40k-$60k", min: 40001, max: 60000 },
    { label: "$60k-$80k", min: 60001, max: 80000 },
    { label: "$80k-$100k", min: 80001, max: 100000 },
    { label: "$100k-$130k", min: 100001, max: 130000 },
    { label: "$130k-$160k", min: 130001, max: 160000 },
    { label: "$160k+", min: 160001, max: 10000000 }
  ];
  const incDist = incBins.map(b => {
    const cnt = customers.filter(c => (c.annual_income ?? 0) >= b.min && (c.annual_income ?? 0) <= b.max).length;
    return {
      income_bracket: b.label,
      count: cnt,
      percentage: Math.round((cnt / customers.length) * 1000) / 10
    };
  });

  // Income by occupation
  const occGroupMap: Record<string, number[]> = {};
  for (const c of customers) {
    if (c.annual_income !== null) {
      if (!occGroupMap[c.occupation]) occGroupMap[c.occupation] = [];
      occGroupMap[c.occupation].push(c.annual_income);
    }
  }
  const incomeByOcc = Object.entries(occGroupMap).map(([occ, incs]) => {
    const sum = incs.reduce((a, b) => a + b, 0);
    return {
      occupation: occ,
      avg_income: Math.round(sum / incs.length),
      median_income: Math.round(median(incs)),
      min_income: Math.min(...incs),
      max_income: Math.max(...incs),
      count: incs.length
    };
  }).sort((a, b) => b.median_income - a.median_income);

  // Location distribution
  const locCounts: Record<string, number> = {};
  for (const c of customers) locCounts[c.location] = (locCounts[c.location] || 0) + 1;
  const locDist = Object.entries(locCounts).map(([loc, cnt]) => ({
    location: loc,
    count: cnt,
    percentage: Math.round((cnt / customers.length) * 1000) / 10
  }));

  // Gender distribution
  const genCounts: Record<string, number> = {};
  for (const c of customers) genCounts[c.gender] = (genCounts[c.gender] || 0) + 1;
  const genDist = Object.entries(genCounts).map(([g, cnt]) => ({
    gender: g,
    count: cnt,
    percentage: Math.round((cnt / customers.length) * 1000) / 10
  }));

  // Marital status
  const marCounts: Record<string, number> = {};
  for (const c of customers) {
    const m = c.marital_status || "Unknown";
    marCounts[m] = (marCounts[m] || 0) + 1;
  }
  const marDist = Object.entries(marCounts).map(([m, cnt]) => ({
    marital_status: m,
    count: cnt,
    percentage: Math.round((cnt / customers.length) * 1000) / 10
  }));

  // Sample scatter points (up to 250)
  const scatterSample = customers
    .filter(c => c.age >= 18 && c.age <= 80 && c.annual_income !== null)
    .slice(0, 250)
    .map(c => ({
      age: c.age,
      income: c.annual_income!,
      occupation: c.occupation,
      name: c.name
    }));

  // Occupation x location matrix
  const occLocMatrix: Array<{ occupation: string; City: number; Suburb: number; Rural: number }> = [];
  for (const occ of Object.keys(occGroupMap)) {
    const cityIncs = customers.filter(c => c.occupation === occ && c.location === "City" && c.annual_income !== null).map(c => c.annual_income!);
    const subIncs = customers.filter(c => c.occupation === occ && c.location === "Suburb" && c.annual_income !== null).map(c => c.annual_income!);
    const rurIncs = customers.filter(c => c.occupation === occ && c.location === "Rural" && c.annual_income !== null).map(c => c.annual_income!);
    occLocMatrix.push({
      occupation: occ,
      City: cityIncs.length > 0 ? Math.round(cityIncs.reduce((a, b) => a + b, 0) / cityIncs.length) : 0,
      Suburb: subIncs.length > 0 ? Math.round(subIncs.reduce((a, b) => a + b, 0) / subIncs.length) : 0,
      Rural: rurIncs.length > 0 ? Math.round(rurIncs.reduce((a, b) => a + b, 0) / rurIncs.length) : 0
    });
  }

  return {
    summary: {
      total_customers: customers.length,
      avg_income: Math.round(avgIncome * 100) / 100,
      median_income: Math.round(medianIncome * 100) / 100,
      youngest_age: youngest,
      oldest_age: oldest,
      largest_occupation: largestOcc
    },
    age_distribution: ageDist,
    income_distribution: incDist,
    income_by_occupation: incomeByOcc,
    location_distribution: locDist,
    gender_distribution: genDist,
    marital_distribution: marDist,
    income_vs_age: scatterSample,
    occupation_location_matrix: occLocMatrix
  };
}
