'use client'

/**
 * Payment History component
 * Displays transaction history with filtering and search
 * @module components/profile/PaymentHistory
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Download,
  Filter,
  Search,
  CreditCard,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { transactionTypeConfig, statusConfig, mockTransactions } from './constants'
import type { WalletTransaction, TransactionType } from '@/types/database'

/**
 * PaymentHistory component props
 */
interface PaymentHistoryProps {
  /** Wallet transactions */
  transactions?: WalletTransaction[]
  /** Current balance */
  balance?: number
  /** Pending balance */
  pendingBalance?: number
  /** Loading state */
  isLoading?: boolean
  /** Callback to load more */
  onLoadMore?: () => void
  /** Additional class name */
  className?: string
}

/**
 * Format date for display
 * @param date - ISO date string
 * @returns Formatted date string
 */
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format time for display
 * @param date - ISO date string
 * @returns Formatted time string
 */
const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Payment History component
 * Displays transaction history with filtering
 */
export function PaymentHistory({
  transactions = mockTransactions,
  balance = 15800,
  pendingBalance = 1800,
  isLoading,
  onLoadMore,
  className,
}: PaymentHistoryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')

  /** Filter transactions based on current filters */
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'completed' && tx.status !== 'completed') return false
    if (activeTab === 'pending' && tx.status !== 'pending') return false
    if (typeFilter !== 'all' && tx.transaction_type !== typeFilter) return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        tx.description?.toLowerCase().includes(query) ||
        tx.project_title?.toLowerCase().includes(query)
      )
    }
    return true
  })

  /** Calculate tab totals */
  const totals = {
    all: transactions.length,
    completed: transactions.filter((t) => t.status === 'completed').length,
    pending: transactions.filter((t) => t.status === 'pending').length,
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Balance cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-emerald-200/60 bg-emerald-50/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-700/70">Available Balance</p>
                <p className="text-2xl font-bold text-emerald-700">
                  ₹{balance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200/60 bg-amber-50/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-700/70">Pending Earnings</p>
                <p className="text-2xl font-bold text-amber-700">
                  ₹{pendingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your payment transactions</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{totals.all} total</Badge>
              <Badge variant="secondary">{totals.completed} completed</Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="all" className="gap-1">
                All
                <Badge variant="secondary" className="ml-1 text-xs">{totals.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-1">
                Completed
                <Badge variant="secondary" className="ml-1 text-xs">{totals.completed}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-1">
                Pending
                <Badge variant="secondary" className="ml-1 text-xs">{totals.pending}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger className="w-full lg:w-56">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(Object.keys(transactionTypeConfig) as TransactionType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {transactionTypeConfig[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction table */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No transactions found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx, index) => {
                      const typeConfig = transactionTypeConfig[tx.transaction_type]
                      const status = statusConfig[tx.status]
                      const TypeIcon = typeConfig.icon
                      const StatusIcon = status.icon
                      const isCredit = tx.amount > 0

                      return (
                        <motion.tr
                          key={tx.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', typeConfig.bgColor)}>
                                <TypeIcon className={cn('h-5 w-5', typeConfig.color)} />
                              </div>
                              <div>
                                <p className="font-medium">{typeConfig.label}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {tx.description || tx.project_title || 'No description'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <p className="text-sm">{formatDate(tx.created_at)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(tx.created_at)}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className={cn('gap-1', status.bgColor, status.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <p className={cn('font-semibold', isCredit ? 'text-green-600' : 'text-red-600')}>
                              {isCredit ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Balance: ₹{tx.balance_after.toLocaleString()}
                            </p>
                          </TableCell>
                        </motion.tr>
                      )
                    })
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Load more */}
          {filteredTransactions.length > 0 && onLoadMore && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={onLoadMore}>Load More</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
