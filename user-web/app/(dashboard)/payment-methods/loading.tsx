import { Skeleton } from "@/components/ui/skeleton";

/**
 * Payment methods page loading state
 * Shows skeleton UI for saved payment methods
 */
export default function PaymentMethodsLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Skeleton */}
      <div className="border-b p-4">
        <Skeleton className="h-8 w-40" />
      </div>

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-2xl">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>

        {/* Payment Method Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Method Buttons Skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}
