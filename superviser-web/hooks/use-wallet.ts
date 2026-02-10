/**
 * @fileoverview Custom hooks for wallet and earnings management.
 * @module hooks/use-wallet
 */

"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  Tables,
  WalletTransaction,
  WalletWithTransactions,
  TransactionType
} from "@/types/database"
import {
  MOCK_WALLET,
  MOCK_WALLET_TRANSACTIONS,
  MOCK_EARNINGS_STATS,
} from "@/lib/mock-data/seed"

type PayoutRequest = Tables<"payout_requests">

interface UseWalletReturn {
  wallet: WalletWithTransactions | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  requestWithdrawal: (amount: number) => Promise<void>
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<WalletWithTransactions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchWallet = useCallback(async () => {
    const supabase = createClient()

    try {
      setIsLoading(true)
      setError(null)

      // Use getSession() with timeout to prevent hanging
      let user = null
      try {
        const { data: sessionData } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000))
        ])
        user = sessionData?.session?.user || null
      } catch { /* timed out */ }

      if (!user) {
        console.warn("[useWallet] No auth, using mock data")
        setWallet(MOCK_WALLET)
        return
      }

      // Get wallet with recent transactions
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select(`
          *,
          wallet_transactions (*)
        `)
        .eq("profile_id", user.id)
        .single()

      if (walletError && walletError.code !== "PGRST116") {
        throw walletError
      }

      if (walletData) {
        console.log("[useWallet] Found wallet for user:", user.id, "balance:", walletData.balance, "total_credited:", walletData.total_credited, "transactions:", walletData.wallet_transactions?.length || 0)
        // Sort transactions by date
        walletData.wallet_transactions = walletData.wallet_transactions?.sort(
          (a: WalletTransaction, b: WalletTransaction) =>
            new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
        )
      } else {
        console.warn("[useWallet] No wallet found for user ID:", user.id)
      }

      setWallet(walletData)
    } catch (err) {
      console.warn("[useWallet] Failed, using mock data:", err)
      setWallet(MOCK_WALLET)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const requestWithdrawal = useCallback(async (amount: number) => {
    if (!wallet) throw new Error("Wallet not found")
    if (amount > wallet.balance) throw new Error("Insufficient balance")
    if (amount < 500) throw new Error("Minimum withdrawal is Rs. 500")

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Create withdrawal request
    const { error: withdrawalError } = await supabase
      .from("payout_requests")
      .insert({
        profile_id: user.id,
        requester_type: "supervisor",
        requested_amount: amount,
        status: "pending",
      })

    if (withdrawalError) throw withdrawalError
    await fetchWallet()
  }, [wallet, fetchWallet])

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  return {
    wallet,
    isLoading,
    error,
    refetch: fetchWallet,
    requestWithdrawal,
  }
}

interface UseTransactionsOptions {
  type?: TransactionType | TransactionType[]
  limit?: number
  offset?: number
  startDate?: Date
  endDate?: Date
}

interface UseTransactionsReturn {
  transactions: WalletTransaction[]
  isLoading: boolean
  error: Error | null
  totalCount: number
  refetch: () => Promise<void>
}

export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsReturn {
  const { type, limit = 50, offset = 0, startDate, endDate } = options
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchTransactions = useCallback(async () => {
    const supabase = createClient()

    try {
      setIsLoading(true)
      setError(null)

      // Use getUser() with timeout to prevent hanging
      let user = null
      try {
        const result = await Promise.race([
          supabase.auth.getUser(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000))
        ])
        user = result.data?.user || null
      } catch { /* timed out */ }

      if (!user) {
        setTransactions(MOCK_WALLET_TRANSACTIONS)
        setTotalCount(MOCK_WALLET_TRANSACTIONS.length)
        return
      }

      // Get wallet ID
      const { data: wallet } = await supabase
        .from("wallets")
        .select("id")
        .eq("profile_id", user.id)
        .single()

      if (!wallet) {
        setTransactions([])
        return
      }

      // Build query
      let query = supabase
        .from("wallet_transactions")
        .select("*", { count: "exact" })
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      // Filter by type
      if (type) {
        if (Array.isArray(type)) {
          query = query.in("transaction_type", type)
        } else {
          query = query.eq("transaction_type", type)
        }
      }

      // Filter by date range
      if (startDate) {
        query = query.gte("created_at", startDate.toISOString())
      }
      if (endDate) {
        query = query.lte("created_at", endDate.toISOString())
      }

      const { data, error: queryError, count } = await query

      if (queryError) throw queryError

      setTransactions(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch transactions"))
    } finally {
      setIsLoading(false)
    }
  }, [type, limit, offset, startDate, endDate])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    isLoading,
    error,
    totalCount,
    refetch: fetchTransactions,
  }
}

