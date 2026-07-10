# 4. Folder Structure

## Complete Project Tree

```
booking-optik/
├── app/                              # Next.js App Router (routing only)
│   ├── (auth)/                       # Route group: public auth pages
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── register/
│   │   │   └── page.tsx              # Registration page
│   │   └── layout.tsx                # Auth layout (centered card)
│   │
│   ├── (customer)/                   # Route group: customer pages
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Customer dashboard
│   │   ├── booking/
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # New booking form
│   │   │   └── page.tsx              # My bookings list
│   │   └── layout.tsx                # Customer layout (sidebar/nav)
│   │
│   ├── (admin)/                      # Route group: admin pages
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Admin dashboard (today's queue)
│   │   │   ├── bookings/
│   │   │   │   └── page.tsx          # All bookings management
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          # Queue settings
│   │   │   └── page.tsx              # Admin home (redirects to dashboard)
│   │   └── layout.tsx                # Admin layout (admin sidebar)
│   │
│   ├── queue-display/
│   │   └── page.tsx                  # Public queue display (no auth)
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts          # Better Auth catch-all handler
│   │   ├── bookings/
│   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET (detail), PATCH (update), DELETE (cancel)
│   │   ├── queue/
│   │   │   ├── route.ts              # GET today's queue
│   │   │   ├── advance/
│   │   │   │   └── route.ts          # POST advance queue
│   │   │   └── settings/
│   │   │       └── route.ts          # GET/PUT queue settings
│   │   └── users/
│   │       └── profile/
│   │           └── route.ts          # GET/PUT user profile
│   │
│   ├── favicon.ico
│   ├── globals.css                   # Global styles + Tailwind imports
│   ├── layout.tsx                    # Root layout (html, body, providers)
│   └── page.tsx                      # Landing page (public)
│
├── components/                       # Shared UI components
│   ├── ui/                           # Shadcn UI components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── skeleton.tsx
│   │   ├── separator.tsx
│   │   └── ...                       # Other Shadcn components as needed
│   │
│   ├── auth/                         # Auth-specific components
│   │   ├── login-form.tsx            # Reusable login form
│   │   ├── register-form.tsx         # Reusable register form
│   │   └── auth-guard.tsx            # Client-side auth check wrapper
│   │
│   ├── booking/                      # Booking-specific components
│   │   ├── booking-form.tsx          # New booking form (RHF + Zod)
│   │   ├── booking-card.tsx          # Single booking display card
│   │   ├── booking-list.tsx          # Booking list with pagination
│   │   ├── booking-status-badge.tsx  # Status badge component
│   │   └── cancel-booking-dialog.tsx # Cancel confirmation dialog
│   │
│   ├── queue/                        # Queue-specific components
│   │   ├── queue-table.tsx           # Admin queue management table
│   │   ├── queue-display-board.tsx   # Public queue display
│   │   ├── queue-position-card.tsx   # Customer's queue position
│   │   └── advance-queue-button.tsx  # Admin "call next" button
│   │
│   ├── layout/                       # Layout components
│   │   ├── header.tsx                # App header/navbar
│   │   ├── sidebar.tsx               # Sidebar navigation
│   │   ├── footer.tsx                # App footer
│   │   ├── mobile-nav.tsx            # Mobile navigation drawer
│   │   └── logo.tsx                  # Brand logo component
│   │
│   └── shared/                       # Generic reusable components
│       ├── page-header.tsx           # Page title + breadcrumb
│       ├── data-table.tsx            # Generic data table wrapper
│       ├── loading-spinner.tsx       # Loading states
│       ├── empty-state.tsx           # Empty data placeholder
│       ├── error-boundary.tsx        # Error boundary wrapper
│       └── date-picker.tsx           # Date picker wrapper
│
├── lib/                              # Core utilities and configurations
│   ├── auth.ts                       # Better Auth server instance
│   ├── auth-client.ts                # Better Auth client instance
│   ├── supabase/
│   │   ├── client.ts                 # Supabase browser client
│   │   └── server.ts                 # Supabase server client
│   ├── validations/                  # Zod schemas
│   │   ├── auth.ts                   # Login/register schemas
│   │   ├── booking.ts                # Booking form schema
│   │   └── settings.ts              # Queue settings schema
│   ├── utils.ts                      # General utilities (cn, formatDate, etc.)
│   └── constants.ts                  # App-wide constants
│
├── services/                         # Business logic layer
│   ├── booking-service.ts            # Booking CRUD + FCFS logic
│   ├── queue-service.ts              # Queue management + calculations
│   ├── user-service.ts               # User profile operations
│   └── settings-service.ts           # Queue settings operations
│
├── stores/                           # Zustand state stores
│   ├── auth-store.ts                 # Auth state (user, session)
│   ├── queue-store.ts                # Queue state (current queue, display)
│   └── booking-store.ts             # Booking state (form state, filters)
│
├── hooks/                            # Custom React hooks
│   ├── use-auth.ts                   # Auth hook (session, role check)
│   ├── use-bookings.ts               # Booking data fetching hook
│   ├── use-queue.ts                  # Queue data fetching hook
│   └── use-polling.ts               # Generic polling hook
│
├── types/                            # TypeScript type definitions
│   ├── auth.ts                       # Auth-related types
│   ├── booking.ts                    # Booking types
│   ├── queue.ts                      # Queue types
│   └── database.ts                   # Database row types (Supabase)
│
├── providers/                        # React context providers
│   └── app-providers.tsx             # Combines all providers
│
├── middleware.ts                      # Next.js middleware (auth + role check)
│
├── public/                           # Static assets
│   ├── images/
│   │   └── logo.png                  # Optik Khayra logo
│   └── fonts/                        # Local fonts (if any)
│
├── prd/                              # Product Requirements Documents
│   ├── 01-executive-summary.md
│   ├── 02-user-experience.md
│   ├── 03-technical-specifications.md
│   ├── 04-folder-structure.md
│   └── 05-risks-roadmap.md
│
├── .env.local                        # Environment variables (gitignored)
├── .env.example                      # Template for env vars
├── .gitignore
├── components.json                   # Shadcn UI config
├── eslint.config.mjs
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── tailwind.config.ts                # Tailwind CSS config (if v4 needs it)
└── tsconfig.json
```

