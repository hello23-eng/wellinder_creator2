import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <span className="text-wellinder-dark/40 uppercase tracking-[0.3em] text-xs font-semibold block mb-2">Legal</span>
          <h1 className="text-3xl font-serif italic text-wellinder-dark">Terms of Service</h1>
          <p className="text-wellinder-dark/40 text-sm mt-2">Last updated: April 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-wellinder-dark/70 space-y-6 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">1. Programme Overview</h2>
            <p>The Wellinder Creators Programme ("Programme") is operated by Wellinder ("we", "us", "our"). By submitting an application, you agree to these Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">2. Eligibility</h2>
            <p>Applications are currently open to residents of Singapore aged 18 and above. You must have an active TikTok or Instagram account at the time of application.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">3. Application & Selection</h2>
            <p>Submission of an application does not guarantee acceptance into the Programme. We reserve the right to accept or decline any application at our sole discretion. We will notify applicants of our decision by email.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">4. Creator Obligations</h2>
            <p>Accepted creators agree to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Create and publish content in accordance with the mission briefs provided.</li>
              <li>Disclose their participation in the Programme in accordance with applicable advertising guidelines (e.g. #ad or #sponsored).</li>
              <li>Not misrepresent Wellinder products or make unsubstantiated health claims.</li>
              <li>Maintain conduct consistent with Wellinder's brand values.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">5. Product Seeding</h2>
            <p>Products provided to creators remain the property of Wellinder until fulfilled as part of a mission. We reserve the right to request the return of unused products if a creator exits the Programme without completing assigned missions.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">6. Intellectual Property</h2>
            <p>Content you create remains yours. By participating, you grant Wellinder a non-exclusive, royalty-free licence to repost, share, and use your content for marketing purposes with attribution.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">7. Termination</h2>
            <p>We reserve the right to remove a creator from the Programme at any time if they are found to be in breach of these Terms, or if their conduct is deemed harmful to the Wellinder brand.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Wellinder shall not be liable for any indirect, incidental, or consequential damages arising from your participation in the Programme.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">9. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of Singapore.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-wellinder-dark uppercase tracking-widest mb-2">10. Contact</h2>
            <p>For questions regarding these Terms, please contact us at <a href="mailto:hello@wellinder.co.kr" className="underline text-wellinder-dark">hello@wellinder.co.kr</a>.</p>
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
