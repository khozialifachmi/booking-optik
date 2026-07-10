# 5. Risks & Roadmap

## Phased Rollout

### Phase 1: MVP — Foundation & Auth (Sprint 1-2)
**Goal**: Working authentication with role-based routing

| Task | Priority | Effort |
|------|----------|--------|
| Project setup (Shadcn UI, Tailwind, ESLint) | P0 | 2h |
| Supabase project creation + database schema | P0 | 3h |
| Better Auth server + client setup | P0 | 4h |
| Auth API route handler (`[...all]/route.ts`) | P0 | 1h |
| Registration page + form (RHF + Zod) | P0 | 4h |
| Login page + form | P0 | 3h |
| Middleware for protected routes | P0 | 3h |
| User profile table + role assignment | P0 | 2h |
| Auth layout (centered card design) | P0 | 2h |
| Landing page (public) | P1 | 4h |
| **Total** | | **~28h** |

**Deliverable**: Users can register, login, and are routed to role-specific dashboards.

---

### Phase 2: Core Booking — FCFS Queue System (Sprint 3-4)
**Goal**: Customers can book, see queue, admins manage queue

| Task | Priority | Effort |
|------|----------|--------|
| Booking API routes (CRUD) | P0 | 6h |
| FCFS queue number generation logic | P0 | 4h |
| Estimated time calculation service | P0 | 3h |
| Booking form page (RHF + Zod + date picker) | P0 | 5h |
| My bookings page (list + pagination) | P0 | 4h |
| Cancel booking flow | P0 | 3h |
| Customer dashboard (summary cards) | P0 | 4h |
| Customer layout (sidebar navigation) | P0 | 3h |
| SweetAlert integration for notifications | P1 | 2h |
| Zustand stores (booking, queue) | P1 | 3h |
| **Total** | | **~37h** |

**Deliverable**: Full booking flow — create, view, cancel with FCFS queue assignment.

---

### Phase 3: Admin Dashboard (Sprint 5-6)
**Goal**: Admins can manage today's queue and configure settings

| Task | Priority | Effort |
|------|----------|--------|
| Admin dashboard — today's queue table | P0 | 5h |
| Queue advance (call next) functionality | P0 | 4h |
| All bookings management (search, filter) | P0 | 5h |
| Queue settings page (CRUD) | P0 | 4h |
| Admin layout (admin sidebar) | P0 | 3h |
| Public queue display page | P0 | 4h |
| Polling for real-time updates (30s) | P1 | 3h |
| Queue recalculation on cancellation | P1 | 3h |
| **Total** | | **~31h** |

**Deliverable**: Admin can manage daily queue, configure settings, public display works.

---

### Phase 4: Polish & Production (Sprint 7)
**Goal**: Production-ready, responsive, performant

| Task | Priority | Effort |
|------|----------|--------|
| Responsive design audit (mobile/tablet) | P0 | 4h |
| Loading states (skeletons, spinners) | P0 | 3h |
| Error handling (error boundaries, toast) | P0 | 3h |
| SEO metadata (title, description, OG) | P1 | 2h |
| Accessibility audit (ARIA, keyboard nav) | P1 | 3h |
| Performance optimization (lazy loading) | P1 | 2h |
| `.env.example` + deployment docs | P1 | 1h |
| End-to-end testing (critical paths) | P1 | 4h |
| **Total** | | **~22h** |

**Deliverable**: Production-ready application deployed on Vercel.

---

### Future: v1.1 → v2.0

| Version | Features |
|---------|----------|
| v1.1 | WhatsApp notifications, walk-in kiosk mode, CSV export |
| v1.2 | Multi-branch support, staff scheduling |
| v2.0 | Real-time WebSocket updates, mobile native app (React Native), analytics dashboard |

---

## Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Queue race condition**: Two users book simultaneously, get same queue number | Medium | High | Database `UNIQUE(booking_date, queue_number)` constraint + transaction with `SELECT FOR UPDATE` |
| **Better Auth breaking changes**: Library is relatively new, APIs may change | Medium | Medium | Pin exact version in `package.json`, follow changelogs before updating |
| **Supabase connection limits**: Free tier has limited connections | Low | Medium | Use connection pooling, server-side only connections, avoid client-side direct DB access |
| **Estimated time accuracy**: Service duration varies per patient | High | Low | Allow admin to adjust `avg_service_duration`; track actual vs estimated for future calibration |
| **Polling performance**: 30s polling with many concurrent users | Low | Medium | Implement request deduplication; consider upgrading to WebSocket in v2.0 |
| **Tailwind v4 compatibility**: New version with breaking changes from v3 | Medium | Low | Already configured in project; follow Tailwind v4 docs for any edge cases |
| **Next.js 16 API changes**: Newer APIs may differ from common documentation | Medium | Medium | Always reference `node_modules/next/dist/docs/` before writing code (per AGENTS.md) |

---

## Implementation Order (Dependency Graph)

```
Phase 1                Phase 2                Phase 3               Phase 4
────────              ────────              ────────              ────────

[Project Setup]        [Booking API] ◄───── [Admin Dashboard]     [Responsive]
     │                      │                    │                     │
     ▼                      ▼                    ▼                     ▼
[Supabase DB] ──────► [FCFS Logic]          [Queue Advance]       [Loading States]
     │                      │                    │                     │
     ▼                      ▼                    ▼                     ▼
[Better Auth] ──────► [Booking Form]        [Queue Settings]      [Error Handling]
     │                      │                    │                     │
     ▼                      ▼                    ▼                     ▼
[Auth Pages]           [My Bookings]        [Public Display]      [SEO + Deploy]
     │                      │                    │
     ▼                      ▼                    ▼
[Middleware]           [Customer Dash]      [All Bookings]
     │
     ▼
[Landing Page]
```

Each phase builds on the previous. No phase can start without completing all P0 tasks from the prior phase.
