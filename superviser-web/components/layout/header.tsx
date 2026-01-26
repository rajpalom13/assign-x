/**
 * @fileoverview Application header with navigation controls and user menu.
 * @module components/layout/header
 */

"use client"

import { useState } from "react"
import { Bell, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface HeaderProps {
  userName?: string
  notificationCount?: number
  userId?: string
  initialAvailability?: boolean
}

export function Header({
  userName,
  notificationCount = 0,
  initialAvailability = true,
}: HeaderProps) {
  const { setTheme } = useTheme()
  const [isAvailable, setIsAvailable] = useState(initialAvailability)

  const handleAvailabilityToggle = async (checked: boolean) => {
    setIsAvailable(checked)
    // In production, update the database
    // const supabase = createClient()
    // await supabase.from("supervisors").update({ is_available: checked }).eq("id", userId)
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />

      <div className="flex-1">
        <h1 className="text-lg font-semibold">
          Hello, {userName?.split(" ")[0] || "Supervisor"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Availability Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      isAvailable ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium hidden sm:inline">
                    {isAvailable ? "Available" : "Busy"}
                  </span>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={handleAvailabilityToggle}
                  className="h-5 w-9 data-[state=checked]:bg-green-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isAvailable ? "Receiving new requests" : "Not receiving new requests"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative" asChild>
          <Link href="/notifications">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
