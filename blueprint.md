# **Project Blueprint: Wellinder Creator Hub**

## **Overview**
A premium creator platform for Wellinder, focusing on wellness, beauty, and daily routines. The application features a landing page for applications ("The Diamond Vault") and a creator-exclusive dashboard ("The Jewels Dashboard").

## **Design Philosophy**
- **Typography:** Expressive serif ("Playfair Display") for headlines and clean sans-serif ("Inter") for body text.
- **Color Palette:**
  - `wellinder-dark` (#1A1A1A): Primary text and dark backgrounds.
  - `wellinder-cream` (#F5F5F4): Primary background for a clean, premium feel.
  - `wellinder-gold` (#1A1A1A): Accent color.
  - `wellinder-champagne` (#FDF5E6): Soft background accent.
- **Visual Effects:** 
  - Glassmorphism for the header.
  - Smooth animations using `motion`.
  - Premium textures and subtle shadows for cards.
  - High-quality iconography using `lucide-react`.

## **Features**
1. **Landing Page ("Apply"):**
   - Hero section with high-quality media.
   - Philosophy section explaining the brand's vision.
   - Membership tier system (The Raw, The Crystal, The Jewel).
2. **Creator Portal ("The Jewels"):**
   - Google Authentication via Firebase Auth.
   - Dashboard with stats, product seeding, and active missions.
   - Dynamic user role management (Admin/Client) via Firestore.
3. **Core Infrastructure:**
   - Firebase (Auth, Firestore) for backend.
   - React Router for navigation.
   - Tailwind CSS 4 for modern, utility-first styling.
   - Centralized Auth Context for state management.
   - Global Error Boundary for application stability.

## **Project Structure**
- `src/App.tsx`: Main routing and layout.
- `src/AuthContext.tsx`: Firebase authentication context and hook.
- `src/components/ErrorBoundary.tsx`: Global error handling component.
- `src/firebase.ts`: Firebase initialization and connection test.
- `src/index.css`: Tailwind 4 theme and global styles.
- `firebase-applet-config.json`: Firebase configuration.

## **Implementation Notes**
- **Tailwind 4:** Configured via `@tailwindcss/vite` plugin. No `tailwind.config.js` needed.
- **Motion:** Used for smooth entry animations and interactive hover effects.
- **Firebase:** Automatic profile creation in Firestore on first sign-in.

## **Future Enhancements**
- Add more interactive missions.
- Implement a direct application form submission to Firestore.
- Add more product seeding items and a detailed view for each.
