# 2. User Experience & Functionality

## User Personas

### Persona 1: Customer (Pelanggan)
- **Who**: Individuals needing eye examination or eyeglass services at Optik Khayra
- **Goal**: Book an appointment online, see their queue position, and know when to arrive
- **Pain Point**: Currently must visit the store physically and wait with no visibility into queue length
- **Tech Comfort**: Basic smartphone/browser user

### Persona 2: Admin (Staff Optik)
- **Who**: Optik Khayra staff managing daily operations
- **Goal**: Control the queue flow, mark patients as served, view booking history, manage daily schedule
- **Pain Point**: Manual queue management with paper-based tracking is error-prone
- **Tech Comfort**: Moderate — familiar with basic web applications

---

## User Stories & Acceptance Criteria

### Authentication

#### US-01: Customer Registration
> As a **customer**, I want to **register with email and password** so that **I can book eye examination appointments**.

**Acceptance Criteria:**
- [ ] Registration form validates: name (2-50 chars), email (valid format), password (min 8 chars, 1 uppercase, 1 number), phone number (Indonesian format)
- [ ] Duplicate email returns error message within 500ms
- [ ] Successful registration redirects to customer dashboard
- [ ] Password is hashed server-side via Better Auth (never stored in plaintext)

#### US-02: User Login
> As a **registered user**, I want to **sign in with email/password** so that **I can access my role-specific dashboard**.

**Acceptance Criteria:**
- [ ] Login form validates email format and password presence before submission
- [ ] Invalid credentials show specific error ("Email tidak ditemukan" or "Password salah")
- [ ] Successful login redirects: customer → `/dashboard`, admin → `/admin`
- [ ] Session persists across page refresh (cookie-based via Better Auth)

#### US-03: Role-Based Access
> As the **system**, I want to **restrict routes by user role** so that **customers cannot access admin features**.

**Acceptance Criteria:**
- [ ] Middleware checks role on every request to protected routes
- [ ] Unauthorized access redirects to login with flash message
- [ ] Admin routes: `/admin/*` — only role `admin`
- [ ] Customer routes: `/dashboard/*` — only role `customer`
- [ ] Public routes: `/`, `/login`, `/register`, `/queue-display` — accessible to all

---

### Customer Features

#### US-04: Create Booking
> As a **customer**, I want to **book an eye examination for a specific date** so that **I receive a queue number and estimated service time**.

**Acceptance Criteria:**
- [ ] Booking form fields: date (date picker, min today+1), service type (dropdown), notes (optional textarea, max 500 chars)
- [ ] Service types: "Pemeriksaan Mata", "Pembuatan Kacamata", "Kontrol Kacamata"
- [ ] Queue number auto-generated as sequential integer per date (e.g., date 2026-04-10 → Q-001, Q-002, …)
- [ ] Estimated service time calculated: `store_open_time + (queue_position - 1) × avg_service_duration`
- [ ] Default `avg_service_duration` = 20 minutes (configurable by admin)
- [ ] Successful booking shows SweetAlert confirmation with queue number and estimated time
- [ ] Duplicate booking on same date blocked with error message
- [ ] Form validation via React Hook Form + Zod schema

#### US-05: View My Bookings
> As a **customer**, I want to **see my booking history** so that **I can track past and upcoming appointments**.

**Acceptance Criteria:**
- [ ] List shows: date, queue number, service type, status (Menunggu/Sedang Dilayani/Selesai/Dibatalkan), estimated time
- [ ] Sorted by date descending (newest first)
- [ ] Pagination: 10 items per page
- [ ] Status badges with distinct colors: Menunggu (yellow), Sedang Dilayani (blue), Selesai (green), Dibatalkan (red)

#### US-06: Cancel Booking
> As a **customer**, I want to **cancel an upcoming booking** so that **I free my slot for others**.

**Acceptance Criteria:**
- [ ] Cancel button visible only for bookings with status "Menunggu" and date ≥ today
- [ ] SweetAlert confirmation dialog before cancellation
- [ ] Cancellation re-calculates estimated times for all subsequent queue positions on that date
- [ ] Cancelled booking status changes to "Dibatalkan" (irreversible)

#### US-07: View Live Queue
> As a **customer**, I want to **see the current queue status** so that **I know when to arrive at the store**.

**Acceptance Criteria:**
- [ ] Real-time display of: current queue number being served, total queue count today, my position number
- [ ] Updates via polling every 30 seconds (Supabase query)
- [ ] Estimated remaining wait time displayed in "X menit lagi" format
- [ ] Accessible from public URL `/queue-display` without authentication

---

### Admin Features

#### US-08: View Today's Queue Dashboard
> As an **admin**, I want to **see all bookings for today in queue order** so that **I can manage the service flow**.

**Acceptance Criteria:**
- [ ] Table columns: Queue #, Customer Name, Service Type, Estimated Time, Status, Actions
- [ ] Default view: today's date (date picker to switch dates)
- [ ] Sorted by queue number ascending
- [ ] Color-coded status rows
- [ ] Auto-refresh every 30 seconds

#### US-09: Advance Queue (Call Next)
> As an **admin**, I want to **mark the current customer as served and call the next** so that **the queue progresses**.

**Acceptance Criteria:**
- [ ] "Panggil Berikutnya" button marks current as "Selesai" and next as "Sedang Dilayani"
- [ ] Queue display updates immediately
- [ ] SweetAlert confirmation with next customer's name and queue number
- [ ] If no more customers, show "Antrian hari ini selesai" message

#### US-10: View All Bookings (Admin)
> As an **admin**, I want to **search and filter all bookings** so that **I can find specific customer records**.

**Acceptance Criteria:**
- [ ] Filters: date range, status, service type, customer name search
- [ ] Results table with pagination (20 per page)
- [ ] Export filtered results as CSV (Phase 2)

#### US-11: Configure Queue Settings
> As an **admin**, I want to **set average service duration and operating hours** so that **estimated times are accurate**.

**Acceptance Criteria:**
- [ ] Form fields: `avg_service_duration` (5-60 minutes), `open_time` (HH:MM), `close_time` (HH:MM), `max_bookings_per_day` (1-100)
- [ ] Changes apply to future bookings only (existing bookings recalculated)
- [ ] Settings stored in `queue_settings` table with effective date

---

## Non-Goals (v1.0)

| Feature | Reason |
|---------|--------|
| Payment processing | Out of scope — payments handled in-store |
| SMS/WhatsApp notifications | Requires third-party integration — planned for v1.1 |
| Multi-branch support | Single location for MVP |
| Real-time WebSocket updates | Polling every 30s is sufficient for v1.0; WebSocket planned for v2.0 |
| Mobile native app | Responsive web app is sufficient; native planned for v2.0 |
| Multi-language (i18n) | Bahasa Indonesia only for v1.0 |
| Walk-in queue (no booking) | Online booking only for v1.0; walk-in kiosk planned for v1.1 |
