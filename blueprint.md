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

## **Current Task: Landing Page Enhancements**

### **1. Widen Main Layout**
- **Action:** Increase the `max-w-*` utility classes on main content sections to make the layout wider and more expansive, while maintaining mobile responsiveness. The hero image will be made full-width.

### **2. Update Tier Description**
- **Action:** Modify the description for "The Raw" membership tier.
- **New Text:** "Every jewel begins uncut — your raw potential is where brilliance starts."

### **3. Add Legal Links**
- **Action:** Add a simple footer to the landing page containing "Terms of Service" and "Privacy Policy" links.

### **4. Implement Application Form**
- **Action:** Create a new "Apply" section with a form.
- **Trigger:** The floating "Join the Wellinder Creators" button will smoothly scroll to this form section.
- **Form Fields:**
  - Name (text input)
  - TikTok ID (text input)
  - Instagram ID (text input)
  - Email (email input)
  - Country (select dropdown)
- **Country Logic:**
  - The dropdown will list multiple countries.
  - Form submission will be **enabled only if "Singapore" is selected**.
  - A clear message will inform the user if they select a non-eligible country.

## **Features**
1. **Landing Page ("Apply"):**
   - Hero section with high-quality media.
   - Philosophy section explaining the brand's vision.
   - Membership tier system (The Raw, The Crystal, The Jewel).
   - **(New)** Application form with country-specific submission logic.
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
- The application form state will be managed locally within the `ApplyPage` component using `useState`.
- The country list will be hardcoded for this implementation.

## **Future Enhancements**
- Add more interactive missions.
- Implement form submission to a backend service like Firestore.
- Add more product seeding items and a detailed view for each.