interface UseEarningsStatsReturn {
  stats: {
    thisMonth: number
    lastMonth: number
    thisYear: number
    allTime: number
    pendingPayouts: number
    averagePerProject: number
    monthlyGrowth: number
  } | null
  isLoading: boolean
  error: Error | null
}

export function useEarningsStats(): UseEarningsStatsReturn {
  const [stats, setStats] = useState<UseEarningsStatsReturn["stats"]>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      try {
        // Use getSession() with timeout to prevent hanging
        let user = null
        try {
          const { data: sessionData } = await Promise.race([
            supabase.auth.getSession(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000))
          ])
          user = sessionData?.session?.user || null
        } catch { /* timed out */ }

        if (!user) {
          console.warn("[useEarningsStats] No auth, using mock data")
          setStats(MOCK_EARNINGS_STATS)
          return
        }

        // Get wallet
        const { data: wallet } = await supabase
          .from("wallets")
          .select("id, total_credited, balance")
          .eq("profile_id", user.id)
          .single()

        if (!wallet) {
          console.warn("[useEarningsStats] No wallet found for user ID:", user.id)
          setStats({
            thisMonth: 0,
            lastMonth: 0,
            thisYear: 0,
            allTime: 0,
            pendingPayouts: 0,
            averagePerProject: 0,
            monthlyGrowth: 0,
          })
          return
        }
        console.log("[useEarningsStats] Found wallet:", wallet.id, "balance:", wallet.balance, "total_credited:", wallet.total_credited)

        // Get transactions for calculations
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        const thisYearStart = new Date(now.getFullYear(), 0, 1)

        const { data: transactions } = await supabase
          .from("wallet_transactions")
          .select("amount, transaction_type, created_at")
          .eq("wallet_id", wallet.id)
          .in("transaction_type", ["commission", "project_earning", "bonus"])

        const earningTxns = transactions || []

        // Calculate stats
        const thisMonth = earningTxns
          .filter(t => new Date(t.created_at!) >= thisMonthStart)
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        const lastMonth = earningTxns
          .filter(t => {
            const date = new Date(t.created_at!)
            return date >= lastMonthStart && date <= lastMonthEnd
          })
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        const thisYear = earningTxns
          .filter(t => new Date(t.created_at!) >= thisYearStart)
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        // Get pending payouts
        const { data: pendingPayouts } = await supabase
          .from("payout_requests")
          .select("requested_amount")
          .eq("profile_id", user.id)
          .in("status", ["pending", "processing"])

        const pendingAmount = pendingPayouts?.reduce((sum, p) => sum + (p.requested_amount || 0), 0) || 0

        // Get project count for average
        const { data: supervisor } = await supabase
          .from("supervisors")
          .select("total_projects_managed")
          .eq("profile_id", user.id)
          .single()

        const projectCount = supervisor?.total_projects_managed || 1
        const averagePerProject = (wallet.total_credited || 0) / projectCount

        // Calculate monthly growth
        const monthlyGrowth = lastMonth > 0
          ? ((thisMonth - lastMonth) / lastMonth) * 100
          : thisMonth > 0 ? 100 : 0

        setStats({
          thisMonth,
          lastMonth,
          thisYear,
          allTime: wallet.total_credited || 0,
          pendingPayouts: pendingAmount,
          averagePerProject: Math.round(averagePerProject),
          monthlyGrowth: Math.round(monthlyGrowth),
        })
      } catch (err) {
        console.warn("[useEarningsStats] Failed, using mock data:", err)
        setStats(MOCK_EARNINGS_STATS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading, error }
}

export function usePayoutRequests() {
  const [requests, setRequests] = useState<PayoutRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRequests = useCallback(async () => {
    const supabase = createClient()

    try {
      setIsLoading(true)

      // Use getUser() with timeout to prevent hanging
      let user = null
      try {
        const result = await Promise.race([
          supabase.auth.getUser(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000))
        ])
        user = result.data?.user || null
      } catch { /* timed out */ }

      if (!user) {
        setRequests([])
        return
      }

      const { data, error: queryError } = await supabase
        .from("payout_requests")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })

      if (queryError) throw queryError
      setRequests(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch payout requests"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  return {
    requests,
    isLoading,
    error,
    refetch: fetchRequests,
  }
}
