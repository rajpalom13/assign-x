"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface EarningsDataPoint {
  month: string;
  earnings: number;
  commission: number;
}

type TimeRange = "monthly" | "weekly";

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

export interface EarningsChartV2Props {
  /** Optional className for custom styling */
  className?: string;
  /** Optional data override - uses mock data if not provided */
  data?: {
    monthly?: EarningsDataPoint[];
    weekly?: EarningsDataPoint[];
  };
}

// Mock data with realistic earnings progression
const monthlyData: EarningsDataPoint[] = [
  { month: "Jan", earnings: 45000, commission: 12000 },
  { month: "Feb", earnings: 52000, commission: 14500 },
  { month: "Mar", earnings: 48000, commission: 13200 },
  { month: "Apr", earnings: 61000, commission: 16800 },
  { month: "May", earnings: 58000, commission: 15900 },
  { month: "Jun", earnings: 67000, commission: 18400 },
];

const weeklyData: EarningsDataPoint[] = [
  { month: "Week 1", earnings: 15000, commission: 4200 },
  { month: "Week 2", earnings: 17500, commission: 4800 },
  { month: "Week 3", earnings: 14200, commission: 3900 },
  { month: "Week 4", earnings: 16800, commission: 4600 },
  { month: "Week 5", earnings: 18500, commission: 5100 },
  { month: "Week 6", earnings: 19200, commission: 5300 },
];

// Custom Tooltip Component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 capitalize">{entry.name}:</span>
            <span className="font-semibold text-gray-900">
              ₹{entry.value.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Calculate trend
const calculateTrend = (data: EarningsDataPoint[]): {
  percentage: number;
  isPositive: boolean;
} => {
  if (data.length < 2) return { percentage: 0, isPositive: true };

  const latest = data[data.length - 1].earnings;
  const previous = data[data.length - 2].earnings;
  const percentage = ((latest - previous) / previous) * 100;

  return {
    percentage: Math.abs(percentage),
    isPositive: percentage >= 0,
  };
};

export function EarningsChartV2({ className, data }: EarningsChartV2Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");

  // Use provided data or fallback to mock data
  const chartMonthlyData = data?.monthly ?? monthlyData;
  const chartWeeklyData = data?.weekly ?? weeklyData;

  const currentData = timeRange === "monthly" ? chartMonthlyData : chartWeeklyData;
  const trend = calculateTrend(currentData);

  // Calculate total earnings
  const totalEarnings = currentData.reduce((sum, item) => sum + item.earnings, 0);
  const totalCommission = currentData.reduce((sum, item) => sum + item.commission, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-2xl border border-gray-200 bg-white p-6", className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Earnings Overview
          </h3>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Total Earnings
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          </div>
        </div>

        {/* Time Range Toggle */}
        <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setTimeRange("weekly")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              timeRange === "weekly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange("monthly")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              timeRange === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-sm text-gray-600">Earnings</span>
          <span className="text-sm font-semibold text-gray-900">
            ₹{totalEarnings.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-sm text-gray-600">Commission</span>
          <span className="text-sm font-semibold text-gray-900">
            ₹{totalCommission.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={currentData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Gradient for earnings */}
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
              {/* Gradient for commission */}
              <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9CA3AF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#E5E7EB"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Commission area (background) */}
            <Area
              type="monotone"
              dataKey="commission"
              stroke="#9CA3AF"
              strokeWidth={2}
              fill="url(#commissionGradient)"
              animationDuration={800}
              name="commission"
            />

            {/* Earnings area (foreground) */}
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#F97316"
              strokeWidth={3}
              fill="url(#earningsGradient)"
              animationDuration={800}
              name="earnings"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
