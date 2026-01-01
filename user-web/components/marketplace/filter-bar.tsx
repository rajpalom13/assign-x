"use client"

import { useState } from "react"
import { Filter, X, Search, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { ListingFilters, ListingType, MarketplaceCategory } from "@/services/marketplace.service"

/**
 * Props for FilterBar component
 */
interface FilterBarProps {
  filters: ListingFilters
  categories: MarketplaceCategory[]
  onFiltersChange: (filters: ListingFilters) => void
  className?: string
}

/**
 * Listing type options (matches database enum)
 */
const listingTypes: { value: ListingType; label: string }[] = [
  { value: "sell", label: "For Sale" },
  { value: "housing", label: "Housing" },
  { value: "opportunity", label: "Opportunities" },
  { value: "community_post", label: "Community" },
]

/**
 * FilterBar component for marketplace filtering
 * Includes category chips, search, and advanced filters
 */
export function FilterBar({
  filters,
  categories,
  onFiltersChange,
  className,
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "")
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 10000,
  ])

  const handleTypeChange = (type: ListingType | "all") => {
    onFiltersChange({
      ...filters,
      type: type === "all" ? undefined : type,
    })
  }

  const handleCategoryChange = (categoryId: string | "all") => {
    onFiltersChange({
      ...filters,
      categoryId: categoryId === "all" ? undefined : categoryId,
    })
  }

  const handleSearch = () => {
    onFiltersChange({
      ...filters,
      searchTerm: searchTerm || undefined,
    })
  }

  const handlePriceChange = () => {
    onFiltersChange({
      ...filters,
      minPrice: priceRange[0] || undefined,
      maxPrice: priceRange[1] || undefined,
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setPriceRange([0, 10000])
    onFiltersChange({})
  }

  const hasActiveFilters =
    filters.type ||
    filters.categoryId ||
    filters.searchTerm ||
    filters.minPrice ||
    filters.maxPrice

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          Search
        </Button>

        {/* Advanced Filters Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Listing Type</label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(v) => handleTypeChange(v as ListingType | "all")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {listingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filters.categoryId || "all"}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Price Range</label>
                  <span className="text-sm text-muted-foreground">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                  onValueCommit={handlePriceChange}
                  min={0}
                  max={10000}
                  step={100}
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {/* Type Chips */}
        <Badge
          variant={!filters.type ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleTypeChange("all")}
        >
          All
        </Badge>
        {listingTypes.map((type) => (
          <Badge
            key={type.value}
            variant={filters.type === type.value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleTypeChange(type.value)}
          >
            {type.label}
          </Badge>
        ))}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1"
            onClick={clearFilters}
          >
            <Filter className="h-3 w-3" />
            Clear
            <X className="h-3 w-3" />
          </Badge>
        )}
      </div>
    </div>
  )
}
