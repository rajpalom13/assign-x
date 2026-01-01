import { Suspense } from "react";
import { RoleSelection } from "@/components/auth/role-selection";

/**
 * Signup page - Role selection for new users
 * Allows users to choose between Student, Job Seeker, or Business
 */
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <RoleSelection />
    </Suspense>
  );
}
