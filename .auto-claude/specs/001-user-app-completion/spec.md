# Specification: User App Feature Completion

## Overview

Complete all missing features in the AssignX user applications (user-web Next.js and user_app Flutter) to achieve production-ready status. This task involves auditing the current implementation against the 100 defined features in the AssignX specification, identifying gaps where mock data or placeholder implementations exist, and completing all features with real database integration and production-quality code.

## Workflow Type

**Type**: feature

**Rationale**: This is a feature completion workflow that requires implementing missing functionality, converting mock data to real database calls, and ensuring all 100 user features are production-ready. The scope involves multiple services (user-web and user_app) and touches authentication, payments, marketplace, and profile modules.

## Task Scope

### Services Involved
- **user-web** (primary) - Next.js 16 frontend with App Router, TypeScript, Tailwind CSS, Zustand state management
- **user_app** (secondary) - Flutter mobile app with Riverpod state management

### This Task Will:
- [ ] Audit current implementation against the 100 features defined in `plan/AssignX_Complete_Features.md`
- [ ] Convert mock data implementations to real Supabase database calls (Connect/Marketplace, Payment Methods)
- [ ] Implement missing Razorpay integration for payment methods
- [ ] Ensure all features work with real data from Supabase
- [ ] Complete any partially implemented features (TODOs in code)
- [ ] Verify feature parity between user-web and user_app
- [ ] Apply production optimizations (error handling, loading states, validation)

### Out of Scope:
- Doctor Consultation Feature (placeholder per spec E01)
- Multiple Payment Gateways (Razorpay only per spec E02)
- AMC / Ongoing Support (per spec E03)
- Content Creation (per spec E04)
- Doer, Supervisor, or Admin panel features
- Sentry error monitoring integration (not yet implemented - consider for future sprint)

## Service Context

### user-web (Next.js)

**Tech Stack:**
- Language: TypeScript
- Framework: Next.js 16.1.1 with App Router
- Styling: Tailwind CSS + shadcn/ui components
- State Management: Zustand stores
- Database: Supabase (shared)
- Payments: Razorpay
- Testing: Playwright (E2E)

**Key Directories:**
- `app/` - Application pages using Next.js App Router
- `components/` - UI components organized by feature
- `lib/` - Actions, utilities, Supabase client
- `stores/` - Zustand state management
- `services/` - Business logic layer

**Entry Point:** `app/layout.tsx`

**How to Run:**
```bash
cd user-web
npm install
npm run dev
```

**Port:** 3000

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL` - Site URL (http://localhost:3000)
- `RAZORPAY_KEY_ID` - Razorpay API key (server)
- `RAZORPAY_KEY_SECRET` - Razorpay secret (server)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay public key (client)

**Optional Environment Variables:**
- `VAPID_PRIVATE_KEY` - VAPID key for web push notifications
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Public VAPID key for web push
- `VAPID_EMAIL` - Email for VAPID identification
- `WHATSAPP_PHONE_NUMBER_ID` - WhatsApp Business API phone ID
- `WHATSAPP_ACCESS_TOKEN` - WhatsApp Business API token
- `NEXT_PUBLIC_APP_URL` - App URL for CSRF validation and redirects

### user_app (Flutter)

**Tech Stack:**
- Language: Dart
- Framework: Flutter 3.x
- State Management: Riverpod (flutter_riverpod v2.4.9)
- Database: Supabase (supabase_flutter v2.3.0)
- Payments: Razorpay (razorpay_flutter v1.3.7)
- Push Notifications: Firebase Cloud Messaging

**Key Directories:**
- `lib/core/` - Config, theme, router, constants
- `lib/data/` - Models and repositories
- `lib/features/` - Feature modules (screens, widgets)
- `lib/providers/` - Riverpod providers
- `lib/shared/` - Reusable widgets

**Entry Point:** `lib/main.dart`

**How to Run:**
```bash
cd user_app
flutter pub get
flutter run
```

**Required Environment Variables:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `GOOGLE_WEB_CLIENT_ID` - Google OAuth client ID

**Platform Configuration Notes:**
- Razorpay Flutter requires native SDK setup in both Android and iOS
- Firebase requires `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- Push notifications on Android 13+ require runtime permission request

## Files to Modify

| File | Service | What to Change |
|------|---------|---------------|
| `app/(dashboard)/connect/page.tsx` | user-web | Replace mock data with real Supabase marketplace queries |
| `app/(dashboard)/payment-methods/page.tsx` | user-web | Integrate real Razorpay saved cards/UPI API |
| `lib/data/marketplace.ts` | user-web | Create real Supabase service for marketplace |
| `lib/actions/data.ts` | user-web | Add marketplace CRUD operations |
| `components/marketplace/masonry-grid.tsx` | user-web | Ensure works with real data |
| `app/api/payments/` | user-web | Complete Razorpay webhook handling |
| `lib/features/marketplace/` | user_app | Verify Supabase integration |
| `lib/providers/` | user_app | Verify all providers work with real data |

