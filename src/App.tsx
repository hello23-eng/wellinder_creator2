import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Instagram, Send, Gem, Lock, LayoutDashboard, ShoppingBag, Users, Sparkles, Diamond, LogOut, AlertCircle, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// --- Firebase Context & Error Boundary ---

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-wellinder-cream p-6 text-center">
          <div className="max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-serif mb-2">Something went wrong</h1>
            <p className="text-wellinder-dark/60 mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-wellinder-dark text-white px-8 py-3 rounded-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: 'client',
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error("Error checking or creating user doc:", err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Components ---

const DiamondIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 3h12l4 6-10 12L2 9z" fill="white" />
    <path d="M11 3v18" />
    <path d="M2 9h20" />
    <path d="M6 3l5 6 7-6" />
  </svg>
);

const RawDiamondIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
  >
    <path d="M12 2L22 12L12 22L2 12L12 2Z" />
  </svg>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-wellinder-dark/5">
      <Link to="/" className="flex items-center gap-4 group">
        <DiamondIcon className="w-8 h-8 md:w-10 md:h-10 text-wellinder-dark transition-transform group-hover:rotate-12" />
        <div className="flex flex-col">
          <span className="text-lg md:text-2xl font-serif tracking-tighter text-wellinder-dark leading-none">Join Wellinder Creators</span>
          <span className="text-[9px] md:text-[11px] tracking-[0.2em] text-wellinder-dark/50 mt-1 font-medium">Share your rituals. Inspire others.</span>
        </div>
      </Link>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-wellinder-dark/5 rounded-full transition-colors md:hidden"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <nav className="hidden md:flex items-center gap-8">
        <Link to="/" className="text-sm font-medium hover:text-wellinder-gold transition-colors">Home</Link>
        <Link to="/portal" className="text-sm font-medium hover:text-wellinder-gold transition-colors">Creator Portal</Link>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white border-b border-wellinder-dark/10 p-8 shadow-xl md:hidden"
          >
            <nav className="flex flex-col gap-6 text-center">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-xl font-serif hover:text-wellinder-gold transition-colors">Home</Link>
              <Link to="/portal" onClick={() => setIsOpen(false)} className="text-xl font-serif hover:text-wellinder-gold transition-colors">Creator Portal</Link>
              <div className="pt-4 border-t border-wellinder-dark/5 flex justify-center gap-6">
                <Instagram className="w-5 h-5 opacity-50" />
                <Send className="w-5 h-5 opacity-50" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const FooterCTA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname.startsWith('/apply') || location.pathname.startsWith('/portal')) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full p-6 z-40">
      <div className="max-w-md mx-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/apply')}
          className="w-full bg-wellinder-dark text-white py-4 rounded-full font-sans font-semibold tracking-wide shadow-2xl flex items-center justify-center gap-2"
        >
          Join the Wellinder Creators
        </motion.button>
        <p className="text-center text-[10px] uppercase tracking-widest mt-3 text-wellinder-dark/60 font-medium">
          Currently accepting applications for Singapore
        </p>
      </div>
    </div>
  );
};

