# Wellinder Creator Hub - Blueprint

## Overview
A premium, jewellery-themed creator community platform. This application serves as the gateway for creators to join the "Diamond Vault", a refined community where rituals are shared and brilliance is cultivated.

## Current Features
- **Premium Design:** Integrated high-end aesthetics with custom fonts (Playfair Display, Inter) and a "wellinder-cream/wellinder-dark" theme.
- **Hero Section:** High-impact visual introduction with an optimized aspect ratio for mobile and desktop.
- **Philosophy Section:** Communicates the core values of the Wellinder community.
- **Jewellery Tier System:** Displays the progression path for creators (Raw, Crystal, Jewel).
- **Application Form:** A custom-styled form for prospective creators, submitting data to the `inquiries` Firestore collection.
- **Secret Vault (Creator Portal):** 
  - Exclusive access for authorized creators.
  - Integration with Google Auth.
  - Dashboard for Product Seeding, Active Missions, and Creator Stats.
- **Firebase Integration:** Real-time data storage and authentication.
- **Supabase Integration:** Real-time backend services for database and authentication (configured via `.env`).
- **Responsive Navigation:** Fixed header with a mobile-friendly menu and consistent branding.

## Tech Stack
- **React (Vite)**
- **Tailwind CSS v4** (with @theme blocks)
- **Framer Motion / motion/react** (for sophisticated animations)
- **Lucide React** (for premium iconography)
- **Firebase** (Auth & Firestore)
- **Supabase** (Client library installed and configured)

## Implementation Details
- **Unified Source:** The application logic is primarily contained within `src/App.tsx` for simplicity and performance, supported by `src/auth.tsx` for context management.
- **Theme Definition:** Custom colors and fonts are defined in `src/index.css` using Tailwind v4 syntax.
- **Error Handling:** Global `ErrorBoundary` implemented to ensure a smooth user experience.

## Recent Changes
- **Full Design Integration:** Replaced the previous codebase with the complete design from the `wellinder_-the-diamond-vault (2)` folder.
- **Form Completion:** Re-implemented the application form using the `inquiries` schema.
- **Linting & Optimization:** Cleaned up unused variables and refined the code structure for better maintainability.
- **Auth Separation:** Moved authentication context to a separate file to support Fast Refresh and cleaner component logic.
