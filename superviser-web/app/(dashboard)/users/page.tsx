/**
 * @fileoverview User management page for viewing client profiles and their project history.
 * @module app/(dashboard)/users/page
 */

"use client"

import { UserList } from "@/components/users"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          View client profiles and their project history
        </p>
      </div>

      {/* User List */}
      <UserList />
    </div>
  )
}