// --- Pages ---
const HomePage = () => {
  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section */}
      <section className="relative w-full bg-wellinder-dark overflow-hidden">
        <div className="w-full h-[85vh] md:h-auto md:aspect-video">
          <img 
            src="https://i.ibb.co/0Vq61G3t/Gemini-Generated-Image-xwsfv7xwsfv7xwsf.png" 
            alt="Wellinder creator with flowers"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-black/5" />
      </section>

      {/* Philosophy Section */}
      <section className="py-20 md:py-24 px-6 bg-wellinder-cream">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-wellinder-dark uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">Our Philosophy</span>
          <h2 className="text-2xl md:text-3xl font-serif mb-8 italic text-wellinder-dark">Wellinder: Wellness in wonder.</h2>
          <div className="text-wellinder-dark/70 leading-relaxed text-base md:text-lg space-y-6">
            <p className="font-medium text-wellinder-dark">We believe.</p>
            <p>That life is transformed not by grand gestures, but by the power of small daily rituals.</p>
            <p>Just as a raw stone is refined into a brilliant jewel, human beauty begins to radiate through consistent, mindful care.</p>
            <p>WELLINDER stands with creators who cherish their own rituals and dare to share those stories with the world.</p>
            <p>If your ritual can become an inspiration to others, we invite you to begin your brilliant journey with us.</p>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-24 px-6 bg-wellinder-cream">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif text-center mb-16 text-wellinder-dark">The Jewellery Tier System</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'The Raw', 
                desc: <>Your journey begins here — a<br />natural origin with boundless<br />potential.</>,
                icon: <RawDiamondIcon className="w-8 h-8 text-wellinder-dark" />,
                status: 'THE ORIGIN'
              },
              { 
                title: 'The Crystal', 
                desc: 'Growth begins to take shape. Radiating clarity and ambition.',
                icon: <Sparkles className="w-8 h-8 text-wellinder-dark" />,
                status: 'THE GROWTH'
              },
              { 
                title: 'The Jewel', 
                desc: 'The pinnacle of brilliance. A true masterpiece within our community.',
                icon: (
                  <div className="relative inline-block">
                    <Gem className="w-8 h-8 text-wellinder-dark fill-wellinder-dark/10 drop-shadow-[0_0_12px_rgba(0,0,0,0.15)]" />
                    <motion.div 
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 45, 90] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-1 -right-1 text-[10px]"
                    >
                      ✨
                    </motion.div>
                    <motion.div 
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, -45, -90] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute -bottom-1 -left-1 text-[8px]"
                    >
                      ✨
                    </motion.div>
                  </div>
                ),
                status: 'THE MASTERPIECE'
              }
            ].map((tier, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-wellinder-dark/5 hover:border-wellinder-dark/20 transition-all hover:shadow-xl group">
                <div className="mb-6 transform transition-transform group-hover:scale-110 duration-500">{tier.icon}</div>
                <h3 className="text-xl font-serif mb-2 text-wellinder-dark">{tier.title}</h3>
                <p className="text-[10px] text-wellinder-dark/40 uppercase tracking-widest font-bold mb-4">{tier.status}</p>
                <p className="text-wellinder-dark/60 text-sm leading-relaxed italic">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Benefits Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-4 text-wellinder-dark">Creator Benefits</h2>
          <p className="text-center text-wellinder-dark/50 mb-16 font-light">Our commitment to your growth and brilliance.</p>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-wellinder-cream rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-wellinder-dark" />
              </div>
              <div>
                <h3 className="text-lg font-serif mb-2 text-wellinder-dark">Product Seeding</h3>
                <p className="text-wellinder-dark/60 text-sm leading-relaxed">Receive a curated selection of our finest products to experience and share with your audience, free of charge.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-wellinder-cream rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-wellinder-dark" />
              </div>
              <div>
                <h3 className="text-lg font-serif mb-2 text-wellinder-dark">Exclusive Events</h3>
                <p className="text-wellinder-dark/60 text-sm leading-relaxed">Get invited to private workshops, launch parties, and creator retreats designed to inspire and connect.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-wellinder-cream rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-wellinder-dark" />
              </div>
              <div>
                <h3 className="text-lg font-serif mb-2 text-wellinder-dark">Growth Support</h3>
                <p className="text-wellinder-dark/60 text-sm leading-relaxed">Access our team of experts for personalized guidance on content strategy, audience engagement, and monetization.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-wellinder-cream rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-wellinder-dark" />
              </div>
              <div>
                <h3 className="text-lg font-serif mb-2 text-wellinder-dark">Community & Collaboration</h3>
                <p className="text-wellinder-dark/60 text-sm leading-relaxed">Join a vibrant community of like-minded creators. Collaborate on exciting projects and build lasting relationships.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ApplyPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    tiktokHandle: '',
    instagramHandle: '',
    email: '',
    country: '',
    agreedToTerms: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const canSubmit = formData.country === 'Singapore' && formData.agreedToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const inquiryId = `application_${Date.now()}`;
      await setDoc(doc(db, 'applications', inquiryId), {
        ...formData,
        status: 'new',
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Diamond className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-2xl font-serif text-wellinder-dark mb-4 italic">Application Received</h3>
          <p className="text-wellinder-dark/60 leading-relaxed">
            Thank you for your interest. We've received your application and will be in touch shortly.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-8 text-wellinder-dark/50 hover:text-wellinder-dark transition-colors text-sm font-medium"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 md:pt-32 pb-12 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] font-semibold text-wellinder-dark/50 mb-4">Application</p>
          <p className="font-serif text-lg md:text-xl text-wellinder-dark/80 leading-relaxed">
            If your daily ritual can inspire others, we invite you to begin your brilliant transformation with us.
          </p>
          <h1 className="font-serif text-3xl md:text-5xl text-wellinder-dark mt-6 italic">Join the Wellness Collective</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/40 ml-4">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Tan Wei Kiat"
              className="w-full bg-white border-gray-200 rounded-2xl px-6 py-4 focus:border-wellinder-dark/20 focus:ring-4 focus:ring-wellinder-dark/5 outline-none transition-all placeholder:text-wellinder-dark/20"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/40 ml-4">TikTok Handle</label>
            <input
              type="text"
              required
              placeholder="@username"
              className="w-full bg-white border-gray-200 rounded-2xl px-6 py-4 focus:border-wellinder-dark/20 focus:ring-4 focus:ring-wellinder-dark/5 outline-none transition-all placeholder:text-wellinder-dark/20"
              value={formData.tiktokHandle}
              onChange={(e) => setFormData({ ...formData, tiktokHandle: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/40 ml-4">Instagram Handle</label>
            <input
              type="text"
              required
              placeholder="@username"
              className="w-full bg-white border-gray-200 rounded-2xl px-6 py-4 focus:border-wellinder-dark/20 focus:ring-4 focus:ring-wellinder-dark/5 outline-none transition-all placeholder:text-wellinder-dark/20"
              value={formData.instagramHandle}
              onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/40 ml-4">Email Address</label>
            <input
              type="email"
              required
              placeholder="email@example.com"
              className="w-full bg-white border-gray-200 rounded-2xl px-6 py-4 focus:border-wellinder-dark/20 focus:ring-4 focus:ring-wellinder-dark/5 outline-none transition-all placeholder:text-wellinder-dark/20"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/40 ml.md-4">Country</label>
            <select
              required
              className="w-full bg-white border-gray-200 rounded-2xl px-6 py-4 appearance-none focus:border-wellinder-dark/20 focus:ring-4 focus:ring-wellinder-dark/5 outline-none transition-all"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            >
              <option value="" disabled>Select your country</option>
              <option value="Singapore">Singapore (Now Available)</option>
              <option value="Japan" disabled>Japan (Coming Soon)</option>
              <option value="South Korea" disabled>South Korea (Coming Soon)</option>
              <option value="Malaysia" disabled>Malaysia (Coming Soon)</option>
              <option value="Thailand" disabled>Thailand (Coming Soon)</option>
              <option value="Indonesia" disabled>Indonesia (Coming Soon)</option>
              <option value="Philippines" disabled>Philippines (Coming Soon)</option>
              <option value="Vietnam" disabled>Vietnam (Coming Soon)</option>
              <option value="Taiwan" disabled>Taiwan (Coming Soon)</option>
              <option value="Hong Kong" disabled>Hong Kong (Coming Soon)</option>
              <option value="Australia" disabled>Australia (Coming Soon)</option>
              <option value="United States" disabled>United States (Coming Soon)</option>
              <option value="Canada" disabled>Canada (Coming Soon)</option>
              <option value="United Kingdom" disabled>United Kingdom (Coming Soon)</option>
              <option value="India" disabled>India (Coming Soon)</option>
              <option value="United Arab Emirates" disabled>United Arab Emirates (Coming Soon)</option>
              <option value="Germany" disabled>Germany (Coming Soon)</option>
              <option value="France" disabled>France (Coming Soon)</option>
              <option value="Spain" disabled>Spain (Coming Soon)</option>
              <option value="Brazil" disabled>Brazil (Coming Soon)</option>
              <option value="Mexico" disabled>Mexico (Coming Soon)</option>
            </select>
            <p className="text-xs text-wellinder-dark/50 pt-2 px-4">* We are currently prioritizing creators based in Singapore.</p>
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex items-start gap-3">
                <input 
                    type="checkbox" 
                    id="terms"
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="mt-1 h-5 w-5 rounded-md border-gray-300 text-wellinder-dark focus:ring-wellinder-dark/50"
                />
                <label htmlFor="terms" className="text-sm text-wellinder-dark/70">
                    I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-wellinder-dark">Terms of Service</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-wellinder-dark">Privacy Policy</Link>.
                </label>
            </div>

            <motion.button
              type="submit"
              disabled={!canSubmit || loading}
              whileHover={{ scale: canSubmit ? 1.02 : 1 }}
              whileTap={{ scale: canSubmit ? 0.98 : 1 }}
              className={`w-full py-4 rounded-full font-sans font-semibold tracking-wide transition-colors duration-300 ${
                canSubmit ? "bg-wellinder-dark text-white shadow-lg" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                'Submit Application'
              )}
            </motion.button>
          </div>
        </form>
        <button onClick={() => navigate(-1)} className="w-full text-center mt-6 text-sm text-wellinder-dark/50 hover:text-wellinder-dark">
            Back
        </button>
      </div>
    </div>
  );
};

const PolicySection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
        <h2 className="text-xl font-serif text-wellinder-dark mb-4">{title}</h2>
        <div className="space-y-4 text-wellinder-dark/80 leading-relaxed text-sm">
            {children}
        </div>
    </div>
);

const PrivacyPolicyPage = () => (
    <div className="min-h-screen bg-wellinder-cream pt-24 md:pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-wellinder-dark mb-2">Privacy Policy</h1>
            <p className="text-wellinder-dark/50 mb-12">Last Updated: August 1, 2024</p>

            <PolicySection title="Introduction">
                <p>Welcome to Wellinder. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@wellinder.com.</p>
                <p>When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously. In this privacy notice, we describe our privacy policy. We seek to explain to you in the clearest way possible what information we collect, how we use it and what rights you have in relation to it.</p>
            </PolicySection>

            <PolicySection title="Information We Collect">
                <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website (such as posting messages in our online forums or entering competitions, contests or giveaways) or otherwise contacting us.</p>
                <p>The personal information that we collect depends on the context of your interactions with us and the website, the choices you make and the products and features you use. The personal information we collect can include the following: Name and Contact Data, Credentials, and Social Media Login Data.</p>
            </PolicySection>

            <PolicySection title="How We Use Your Information">
                <p>We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>To facilitate account creation and logon process.</li>
                    <li>To send you marketing and promotional communications.</li>
                    <li>To send administrative information to you.</li>
                    <li>To fulfill and manage your orders.</li>
                    <li>To post testimonials.</li>
                    <li>To deliver targeted advertising to you.</li>
                </ul>
            </PolicySection>
            
            <PolicySection title="International Data Transfers">
                <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.</p>
                <p>If you are located outside Singapore and choose to provide information to us, please note that we transfer the data, including Personal Data, to Singapore and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>
            </PolicySection>

            <PolicySection title="Your Data Protection Rights (GDPR)">
                <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. Wellinder aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.</p>
                <p>You have the right to: access, update or to delete the information we have on you; the right of rectification; the right to object; the right of restriction; the right to data portability; and the right to withdraw consent.</p>
            </PolicySection>

            <Link to="/apply" className="text-wellinder-dark/50 hover:text-wellinder-dark mt-8 inline-block">
                &larr; Back to Application
            </Link>
        </div>
    </div>
);

const TermsOfServicePage = () => (
    <div className="min-h-screen bg-wellinder-cream pt-24 md:pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-serif text-wellinder-dark mb-2">Terms of Service</h1>
            <p className="text-wellinder-dark/50 mb-12">Last Updated: August 1, 2024</p>

            <PolicySection title="1. Agreement to Terms">
                <p>By using the services of Wellinder ('we', 'us', or 'our'), you agree to be bound by these Terms of Service. If you do not agree to these Terms, you may not use our services. We may amend the Terms at any time by posting the amended terms on our site. We may or may not post notices on the homepage when such changes occur.</p>
            </PolicySection>

            <PolicySection title="2. User Accounts">
                <p>As a user of the Website, you may be asked to register with us and provide private information. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information. You are also responsible for all activities that occur under your account or password.</p>
            </PolicySection>

            <PolicySection title="3. Intellectual Property Rights">
                <p>The Website and its original content, features, and functionality are owned by Wellinder and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. This applies to all content, including text, graphics, logos, and user-generated content that is licensed to us.</p>
            </PolicySection>

            <PolicySection title="4. Prohibited Activities">
                <p>You may not access or use the Website for any purpose other than that for which we make the Website available. Prohibited activity includes, but is not limited to: commercial endeavors, criminal or tortious activity, tricking or misleading other users, or using the Website to harass, abuse, or harm another person.</p>
            </PolicySection>

            <PolicySection title="5. Termination">
                <p>We may terminate your use of the Website or our services at any time for any reason, with or without notice. You may terminate your account by following the instructions on the Website. Upon termination, your right to use the service will immediately cease.</p>
            </PolicySection>
            
            <Link to="/apply" className="text-wellinder-dark/50 hover:text-wellinder-dark mt-8 inline-block">
                &larr; Back to Application
            </Link>
        </div>
    </div>
);

const PortalPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wellinder-cream">
        <div className="w-8 h-8 border-4 border-wellinder-dark border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wellinder-cream px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-wellinder-dark/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-wellinder-dark/10">
            <Lock className="w-8 h-8 text-wellinder-dark" />
          </div>
          <h2 className="text-3xl font-serif text-wellinder-dark mb-4 italic">Secret Vault</h2>
          <p className="text-wellinder-dark/50 mb-8 font-light">This portal is exclusive to 'The Jewels'. Please sign in with your authorized account.</p>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full bg-wellinder-dark text-white py-4 rounded-full font-sans font-semibold tracking-wide shadow-lg flex items-center justify-center gap-3"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </button>
          </div>
          <Link to="/" className="inline-block mt-8 text-wellinder-dark/30 hover:text-wellinder-dark/60 text-sm transition-colors">
            Return to Entrance
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-wellinder-dark/40 uppercase tracking-[0.3em] text-xs font-semibold mb-2 block">The Jewels Dashboard</span>
            <h1 className="text-4xl font-serif italic text-wellinder-dark">Welcome back, {user.displayName?.split(' ')[0] || 'Creator'}.</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-white rounded-full border border-wellinder-dark/5 text-sm font-medium flex items-center gap-2 hover:bg-wellinder-dark/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <div className="px-4 py-2 bg-white rounded-full border border-wellinder-dark/5 text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active Season
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-wellinder-dark/5">
              <h3 className="text-xl font-serif mb-6 flex items-center gap-2 text-wellinder-dark">
                <ShoppingBag className="w-5 h-5 text-wellinder-dark" />
                Product Seeding
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Diamond Radiance Serum', points: '500 pts', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=500' },
                  { name: 'Crystal Clarity Mist', points: '350 pts', img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=500' }
                ].map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-3">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h4 className="font-medium text-sm text-wellinder-dark">{item.name}</h4>
                    <p className="text-xs text-wellinder-dark/60 font-bold">{item.points}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-wellinder-dark/5">
              <h3 className="text-xl font-serif mb-6 flex items-center gap-2 text-wellinder-dark">
                <LayoutDashboard className="w-5 h-5 text-wellinder-dark" />
                Active Missions
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'TikTok Showcase: The Vault Reveal', deadline: '2 days left', reward: '$50 + 10% Comm' },
                  { title: 'Instagram Reel: Brilliant Shine', deadline: '5 days left', reward: '$30 + 10% Comm' }
                ].map((mission, i) => (
                  <div key={i} className="p-4 bg-wellinder-cream rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-sm text-wellinder-dark">{mission.title}</h4>
                      <p className="text-[10px] text-wellinder-dark/40 uppercase tracking-widest font-bold">{mission.deadline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-wellinder-dark">{mission.reward}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-wellinder-dark text-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                Your Stats
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Total Earnings</p>
                  <p className="text-3xl font-serif">$1,240.50</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Conversion Rate</p>
                  <p className="text-3xl font-serif">4.8%</p>
                </div>
                <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold transition-colors">
                  Withdraw Funds
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-wellinder-dark/5">
              <h3 className="text-lg font-serif mb-4 text-wellinder-dark">Vault Status</h3>
              <div className="w-full bg-wellinder-cream h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-wellinder-dark h-full w-[75%]" />
              </div>
              <p className="text-xs text-wellinder-dark/60 leading-relaxed">
                You are <strong>75%</strong> towards maintaining your 'Jewel' status for next season. Keep it up!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <Router>
          <div className="relative">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/apply" element={<ApplyPage />} />
                <Route path="/portal" element={<PortalPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
              </Routes>
            </main>
            <FooterCTA />
          </div>
        </Router>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
