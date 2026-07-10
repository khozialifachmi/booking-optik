# 1. Executive Summary

## Problem Statement

Optik Khayra currently manages eye examination appointments manually, leading to long unpredictable wait times, no queue visibility for customers, and difficulty tracking booking history. Customers arrive without knowing their position in the queue or estimated service time, resulting in wasted time on-site and poor customer satisfaction.

## Proposed Solution

Build a fullstack Next.js web application implementing a **First Come First Served (FCFS)** queue algorithm that automatically assigns queue numbers based on registration time, calculates estimated arrival/service times per queue, and provides a real-time queue dashboard. The system supports role-based access (admin/customer), allowing customers to book online and admins to manage queues efficiently.

## Success Criteria

| KPI | Target | How to Measure |
|-----|--------|----------------|
| Queue accuracy | 100% FCFS ordering correctness | Automated test: queue numbers always increment by registration time |
| Estimated time deviation | ≤ 10 minutes from actual service time | Compare `estimated_service_time` vs `actual_service_time` in production logs |
| Page load performance | < 2s Time to Interactive (TTI) on 4G | Lighthouse CI audit on every deploy |
| Booking completion rate | ≥ 90% of started bookings | Analytics funnel: `form_start` → `form_submit` events |
| System uptime | 99.5% monthly | Supabase + Vercel status monitoring |

## Tech Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 16.x | Fullstack React framework |
| UI Library | React | 19.x | Component rendering |
| Component Library | Shadcn UI | latest | Pre-built accessible components |
| Icons | Lucide Icons | latest | Consistent iconography |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Authentication | Better Auth | latest | Email/password + role-based auth |
| Database | Supabase (PostgreSQL) | latest | Data persistence + image storage |
| Form Handling | React Hook Form + Zod | latest | Validated form management |
| State Management | Zustand | latest | Lightweight global state |
| Notifications | SweetAlert2 | latest | User-friendly alerts |
| Language | TypeScript | 5.x | Type safety |
| Package Manager | pnpm | latest | Fast, disk-efficient |
