/**
 * @fileoverview Earnings visualization graphs with multiple chart types.
 * @module components/earnings/earnings-graph
 */

"use client"

import { useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, Calendar } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartDataPoint } from "./types"

// Mock monthly data
const MONTHLY_DATA: ChartDataPoint[] = [
  { name: "Jul", earnings: 18500, commission: 2775, projects: 12 },
  { name: "Aug", earnings: 22000, commission: 3300, projects: 15 },
  { name: "Sep", earnings: 19500, commission: 2925, projects: 13 },
  { name: "Oct", earnings: 25000, commission: 3750, projects: 17 },
  { name: "Nov", earnings: 21500, commission: 3225, projects: 14 },
  { name: "Dec", earnings: 24500, commission: 3675, projects: 16 },
]

// Mock weekly data
const WEEKLY_DATA: ChartDataPoint[] = [
  { name: "Week 1", earnings: 5200, commission: 780, projects: 4 },
  { name: "Week 2", earnings: 6800, commission: 1020, projects: 5 },
  { name: "Week 3", earnings: 5500, commission: 825, projects: 4 },
  { name: "Week 4", earnings: 7000, commission: 1050, projects: 5 },
]

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(142, 76%, 36%)",
  },
  commission: {
    label: "Commission",
    color: "hsl(221, 83%, 53%)",
  },
  projects: {
    label: "Projects",
    color: "hsl(262, 83%, 58%)",
  },
} satisfies ChartConfig

type ViewMode = "monthly" | "weekly"
type ChartType = "area" | "bar" | "line"

export function EarningsGraph() {
  const [viewMode, setViewMode] = useState<ViewMode>("monthly")
  const [chartType, setChartType] = useState<ChartType>("area")

  const data = viewMode === "monthly" ? MONTHLY_DATA : WEEKLY_DATA

  const totalEarnings = data.reduce((acc, d) => acc + d.earnings, 0)
  const totalCommission = data.reduce((acc, d) => acc + d.commission, 0)
  const totalProjects = data.reduce((acc, d) => acc + (d.projects || 0), 0)

  const avgMonthlyEarnings = totalEarnings / data.length

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {viewMode === "monthly" ? "6-Month" : "4-Week"} Total
            </p>
            <p className="text-2xl font-bold">
              {totalEarnings.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Commission</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalCommission.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Projects Completed</p>
            <p className="text-2xl font-bold">{totalProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Avg {viewMode === "monthly" ? "Monthly" : "Weekly"}
            </p>
            <p className="text-2xl font-bold">
              {avgMonthlyEarnings.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Earnings Overview
              </CardTitle>
              <CardDescription>
                Your earnings and commission trends
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "monthly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("monthly")}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Monthly
                </Button>
                <Button
                  variant={viewMode === "weekly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("weekly")}
                >
                  Weekly
                </Button>
              </div>
              {/* Chart Type Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={chartType === "area" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("area")}
                >
                  Area
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                >
                  Bar
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType("line")}
                >
                  Line
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            {chartType === "area" ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <span>
                          {typeof value === "number"
                            ? value.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              })
                            : value}
                        </span>
                      )}
                    />
                  }
                />
                <defs>
                  <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-earnings)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-earnings)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-commission)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-commission)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="var(--color-earnings)"
                  fill="url(#fillEarnings)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  stroke="var(--color-commission)"
                  fill="url(#fillCommission)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : chartType === "bar" ? (
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <span>
                          {typeof value === "number"
                            ? value.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              })
                            : value}
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="earnings"
                  fill="var(--color-earnings)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="commission"
                  fill="var(--color-commission)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <span>
                          {typeof value === "number"
                            ? value.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              })
                            : value}
                        </span>
                      )}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="var(--color-earnings)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-earnings)", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="var(--color-commission)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-commission)", strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ChartContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[hsl(142,76%,36%)]" />
              <span className="text-sm text-muted-foreground">Earnings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[hsl(221,83%,53%)]" />
              <span className="text-sm text-muted-foreground">Commission</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Insight */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">
                Great Progress!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Your earnings have increased by 14% compared to the previous period.
                Keep up the excellent work!
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  +14% Growth
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Above Average
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
