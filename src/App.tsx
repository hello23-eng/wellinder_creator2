import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Instagram, Send, Gem, Lock, LayoutDashboard, ShoppingBag, Users, Sparkles, Diamond, LogOut } from 'lucide-react';
import { useState } from 'react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuth, AuthProvider } from './AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

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
        className="p-2 hover:bg-wellinder-dark/5 rounded-full transition-colors"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white border-b border-wellinder-dark/10 p-8 shadow-xl"
          >
            <nav className="flex flex-col gap-6 text-center">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-xl font-serif hover:text-wellinder-gold transition-colors">Apply</Link>
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
  if (location.pathname !== '/') return null;

  return (
    <div className="fixed bottom-0 left-0 w-full p-6 z-40">
      <div className="max-w-md mx-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
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

const ApplyPage = () => {
  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section - Intact Aspect Ratio */}
      <section className="relative w-full bg-wellinder-dark overflow-hidden">
        <div className="w-full aspect-video">
          <img
            src="https://i.ibb.co/XZq7R5PV/0314-1.gif"
            alt="The Diamond Vault"
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-black/5" />
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 bg-wellinder-cream">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-wellinder-dark uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">Our Philosophy</span>
          <h2 className="text-3xl md:text-4xl font-serif mb-8 italic text-wellinder-dark">"Wellinder: Wellness in wonder."</h2>
          <div className="text-wellinder-dark/70 leading-relaxed text-lg space-y-6">
            <p className="font-medium text-wellinder-dark">We believe.</p>
            <p>
              That life is transformed not by grand gestures,<br />
              but by the power of small daily routines.
            </p>
            <p>
              Just as a raw stone is refined into a brilliant jewel,<br />
              human beauty begins to radiate through consistent, mindful care.
            </p>
            <p>
              WELLINDER stands with creators who cherish their own routines<br />
              and dare to share those stories with the world.
            </p>
            <p>
              If your routine can become an inspiration to others,<br />
              we invite you to begin your brilliant journey with us.
            </p>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-24 px-6 bg-wellinder-cream">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-16 text-wellinder-dark">The Jewellery Tier System</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'The Raw',
                desc: 'Your journey begins here — a natural origin with boundless potential.',
                icon: <Diamond className="w-8 h-8 text-wellinder-dark" />,
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
    </div>
  );
};

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
                <div className="bg-wellinder-dark h-full w-[75%]"></div>
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
      <AuthProvider>
        <Router>
          <div className="relative">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<ApplyPage />} />
                <Route path="/portal" element={<PortalPage />} />
              </Routes>
            </main>
            <FooterCTA />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}