## Files to Reference

These files show patterns to follow:

| File | Pattern to Copy |
|------|----------------|
| `app/(dashboard)/wallet/page.tsx` | Real data fetching with getWallet() action |
| `app/(dashboard)/projects/page.tsx` | Tab navigation, loading states, real data |
| `lib/actions/data.ts` | Server action patterns for Supabase |
| `stores/user-store.ts` | Zustand store pattern with persistence |
| `lib/supabase/server.ts` | Server-side Supabase client pattern (async cookies, setAll error handling) |
| `app/api/payments/create-order/route.ts` | Razorpay order creation with paise validation |
| `lib/env.ts` | Environment variable validation with Zod |
| `user_app/lib/providers/project_provider.dart` | Riverpod provider with Supabase |
| `user_app/lib/data/repositories/project_repository.dart` | Repository pattern for data access |

## Patterns to Follow

### Next.js Server Actions Pattern

From `lib/actions/data.ts`:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMarketplaceListings(options: {
  category?: string;
  search?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("marketplace_listings")
    .select("*, seller:profiles(*), category:marketplace_categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (options.category) {
    query = query.eq("listing_type", options.category);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

**Key Points:**
- Always use `"use server"` directive
- Create Supabase client per-request
- Check authentication before database access
- Return typed data, handle errors gracefully

### Zustand Store Pattern

From `stores/user-store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MarketplaceState {
  listings: Listing[];
  isLoading: boolean;
  fetchListings: (filters?: Filters) => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      listings: [],
      isLoading: false,
      fetchListings: async (filters) => {
        set({ isLoading: true });
        try {
          const data = await getMarketplaceListings(filters);
          set({ listings: data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    { name: "marketplace-storage" }
  )
);
```

**Key Points:**
- Use persist middleware for offline support
- Include loading states
- Handle errors in async actions

### Riverpod Provider Pattern (Flutter)

From `lib/providers/project_provider.dart`:

```dart
@riverpod
class MarketplaceNotifier extends _$MarketplaceNotifier {
  @override
  Future<List<MarketplaceListing>> build() async {
    return _fetchListings();
  }

  Future<List<MarketplaceListing>> _fetchListings() async {
    final supabase = Supabase.instance.client;
    final response = await supabase
        .from('marketplace_listings')
        .select('*, seller:profiles(*)')
        .eq('is_active', true)
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => MarketplaceListing.fromJson(json))
        .toList();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = AsyncData(await _fetchListings());
  }
}
```

**Key Points:**
- Use AsyncNotifier for async state
- Wrap state in AsyncValue (Loading, Data, Error)
- Provide refresh method for pull-to-refresh

## Requirements

### Functional Requirements

1. **Marketplace/Connect Module (U73-U85)**
   - Description: Pinterest-style campus marketplace with products, housing, opportunities, and community posts
   - Acceptance:
     - Real listings fetched from `marketplace_listings` table
     - Category filtering works (Products, Housing, Opportunities, Community)
     - Search functionality queries database
     - Create listing saves to database
     - Favorites persist across sessions

2. **Payment Methods Management (U91)**
   - Description: Manage saved cards and UPI IDs via Razorpay
   - Acceptance:
     - Add card tokenizes via Razorpay API
     - Add UPI validates and saves
     - Delete removes from Razorpay and database
     - Set default works correctly
     - Razorpay customer tokens stored securely

3. **Wallet Features (U98, U99)**
   - Description: Transaction history and top-up functionality
   - Acceptance:
     - Transaction history loads from `wallet_transactions` table
     - Top-up creates Razorpay order and processes payment
     - Balance updates after successful payment
     - Webhook handles payment confirmation

4. **Feature Parity Verification**
   - Description: Both user-web and user_app implement all 100 features
   - Acceptance:
     - All 100 features from spec are implemented
     - Both platforms use same database tables
     - Consistent behavior between web and mobile

### Edge Cases

1. **Empty Marketplace** - Show empty state with call-to-action to post first listing
2. **Payment Failure** - Display clear error message, allow retry
3. **Session Expiry** - Handle gracefully, redirect to login
4. **Offline Mode** - Show cached data where possible, queue actions
5. **Network Timeout** - Display retry option with proper error messaging
6. **Invalid UPI ID** - Validate format before submission (must contain @)
7. **Insufficient Wallet Balance** - Show top-up prompt when attempting payment

## Implementation Notes

### DO
- Follow the server action pattern in `lib/actions/data.ts` for all database operations
- Reuse existing Zustand stores instead of creating new state management
- Use the `toast` component from `sonner` for user feedback
- Implement loading skeletons matching existing patterns
- Follow Razorpay integration patterns from `app/api/payments/create-order/route.ts`
- Use `@supabase/ssr` for Next.js server-side auth
- **CRITICAL: Razorpay amounts must be in paise** (multiply rupees by 100, e.g., ₹50 = 5000 paise)
- **CRITICAL: Razorpay minimum amount is 100 paise** (₹1) - validate before API calls
- Use `await cookies()` for Next.js 15+ async cookie handling (see `lib/supabase/server.ts`)
- Handle cookie `setAll` errors gracefully in Server Components (try-catch pattern)

### DON'T
- Create new database tables without updating schema documentation
- Store sensitive payment data directly in Supabase (use Razorpay tokenization)
- Mix client and server code in server actions
- Ignore TypeScript type errors
- Skip loading states for async operations
- Use console.log for production - use proper error handling

## Development Environment

### Start Services

```bash
# Start user-web
cd user-web
npm run dev

# Start user_app (in separate terminal)
cd user_app
flutter run
```

### Service URLs
- user-web: http://localhost:3000
- Supabase Dashboard: https://supabase.com/dashboard (use project URL from env)

### Required Environment Variables

**user-web (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=https://eowrlcwcqrpavpfspcza.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=<razorpay_key>
RAZORPAY_KEY_ID=<razorpay_key>
RAZORPAY_KEY_SECRET=<razorpay_secret>
```

**user_app (.env):**
```
SUPABASE_URL=https://eowrlcwcqrpavpfspcza.supabase.co
SUPABASE_ANON_KEY=<key>
GOOGLE_WEB_CLIENT_ID=<google_client_id>
```

## Success Criteria

The task is complete when:

1. [ ] All 100 user features from `plan/AssignX_Complete_Features.md` are implemented
2. [ ] Marketplace/Connect uses real Supabase data (no mock data)
3. [ ] Payment Methods integrates with Razorpay for card/UPI management
4. [ ] Wallet top-up processes real payments via Razorpay
5. [ ] Transaction history displays real data from database
6. [ ] No console errors during normal operation
7. [ ] All existing tests pass
8. [ ] Feature parity between user-web and user_app verified
9. [ ] Production optimizations applied (error handling, loading states, validation)

## QA Acceptance Criteria

**CRITICAL**: These criteria must be verified by the QA Agent before sign-off.

### Unit Tests
| Test | File | What to Verify |
|------|------|----------------|
| Marketplace service | `__tests__/services/marketplace.test.ts` | CRUD operations, filtering, search |
| Payment service | `__tests__/services/payments.test.ts` | Order creation, verification |
| Wallet actions | `__tests__/actions/wallet.test.ts` | Balance updates, transactions |

### Integration Tests
| Test | Services | What to Verify |
|------|----------|----------------|
| Marketplace flow | user-web ↔ Supabase | Listings persist, filters work |
| Payment flow | user-web ↔ Razorpay | Orders created, payments processed |
| Auth flow | user-web ↔ Supabase Auth | Session handling, protected routes |

### End-to-End Tests
| Flow | Steps | Expected Outcome |
|------|-------|------------------|
| Create Listing | 1. Navigate to Connect 2. Click Post Listing 3. Fill form 4. Submit | Listing appears in marketplace |
| Add Payment Method | 1. Go to Payment Methods 2. Click Add Card 3. Enter details 4. Save | Card appears in list |
| Top-up Wallet | 1. Go to Wallet 2. Click Add Money 3. Select amount 4. Complete payment | Balance increases |
| Purchase Project | 1. Submit project 2. Receive quote 3. Pay via wallet | Project status updates |

### Browser Verification (if frontend)
| Page/Component | URL | Checks |
|----------------|-----|--------|
| Home Dashboard | `http://localhost:3000/home` | All sections render, no errors |
| Connect/Marketplace | `http://localhost:3000/connect` | Real listings load, filters work |
| Profile | `http://localhost:3000/profile` | Stats, referral, settings display |
| Wallet | `http://localhost:3000/wallet` | Balance, transactions display |
| Payment Methods | `http://localhost:3000/payment-methods` | Cards/UPI can be added |

### Database Verification (if applicable)
| Check | Query/Command | Expected |
|-------|---------------|----------|
| Marketplace tables exist | `\dt marketplace_*` | Tables listed |
| Listings have data | `SELECT COUNT(*) FROM marketplace_listings` | > 0 after testing |
| Wallet transactions | `SELECT * FROM wallet_transactions LIMIT 5` | Valid transaction records |

### QA Sign-off Requirements
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Browser verification complete (all pages load without errors)
- [ ] Database state verified (marketplace tables populated)
- [ ] No regressions in existing functionality
- [ ] Code follows established patterns
- [ ] No security vulnerabilities introduced
- [ ] Mock data fully replaced with real database calls
- [ ] Razorpay integration tested with test mode credentials
