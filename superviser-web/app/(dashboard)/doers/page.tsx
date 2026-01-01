/**
 * @fileoverview Doer management page for viewing and managing expert doers, their skills, ratings, and availability.
 * @module app/(dashboard)/doers/page
 */

"use client"

import { DoerList } from "@/components/doers"

export default function DoersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Doer Management</h2>
        <p className="text-muted-foreground">
          View and manage expert doers - their skills, ratings, and availability
        </p>
      </div>

      {/* Doer List */}
      <DoerList />
    </div>
  )
}