---

## Folder Conventions

### Why This Structure?

| Decision | Rationale |
|----------|-----------|
| Route groups `(auth)`, `(customer)`, `(admin)` | Separate layouts per role without affecting URL paths |
| `components/` outside `app/` | Keeps `app/` purely for routing per Next.js best practice |
| `lib/` for configs | Single source of truth for auth, db, and validation |
| `services/` for business logic | Decouples data operations from route handlers — testable, reusable |
| `stores/` for Zustand | Centralized global state, separate from component logic |
| `hooks/` for custom hooks | Reusable data fetching and side effects |
| `types/` for TypeScript | Shared type definitions prevent duplication |
| `providers/` for context | Clean provider composition in root layout |
| Private folders (`_components`) avoided | Using top-level `components/` is cleaner for this project size |

### Import Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Usage examples:**
```typescript
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { bookingService } from "@/services/booking-service"
import { useAuth } from "@/hooks/use-auth"
import type { Booking } from "@/types/booking"
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `page.tsx` (Next.js convention) | `app/(customer)/dashboard/page.tsx` |
| Layouts | `layout.tsx` (Next.js convention) | `app/(auth)/layout.tsx` |
| Components | `kebab-case.tsx` | `booking-form.tsx` |
| Hooks | `use-kebab-case.ts` | `use-auth.ts` |
| Services | `kebab-case-service.ts` | `booking-service.ts` |
| Stores | `kebab-case-store.ts` | `auth-store.ts` |
| Types | `kebab-case.ts` | `booking.ts` |
| Validations | `kebab-case.ts` | `booking.ts` |
| API Routes | `route.ts` (Next.js convention) | `app/api/bookings/route.ts` |
