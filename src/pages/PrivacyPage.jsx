import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <span className="text-wellinder-dark/40 uppercase tracking-[0.3em] text-xs font-semibold block mb-2">Legal</span>
          <h1 className="text-3xl font-serif italic text-wellinder-dark">Privacy Policy</h1>
          <p className="text-wellinder-dark/40 text-sm mt-2">Last updated: April 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-wellinder-dark/70 space-y-6 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">1. Who We Are</h2>
            <p>Wellinder operates the Wellinder Creators Programme. This Privacy Policy explains how we collect, use, and protect your personal data when you apply to or participate in the Programme.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">2. Data We Collect</h2>
            <p>When you submit an application, we collect:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>TikTok and/or Instagram handle</li>
              <li>Country of residence</li>
              <li>IP address (for fraud and spam prevention only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">3. How We Use Your Data</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Review and process your application.</li>
              <li>Contact you regarding the outcome of your application.</li>
              <li>Manage your participation in the Programme if accepted.</li>
              <li>Prevent spam and abuse of our application system.</li>
            </ul>
            <p className="mt-2">We do not use your data for advertising or sell it to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">4. Data Storage</h2>
            <p>Your data is stored securely using Supabase, a cloud database provider. Data is stored in Singapore-region servers where possible. We retain application data for up to 12 months from the date of submission.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">5. Your Rights</h2>
            <p>Under Singapore's Personal Data Protection Act (PDPA), you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Withdraw consent and request deletion of your data.</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at <a href="mailto:hello@wellinder.club" className="underline text-wellinder-dark">hello@wellinder.club</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">6. Cookies</h2>
            <p>We use minimal analytics to understand how visitors interact with our website. No personally identifiable information is collected through cookies.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">7. Third-Party Services</h2>
            <p>We use the following third-party services to operate the Programme:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Supabase</strong> — database and authentication</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
            </ul>
            <p className="mt-2">Each service operates under its own privacy policy.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">8. Contact</h2>
            <p>For privacy-related enquiries, please contact us at <a href="mailto:hello@wellinder.club" className="underline text-wellinder-dark">hello@wellinder.club</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-wellinder-dark/10">
          <Link to="/apply" className="text-sm text-wellinder-dark/40 hover:text-wellinder-dark transition-colors underline">
            ← Back to Application
          </Link>
        </div>
      </div>
    </div>
  );
}
