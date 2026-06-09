# GitHub Copilot Instructions for Swift Designz Admin Portal

## Project Overview
- **Business:** Swift Designz - Freelance software development, web app design, e-commerce, apps, PM training, AI training
- **Owner:** Keenan
- **Domain:** admin.swiftdesignz.co.za
- **Type:** Private admin dashboard (not public-facing)

## Tech Stack & Architecture
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + custom dark theme / glassmorphism CSS
- **Animations:** Framer Motion (light usage)
- **Database + Auth:** Supabase (PostgreSQL + Auth + RLS + Storage)
- **Icons:** Lucide React
- **PDF Generation:** @react-pdf/renderer
- **Deployment:** Vercel (keenanswift101/swift-designz-admin)

## Brand Identity & Design Guidelines
- **Core Colors:** #30B0B0 (teal accent), #101010 (background), #1a1a1a (card surface), #2a2a2a (borders), #303030 (dark gray)
- **Visual Style:** Dark theme, glassmorphism cards (backdrop-blur + subtle borders), clean, professional
- **Tone & Rules:** 
  - **NO:** Emojis, boilerplate templates, faith references
  - **YES:** Clean, functional, data-focused, elegant

## Architecture Patterns
- Route group `(dashboard)` for all authenticated pages
- Server Components for data fetching from Supabase
- Client Components only when interactivity needed (forms, sidebar)
- Server Actions for auth (signIn, signOut, getProfile)
- Service role client (`admin.ts`) for API routes that bypass RLS
- All money stored as integer cents — use `formatCurrency(cents)` for display

## Coding Standards
- Ensure strict TypeScript typing.
- Follow Next.js 16 App Router best practices (`page.tsx`, `layout.tsx`, server vs client components).
- Use Supabase server client for all data fetching in server components.
- Maintain the dark glassmorphism aesthetic using Tailwind CSS utility classes and custom CSS variables in `globals.css`.
- All database types are defined in `src/types/database.ts` — use these interfaces for explicit type casting on Supabase query results.