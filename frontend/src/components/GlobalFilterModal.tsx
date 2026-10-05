"use client";

import React, { useState } from "react";
import { X, Filter, RotateCcw, Check, Sparkles } from "lucide-react";
import { FilterState } from "../types/analytics";

interface GlobalFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalFilteredRecords?: number;
}

export const GlobalFilterModal: React.FC<GlobalFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  totalFilteredRecords
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>({ ...filters });

  if (!isOpen) return null;

  const handleChange = (key: keyof FilterState, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      gender: "All",
      location: "All",
      occupation: "All",
      marital_status: "All",
      product_category: "All",
      platform: "All",
      payment_type: "All",
      use_raw: false
    };
    setLocalFilters(defaultFilters);
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Global Analytics Filters</h2>
              <p className="text-xs text-slate-500">Refine customer demographics, credit ranges, and transaction attributes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Customer Demographics */}
          <div>
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>1. Customer Demographics</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Gender</label>
                <select
                  value={localFilters.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Location</label>
                <select
                  value={localFilters.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Locations</option>
                  <option value="City">City</option>
                  <option value="Suburb">Suburb</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Marital Status</label>
                <select
                  value={localFilters.marital_status}
                  onChange={(e) => handleChange("marital_status", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Married">Married</option>
                  <option value="Single">Single</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Occupation</label>
                <select
                  value={localFilters.occupation}
                  onChange={(e) => handleChange("occupation", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Occupations</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Fullstack Developer">Fullstack Developer</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Artist">Artist</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Age Range (Min - Max)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min (18)"
                    value={localFilters.age_min ?? ""}
                    onChange={(e) => handleChange("age_min", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max (80)"
                    value={localFilters.age_max ?? ""}
                    onChange={(e) => handleChange("age_max", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Annual Income ($)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min $"
                    value={localFilters.income_min ?? ""}
                    onChange={(e) => handleChange("income_min", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max $"
                    value={localFilters.income_max ?? ""}
                    onChange={(e) => handleChange("income_max", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Credit Profile Attributes */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-3">
              2. Credit Profile Attributes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Credit Score Range (300 - 850)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min (e.g. 580)"
                    value={localFilters.credit_score_min ?? ""}
                    onChange={(e) => handleChange("credit_score_min", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max (850)"
                    value={localFilters.credit_score_max ?? ""}
                    onChange={(e) => handleChange("credit_score_max", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Dataset Tier Mode</label>
                <div className="flex items-center space-x-4 pt-1.5">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="use_raw"
                      checked={!localFilters.use_raw}
                      onChange={() => handleChange("use_raw", false)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 font-medium">Cleaned Dataset (Recommended)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="use_raw"
                      checked={!!localFilters.use_raw}
                      onChange={() => handleChange("use_raw", true)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-amber-700 font-medium">Raw Dirty Dataset</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Transaction Parameters */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-3">
              3. Transaction Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Product Category</label>
                <select
                  value={localFilters.product_category}
                  onChange={(e) => handleChange("product_category", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Sports">Sports</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Travel">Travel</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Merchant Platform</label>
                <select
                  value={localFilters.platform}
                  onChange={(e) => handleChange("platform", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Platforms</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Flipkart">Flipkart</option>
                  <option value="Shopify">Shopify</option>
                  <option value="Alibaba">Alibaba</option>
                  <option value="Myntra">Myntra</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Payment Type</label>
                <select
                  value={localFilters.payment_type}
                  onChange={(e) => handleChange("payment_type", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Payment Types</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Cash">Cash</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="text-xs px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center space-x-1.5 text-xs px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs shadow-indigo-600/30 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
